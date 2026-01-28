
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
  categoryToEdit?: CategoryItem | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit
}) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setLabel(categoryToEdit.label);
        setIcon(categoryToEdit.icon);
      } else {
        setLabel('');
        setIcon('');
      }
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: categoryToEdit?.id,
      label,
      icon,
      active: categoryToEdit ? categoryToEdit.active : true, // Default to active for new
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-zinc-900 w-full max-w-sm sm:rounded-xl rounded-t-2xl border-t sm:border border-zinc-800 shadow-2xl relative z-10 flex flex-col animate-slide-up sm:animate-scale-in">
        
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
             <h3 className="text-white font-bold text-lg">
                {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
             </h3>
             <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
                <X className="w-5 h-5" />
             </button>
        </div>

        <form id="category-form" onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
                <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="cat-name">
                    Nome da Categoria
                </label>
                <input
                    className="flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 bg-zinc-950 border-zinc-800 text-white"
                    id="cat-name"
                    required
                    placeholder="Ex: Espetinhos"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                />
            </div>

            <div>
                <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block" htmlFor="cat-icon">
                    Ícone (Emoji)
                </label>
                <input
                    className="flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 bg-zinc-950 border-zinc-800 text-white text-center"
                    id="cat-icon"
                    required
                    placeholder="🍢"
                    maxLength={2}
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                />
            </div>
        </form>

        <div className="p-5 border-t border-zinc-800 bg-zinc-900 rounded-b-xl">
            <button
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white shadow h-11 px-4 bg-green-600 hover:bg-green-700 active:scale-95"
                form="category-form"
                type="submit"
            >
                <Save className="h-4 w-4" />
                Salvar
            </button>
        </div>
      </div>
    </div>
  );
};
