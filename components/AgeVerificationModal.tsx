import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onConfirm,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
      />

      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl animate-scale-in text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          Verificação de Idade
        </h2>
        
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Esta categoria contém bebidas alcoólicas.<br/>
          <strong className="text-white">Você tem 18 anos ou mais?</strong>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDeny}
            className="flex items-center justify-center px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/20"
          >
            Não
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-900/20"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
};