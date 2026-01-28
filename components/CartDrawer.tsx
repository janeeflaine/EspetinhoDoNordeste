import React from 'react';
import { X, Trash2, Send } from 'lucide-react';
import { CartItem } from '../types';
import { PHONE_NUMBER } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;

    let message = `*Olá! Gostaria de fazer um pedido:*\n\n`;
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: R$ ${total.toFixed(2)}*`;
    message += `\n\n_Enviado via App Web_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-zinc-900 h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🛒 Seu Pedido
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <span className="text-4xl">🥘</span>
              <p>Seu carrinho está vazio.</p>
              <button 
                onClick={onClose}
                className="text-amber-400 hover:underline"
              >
                Ver cardápio
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700 flex gap-3">
                 <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <span>{item.icon}</span>
                   )}
                 </div>
                 <div className="flex-1">
                   <h3 className="text-sm font-medium text-white line-clamp-1">{item.name}</h3>
                   <p className="text-amber-400 font-bold text-sm mt-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                   
                   <div className="flex items-center gap-3 mt-2">
                     <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700 h-8">
                       <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2.5 text-zinc-400 hover:text-white h-full flex items-center"
                       >
                         -
                       </button>
                       <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                       <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2.5 text-zinc-400 hover:text-white h-full flex items-center"
                       >
                         +
                       </button>
                     </div>
                     <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors ml-auto"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="text-zinc-400">Total</span>
            <span className="font-bold text-amber-400 text-xl">R$ {total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-900/20"
          >
            <Send className="w-5 h-5" />
            Enviar Pedido no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};