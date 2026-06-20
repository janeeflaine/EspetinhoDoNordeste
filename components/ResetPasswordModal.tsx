import React, { useState, useEffect } from 'react';
import { Lock, Key, Check, X, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Validation States
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isPasswordValid) {
      setError('A senha não atende a todos os requisitos de segurança.');
      return;
    }

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess('Sua senha foi redefinida com sucesso! Você já está conectado.');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Reset password update error:', err);
      setError(err.message || 'Ocorreu um erro ao atualizar sua senha. Talvez o link tenha expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop with strong blur */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 shadow-2xl relative z-10 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-zinc-950 p-6 text-center border-b border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 pattern-grid-lg opacity-20"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Nova Senha</h2>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-medium">Redefinir Acesso Admin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/30 text-red-500 border border-red-900/30 rounded-lg flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 rounded-lg flex items-start gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {!success && (
            <>
              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Nova Senha</label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-3 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-zinc-500 ml-1">Confirmar Senha</label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-3 h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Requirements */}
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 space-y-2 text-xs">
                <span className="font-bold text-zinc-400 block mb-1">Requisitos de Segurança:</span>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}>Mínimo de 8 caracteres</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasUpperCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={hasUpperCase ? 'text-emerald-400' : 'text-zinc-500'}>Uma letra maiúscula (A-Z)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasLowerCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={hasLowerCase ? 'text-emerald-400' : 'text-zinc-500'}>Uma letra minúscula (a-z)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={hasNumber ? 'text-emerald-400' : 'text-zinc-500'}>Pelo menos um número (0-9)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasSpecialChar ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={hasSpecialChar ? 'text-emerald-400' : 'text-zinc-500'}>Um caractere especial (Ex: @, $, !)</span>
                  </li>
                  <li className="flex items-center gap-2 border-t border-zinc-800/80 pt-1.5 mt-1.5">
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={passwordsMatch ? 'text-emerald-400' : 'text-zinc-500'}>Senhas coincidem</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !passwordsMatch}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Salvar Nova Senha</span>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
