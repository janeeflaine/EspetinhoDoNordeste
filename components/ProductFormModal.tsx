
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Save, ChevronDown, Check, RotateCcw, Image as ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Category, Product, CategoryItem } from '../types';
import { getCroppedImg } from '../utils/canvasUtils';

// Note: CATEGORIES constant removed from import as we should receive available categories via props or context.
// However, since this is a stateless functional component asking for minimal refactoring, 
// and the App.tsx is the source of truth, we will need to update App.tsx to pass categories here, 
// OR temporarily import the constant for the type check but we want dynamic behavior.
// Let's modify the Props to accept categories.

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: any) => void;
    productToEdit?: Product | null;
    availableCategories?: CategoryItem[]; // New Prop
}

import { CATEGORIES as INITIAL_CATEGORIES } from '../constants'; // Fallback

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    productToEdit,
    availableCategories = INITIAL_CATEGORIES
}) => {
    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [emoji, setEmoji] = useState('');
    const [category, setCategory] = useState<Category | ''>('');

    // Image & Crop State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const mainFileInputRef = useRef<HTMLInputElement>(null);
    const cropFileInputRef = useRef<HTMLInputElement>(null);


    // Initialize form when modal opens or productToEdit changes
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setName(productToEdit.name);
                setPrice(productToEdit.price.toString());
                setEmoji(productToEdit.icon || '');
                setCategory(productToEdit.category);
                setCroppedImage(productToEdit.image || null);
                setImageSrc(null); // Reset raw image source
                setIsCropping(false);
            } else {
                // Reset for new product
                setName('');
                setPrice('');
                setEmoji('');
                setCategory('');
                setImageSrc(null);
                setCroppedImage(null);
                setIsCropping(false);
            }
        }
    }, [isOpen, productToEdit]);

    // Hook must be called unconditionally
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Early return comes AFTER all hooks
    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
                setZoom(1);
                setCrop({ x: 0, y: 0 }); // Reset crop position
            };
            reader.readAsDataURL(file);
        }
        // Reset input so the same file can be selected again if needed
        if (mainFileInputRef.current) mainFileInputRef.current.value = '';
        if (cropFileInputRef.current) cropFileInputRef.current.value = '';
    };

    const handleAdjustImage = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation();

        // If we have the raw source, use it. 
        // If not (editing existing product), use the current preview as the source to re-crop.
        if (!imageSrc && croppedImage) {
            setImageSrc(croppedImage);
        }
        setIsCropping(true);
    };

    const handleChangeImage = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation();
        if (isCropping) {
            cropFileInputRef.current?.click();
        } else {
            mainFileInputRef.current?.click();
        }
    };

    const handleSaveCrop = async () => {
        try {
            if (imageSrc && croppedAreaPixels) {
                const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
                setCroppedImage(croppedImageBase64);
                setIsCropping(false);
            }
        } catch (e) {
            console.error('Failed to crop image:', e);
            // Fallback: keep using the source if crop fails (e.g., CORS issues with external URLs)
            if (!croppedImage && imageSrc) {
                setCroppedImage(imageSrc);
            }
            setIsCropping(false);
        }
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        // If we were editing an existing image and hit cancel, we don't clear the image.
        // We only revert the "isCropping" state.
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: productToEdit?.id,
            name,
            price: Number(price),
            emoji,
            category,
            image: croppedImage,
        });
        onClose();
    };

    const handleCancelForm = () => {
        onClose();
    }

    // CROP VIEW OVERLAY
    if (isCropping && imageSrc) {
        return (
            <div className="fixed inset-0 z-[130] bg-black/95 flex flex-col items-center justify-center p-4 animate-scale-in">
                <div className="w-full max-w-md flex flex-col h-full max-h-[600px] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
                    {/* Crop Header */}
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                            Ajustar Imagem
                        </h3>
                        <button
                            onClick={handleCancelCrop}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cropper Area */}
                    <div className="relative flex-1 bg-zinc-950 w-full overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            objectFit="contain"
                            // Important for external URLs (like placeholders) to avoid tainted canvas issues
                            mediaProps={{ crossOrigin: 'anonymous' }}
                        />
                    </div>

                    {/* Crop Controls */}
                    <div className="p-6 space-y-6 bg-zinc-900 border-t border-zinc-800 z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-zinc-400 uppercase font-bold tracking-wider">
                                <span>Zoom</span>
                                <span>{zoom.toFixed(1)}x</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                                    className="text-zinc-500 hover:text-white"
                                >
                                    <MinusIcon className="w-4 h-4" />
                                </button>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200"
                                />
                                <button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                    className="text-zinc-500 hover:text-white"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleChangeImage}
                                className="flex-1 px-4 py-3 bg-zinc-800 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Trocar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCrop}
                                className="flex-1 px-4 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                            >
                                <Check className="w-4 h-4" />
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
                {/* Hidden Input for Crop View */}
                <input
                    ref={cropFileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>
        );
    }

    // MAIN FORM VIEW
    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={handleCancelForm}
            />

            <div className="bg-zinc-900 w-full max-w-md sm:rounded-xl rounded-t-2xl border-t sm:border border-zinc-800 shadow-2xl relative z-10 flex flex-col h-[90dvh] sm:h-auto sm:max-h-[85vh] animate-slide-up sm:animate-scale-in">

                {/* Header */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <h3 className="text-white font-bold text-lg">
                        {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button onClick={handleCancelForm} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Image Preview / Trigger */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium leading-none text-zinc-400 block">
                                Imagem do Produto
                            </label>

                            {croppedImage ? (
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-700 group bg-zinc-950">
                                    <img
                                        src={croppedImage}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />

                                    {/* Hover Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <button
                                            type="button"
                                            onClick={handleAdjustImage}
                                            className="w-32 bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-200 flex items-center justify-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            Ajustar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleChangeImage}
                                            className="w-32 bg-zinc-800 text-white border border-zinc-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-zinc-700 flex items-center justify-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200 delay-75"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Trocar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    onClick={handleChangeImage}
                                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-zinc-800 rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all group"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                                        </div>
                                        <p className="mb-1 text-sm text-zinc-300 font-medium">
                                            Toque para adicionar foto
                                        </p>
                                        <p className="text-xs text-zinc-500">JPG ou PNG</p>
                                    </div>
                                </label>
                            )}
                            {/* Main View Hidden Input (triggered by label or button) */}
                            <input
                                ref={mainFileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="name">
                                    Nome do Produto
                                </label>
                                <input
                                    className="flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 bg-zinc-950 border-zinc-800 text-white"
                                    id="name"
                                    required
                                    placeholder="Ex: Espetinho de Frango"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="price">
                                        Preço (R$)
                                    </label>
                                    <input
                                        type="number"
                                        className="flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 bg-zinc-950 border-zinc-800 text-white"
                                        id="price"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="emoji">
                                        Emoji
                                    </label>
                                    <input
                                        className="flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 bg-zinc-950 border-zinc-800 text-white text-center"
                                        id="emoji"
                                        placeholder="🍢"
                                        value={emoji}
                                        onChange={(e) => setEmoji(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="category_id">
                                    Categoria
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        className="flex h-11 w-full items-center justify-between whitespace-nowrap rounded-lg border px-3 py-2 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-600 bg-zinc-950 border-zinc-800 text-white appearance-none"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {availableCategories.filter(c => c.id !== 'Todos').map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 opacity-50 pointer-events-none text-white" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-zinc-800 bg-zinc-900 shrink-0 mb-safe-area">
                    <div className="flex gap-3">
                        <button
                            className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white shadow h-11 px-4 bg-green-600 hover:bg-green-700 active:scale-95"
                            form="product-form"
                            type="submit"
                        >
                            <Save className="h-4 w-4" />
                            {productToEdit ? 'Salvar Alterações' : 'Salvar Produto'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Icons not imported in main list
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
)
const MinusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /></svg>
)
