import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Search, Phone, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onSelectCategory: (slug: string) => void;
  activeCategory: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cart,
  onOpenCart,
  onSelectCategory,
  activeCategory,
  searchQuery,
  onSearchChange,
  onNavigateHome,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navCategories = [
    { name: '🔥 Todos los Combos', slug: 'todos' },
    { name: '🥩 Parrilleros & Asado', slug: 'parrilleros' },
    { name: '👨‍👩‍👧‍👦 Familiares', slug: 'familiares' },
    { name: '🥬 Verduras & Frutas', slug: 'frescos' },
    { name: '🍗 Pollo & Granja', slug: 'pollo' },
    { name: '🧀 Picadas & Fiambres', slug: 'picadas' },
    { name: '⚡ Mayor Ahorro', slug: 'ofertas' },
  ];

  const handleNavClick = (slug: string) => {
    onSelectCategory(slug);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-[#222222]">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-[#FFE500] via-[#B7FF00] to-[#FFE500] text-black text-xs font-black py-1 px-4 text-center tracking-wide uppercase flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          🛵 <span>ENVÍOS A DOMICILIO EN EL DÍA</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:flex items-center gap-1">
          🥬 <span>100% FRESCO DE BARRIO</span>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:flex items-center gap-1">
          🔥 <span>LOS MEJORES COMBOS Y OFERTAS</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Brand Identity */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95 cursor-pointer focus:outline-none"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-black p-1 border-2 border-[#FFE500] shadow-[0_0_15px_rgba(255,229,0,0.3)] group-hover:border-[#B7FF00] group-hover:shadow-[0_0_20px_rgba(183,255,0,0.5)] transition-all">
              <img
                src="/logo/logo.png"
                alt="Super Combos - Fresco en tu Casa"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tighter leading-tight text-white flex items-center gap-1">
                SUPER <span className="text-[#FFE500] group-hover:text-[#B7FF00] transition-colors">COMBOS</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#B7FF00] tracking-wider uppercase flex items-center gap-1">
                <span>Fresco en tu Casa</span>
                <span className="text-white">🏠</span>
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar papas, asado, frutas, combos..."
                className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] focus:ring-1 focus:ring-[#FFE500] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2.5 rounded-xl bg-[#121212] text-zinc-300 hover:text-white border border-[#222222] transition-colors cursor-pointer"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#FFE500] text-zinc-300 hover:text-[#FFE500] font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              title="Ingresar al Panel de Administrador con contraseña"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black px-4 py-2.5 rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(183,255,0,0.4)] transition-all cursor-pointer active:scale-95"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm uppercase tracking-wide">Carrito</span>
              {totalItemsCount > 0 ? (
                <span className="bg-black text-[#FFE500] text-xs font-black px-2 py-0.5 rounded-full border border-black min-w-[20px] text-center">
                  {totalItemsCount}
                </span>
              ) : null}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-[#121212] text-zinc-300 hover:text-white border border-[#222222] transition-colors cursor-pointer"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input dropdown */}
        {showSearch && (
          <div className="lg:hidden pb-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar papas, asado, frutas, combos..."
                className="w-full bg-[#121212] border border-[#333] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Category Navigation Bar (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 py-2.5 overflow-x-auto border-t border-[#1a1a1a]">
          {navCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFE500] text-black shadow-[0_0_10px_rgba(255,229,0,0.3)]'
                    : 'text-zinc-300 hover:text-white hover:bg-[#151515]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-black/95 z-50 p-6 flex flex-col justify-between border-t border-[#222222] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-2">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2">Apartado de Combos</p>
            {navCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleNavClick(cat.slug)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center justify-between text-base ${
                  activeCategory === cat.slug ? 'bg-[#FFE500] text-black' : 'bg-[#121212] text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-60">→</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-[#222222] space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full py-3 bg-[#151515] hover:bg-[#222] text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-[#2a2a2a] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
              <span>Acceso Administrador (Contraseña)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
