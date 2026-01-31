import React from 'react';
import { Clock, Lock, ShieldCheck } from 'lucide-react';
import { StoreMessage } from '../types';

import { SocialFooter } from './SocialFooter';

interface StoreClosedScreenProps {
    message: StoreMessage | null;
    onAdminLogin: () => void;
}

export const StoreClosedScreen: React.FC<StoreClosedScreenProps> = ({ message, onAdminLogin }) => {
    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {/* Decorative Icon */}
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-800 shadow-2xl shadow-red-900/10">
                <Clock className="w-10 h-10 text-zinc-500" />
            </div>

            {/* Main Content */}
            <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                    Loja Fechada
                </h1>

                <p className="text-zinc-400 text-lg leading-relaxed">
                    {message?.message || 'No momento não estamos recebendo pedidos. Voltamos em breve!'}
                </p>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/50 rounded-full mt-6">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-sm font-medium uppercase tracking-wider">Fechado Agora</span>
                </div>

                {/* Social Media Links */}
                <div className="mt-8 pt-8 border-t border-zinc-900/50 w-full">
                    <SocialFooter className="scale-90" />
                </div>
            </div>

            {/* Admin Backdoor (Discreet Footer) */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
                <button
                    onClick={onAdminLogin}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 text-xs px-4 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                    <Lock className="w-3 h-3" />
                    <span>Acesso Administrativo</span>
                </button>
            </div>
        </div>
    );
};
