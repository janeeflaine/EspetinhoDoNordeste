import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const total = product.price * quantity;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Structure based on user request */}
      <div 
        className="bg-zinc-900 w-full max-w-sm rounded-2xl overflow-hidden relative shadow-2xl max-h-[85vh] flex flex-col animate-scale-in"
        style={{ opacity: 1, transform: 'none' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/70 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="relative w-full aspect-square bg-gradient-to-br from-red-600/20 to-amber-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">{product.icon}</span>
          )}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div>
            <h2 className="text-lg font-bold text-white mb-0.5 line-clamp-2">{product.name}</h2>
            <p className="text-xl font-bold text-amber-400">R$ {product.price.toFixed(2)}</p>
            {product.description && (
                <p className="text-sm text-zinc-500 mt-2">{product.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Quantidade</label>
            <div className="flex items-center justify-center gap-3 bg-zinc-800 rounded-xl p-2.5">
              <button 
                onClick={handleDecrement}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm hover:text-accent-foreground h-9 w-9 rounded-full border-zinc-600 bg-zinc-900 hover:bg-red-600 hover:border-red-600 text-white flex-shrink-0"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
                {quantity}
              </span>
              
              <button 
                onClick={handleIncrement}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 flex justify-between items-center">
              <span className="text-zinc-400 text-xs">Total</span>
              <span className="text-lg font-bold text-amber-400">R$ {total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 px-4 py-2 h-12 w-12 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 shadow-xl shadow-red-600/30 flex-shrink-0"
            >
              <ShoppingCart className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};