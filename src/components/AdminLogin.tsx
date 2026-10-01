import React, { useState } from 'react';
import { signInAdminWithPassword } from '../services/auth';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Por favor ingresá la contraseña.');
      return;
    }

    setLoading(true);

    try {
      const result = await signInAdminWithPassword(password);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Contraseña incorrecta. Por favor verificá e intentá nuevamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al validar contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow in brand yellow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE500]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to store button */}
      <div className="w-full max-w-sm mb-6">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#FFE500] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </button>
      </div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden bg-black p-1 border-2 border-[#FFE500] shadow-[0_0_25px_rgba(255,229,0,0.35)]">
              <img
                src="/logo/logo.png"
                alt="Super Combos Logo"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#2a2a2a] text-[#FFE500] text-[11px] font-black tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Administrativo</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Acceso Administrador
          </h1>
          <p className="text-xs text-zinc-400">
            Ingresá la contraseña para acceder al panel de control
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0e0e0e] border border-[#222] rounded-3xl p-6 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-2xl text-xs text-red-300 font-medium animate-in fade-in flex items-start gap-2">
              <span className="text-red-400 font-bold shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  autoFocus
                  required
                  className="w-full bg-[#161616] border border-[#2e2e2e] focus:border-[#FFE500] rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FFE500] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,229,0,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verificando...' : 'Ingresar al Panel'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
