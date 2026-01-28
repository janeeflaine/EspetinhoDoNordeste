
import React, { useState, useEffect } from 'react';
import { Lock, User, Key, AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset states when opening
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) return;

    setIsLoading(true);

    // Simulate network delay for security (prevent timing attacks)
    await new Promise(resolve => setTimeout(resolve, 800));

    // MOCK CREDENTIALS - In a real app, verify against a backend API
    const VALID_EMAIL = 'admin@espetinho.com';
    const VALID_PASS = 'admin123';

    if (email === VALID_EMAIL && password === VALID_PASS) {
      setIsLoading(false);
      setAttempts(0);
      onLoginSuccess();
    } else {
      setIsLoading(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setError('Muitas tentativas falhas. Acesso bloqueado por segurança temporariamente.');
        
        // Unlock after 30 seconds
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          setError('');
        }, 30000);
      } else {
        setError('Credenciais inválidas.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with strong blur */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 shadow-2xl relative z-10 overflow-hidden animate-scale-in">
        {/* Security Header */}
        <div className="bg-zinc-950 p-6 text-center border-b border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 pattern-grid-lg opacity-20"></div>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isLocked ? 'bg-red-900/30' : 'bg-zinc-800'}`}>
              {isLocked ? (
                <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              ) : (
                <Lock className="w-8 h-8 text-zinc-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-medium">Área Administrativa</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${isLocked ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-amber-950/30 text-amber-500 border border-amber-900/30'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Usuário</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  disabled={isLocked}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all disabled:opacity-50"
                  placeholder="admin@espetinho.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Senha</label>
              <div className="relative group">
                <Key className="absolute left-3 top-3 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLocked}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all disabled:opacity-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isLocked || !email || !password}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>
          </div>
        </form>

        <div className="bg-zinc-950 p-4 text-center border-t border-zinc-800">
           <button onClick={onClose} className="text-xs text-zinc-500 hover:text-white transition-colors">
             Voltar para a loja
           </button>
        </div>
      </div>
    </div>
  );
};
