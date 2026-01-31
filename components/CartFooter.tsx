import React from 'react';
import { ShoppingBag, Send } from 'lucide-react';
import { CartItem } from '../types';
import { PHONE_NUMBER } from '../constants';

interface CartFooterProps {
  items: CartItem[];
  onOpenCart: () => void;
}

export const CartFooter: React.FC<CartFooterProps> = ({ items, onOpenCart }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the cart when clicking checkout
    if (items.length === 0) return;

    let message = `*Olá! Gostaria de fazer um pedido:*\n\n`;
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.selectedAccompaniments && item.selectedAccompaniments.length > 0) {
        const accs = item.selectedAccompaniments.map(acc => {
          const priceStr = acc.price > 0 ? `(+R$ ${acc.price.toFixed(2)})` : '(Grátis)';
          return `${acc.name} ${priceStr}`;
        }).join(', ');
        message += `   Acomp: ${accs}\n`;
      }
    });
    message += `\n*Total: R$ ${total.toFixed(2)}*`;
    message += `\n\n_Enviado via App Web_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 pb-8 md:pb-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Bag & Total (Clickable to view details) */}
        <div
          onClick={onOpenCart}
          className="flex flex-col cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase font-medium mb-0.5 group-hover:text-zinc-300">
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1.5 bg-red-600 text-[9px] text-white font-bold px-1 rounded-full flex items-center justify-center min-w-[14px] h-[14px]">
                {itemCount}
              </span>
            </div>
            <span>Resumo</span>
          </div>
          <span className="text-[#FD8E00] font-bold text-xl leading-none">
            R$ {total.toFixed(2)}
          </span>
        </div>

        {/* Right Side: Checkout Button */}
        <button
          onClick={handleCheckout}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Pedido</span>
        </button>
      </div>
    </div>
  );
};