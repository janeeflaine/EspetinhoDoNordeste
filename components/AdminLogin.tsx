
import React, { useState, useEffect } from 'react';
import { Lock, User, Key, AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase';

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

  // Recovery States
  const [isResetMode, setIsResetMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown(cooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      // Reset states when opening
      setEmail('');
      setPassword('');
      setError('');
      setIsResetMode(false);
      setRecoveryEmail('');
      setRecoverySuccess('');
      setRecoveryLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) return;

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      console.error('Login Error:', error);
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
        setError('Credenciais inválidas ou erro de login.');
      }
    } else {
      setAttempts(0);
      console.log('Login Successful, User ID:', data.session?.user.id);
      onLoginSuccess();
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoverySuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail.trim())) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    setRecoveryLoading(true);

    try {
      // call Supabase reset password
      await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), {
        redirectTo: window.location.origin,
      });

      // Always show success message to prevent account enumeration
      setRecoverySuccess(
        'Se o e-mail estiver cadastrado, você receberá um link em alguns instantes para redefinir sua senha.'
      );
      setCooldown(60); // 60-second cooldown
    } catch (err) {
      console.error('Reset Password error:', err);
      setError('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setRecoveryLoading(false);
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

        {!isResetMode ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${isLocked ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-red-950/30 text-red-500 border border-red-900/30'}`}>
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
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError('');
                      setRecoverySuccess('');
                      setRecoveryEmail('');
                    }}
                    className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isLocked || !email || !password}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Entrar no Sistema</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecoverySubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-950/30 text-red-500 border border-red-900/30 rounded-lg flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {recoverySuccess && (
              <div className="p-3 bg-emerald-950/30 text-emerald-500 border border-emerald-900/30 rounded-lg flex items-start gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Digite seu e-mail cadastrado para enviarmos um link seguro de recuperação de senha.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-zinc-500 ml-1">E-mail de Recuperação</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                    placeholder="seu-email@espetinho.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={recoveryLoading || cooldown > 0 || !recoveryEmail}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {recoveryLoading ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{cooldown > 0 ? `Aguarde ${cooldown}s` : 'Enviar Link de Recuperação'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                  setRecoverySuccess('');
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs"
              >
                Voltar ao Login
              </button>
            </div>
          </form>
        )}

        <div className="bg-zinc-950 p-4 text-center border-t border-zinc-800">
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-white transition-colors">
            Voltar para a loja
          </button>
        </div>
      </div>
    </div>
  );
};
