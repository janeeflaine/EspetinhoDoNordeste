import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { Product, Accompaniment } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedAccompaniments?: Accompaniment[]) => void;
  accompaniments: Accompaniment[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  accompaniments
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAccs, setSelectedAccs] = useState<string[]>([]); // Store IDs

  // Filter relevant accompaniments
  const availableAccs = product
    ? accompaniments.filter(a => a.categoryId === product.categoryId && a.available)
    : [];

  // Price Calculation
  const accTotal = selectedAccs.reduce((sum, id) => {
    const acc = availableAccs.find(a => a.id === id);
    return sum + (acc ? acc.price : 0);
  }, 0);

  const unitPrice = (product?.price || 0) + accTotal;
  const total = unitPrice * quantity;

  // Reset when modal opens for a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAccs([]);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const toggleAccompaniment = (id: string) => {
    setSelectedAccs(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleAdd = () => {
    const finalAccompaniments = selectedAccs.map(id => availableAccs.find(a => a.id === id)).filter(Boolean) as Accompaniment[];
    onAddToCart(product, quantity, finalAccompaniments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Mobile Optimized "One Screen" Layout */}
      <div
        className="bg-zinc-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden relative shadow-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col animate-slide-up sm:animate-scale-in"
        style={{ opacity: 1, transform: 'none' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. Header Híbrido (Compacto) */}
        <div className="flex gap-4 p-4 border-b border-zinc-800 shrink-0 bg-zinc-900/95 backdrop-blur-sm relative z-0">
          {/* Imagem Quadrada Fixa */}
          <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md border border-zinc-800/50 flex-shrink-0 bg-zinc-800">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {product.icon}
              </div>
            )}
          </div>

          {/* Informações Principais */}
          <div className="flex flex-col justify-center py-1 pr-6 flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-2">{product.name}</h2>
            <p className="text-xl font-bold text-amber-500">R$ {product.price.toFixed(2)}</p>
            {product.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-snug">{product.description}</p>
            )}
          </div>
        </div>

        {/* 2. Área de Conteúdo (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {availableAccs.length > 0 ? (
            <div className="space-y-3">
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
                Adicionais
                <span className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-md border border-zinc-700">Opcional</span>
              </label>

              <div className="space-y-1.5"> {/* Gap Reduzido (Compact Density) */}
                {availableAccs.filter(a => a.available).map(acc => {
                  const isSelected = selectedAccs.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccompaniment(acc.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${isSelected
                        ? 'bg-red-900/10 border-red-600/50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'bg-red-600 border-red-600' : 'border-zinc-600'
                          }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-zinc-400'}`}>{acc.name}</span>
                      </div>
                      <span className={`text-xs font-semibold ${acc.price > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {acc.price > 0 ? `+ R$ ${acc.price.toFixed(2)}` : 'Grátis'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm gap-2 opacity-50 min-h-[150px]">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <Check className="w-6 h-6 text-zinc-600" />
              </div>
              <p>Sem adicionais disponíveis</p>
            </div>
          )}
        </div>

        {/* 3. Footer de Ação (Fixo) */}
        <div className="p-4 border-t border-zinc-800 bg-black/40 backdrop-blur-xl shrink-0 pb-safe-area mt-auto">
          {/* Resumo de Preço (Opcional visual, já esta no header, mas bom para total final) */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-zinc-400 text-xs font-medium">Total do Item</span>
            <span className="text-lg font-bold text-white">R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3 h-12">
            {/* Contador */}
            <div className="flex items-center bg-zinc-800 rounded-xl px-2 w-32 justify-between border border-zinc-700/50">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-white text-lg tabular-nums">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center text-white hover:text-red-500 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Botão Adicionar */}
            <button
              onClick={handleAdd}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 active:scale-95 transition-all text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};