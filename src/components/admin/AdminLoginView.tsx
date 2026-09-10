import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';

interface AdminLoginViewProps {
  onLogin: (username: string, password: string) => boolean;
  onBackToStore: () => void;
  storeName?: string;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLogin,
  onBackToStore,
  storeName = 'Books EM',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#E8DCCF]">
      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-[#EAE2D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5C3218] text-[#FAF7F2] flex items-center justify-center font-brand font-bold text-lg shadow-sm">
            EM
          </div>
          <div>
            <h1 className="font-brand font-bold text-lg sm:text-xl text-[#3B2213] tracking-tight">
              {storeName}
            </h1>
            <p className="text-[11px] text-[#8C7464]">
              Portal de Gestión y Administración
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToStore}
          id="admin-login-back-to-store-btn"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DACB] text-xs font-bold text-[#5C3218] hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </button>
      </header>

      {/* Center Login Container */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DFD0] shadow-sm p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#5C3218] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7 stroke-[2]" />
            </div>
            <h2 className="font-brand text-2xl font-bold text-[#3B2213]">
              Acceso a Administración
            </h2>
            <p className="text-xs text-[#735F52] max-w-sm mx-auto leading-relaxed">
              Ingresa tus credenciales para gestionar el catálogo de publicaciones, pedidos de WhatsApp y ajustes de la tienda.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuario */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                Usuario de Administrador
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7464]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="admin-page-username-input"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Usuario administrador"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7464]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-page-password-input"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7464] hover:text-[#3B2213] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-700 mt-2.5 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Credenciales no válidas. Revisa tu usuario y contraseña.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                id="admin-page-login-submit-btn"
                className="w-full py-3 px-4 rounded-xl bg-[#5C3218] hover:bg-[#472611] text-white text-sm font-bold shadow-sm hover:shadow transition-colors cursor-pointer"
              >
                Ingresar al Panel de Administración
              </button>

              <button
                type="button"
                onClick={onBackToStore}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E5DACB] text-xs font-semibold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                ← Regresar a la Tienda
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#8C7464]">
        <p>{storeName} • Apartado de administración privada</p>
      </footer>
    </div>
  );
};
