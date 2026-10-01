import React from 'react';
import { Bike, Phone, MapPin, Clock, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (slug: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  return (
    <footer className="bg-[#050505] border-t border-[#1f1f1f] text-zinc-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black p-1 border-2 border-[#FFE500] shadow-[0_0_15px_rgba(255,229,0,0.25)] shrink-0">
                <img
                  src="/logo/logo.png"
                  alt="Super Combos Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight leading-tight block">
                  SUPER <span className="text-[#FFE500]">COMBOS</span>
                </span>
                <span className="text-xs font-black text-[#B7FF00] tracking-wider uppercase block">
                  FRESCO EN TU CASA 🏠
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Tu tienda online de combos familiares, verduras, frutas, carnes premium, pollo fresco y fiambrería con envío express en moto a tu puerta.
            </p>

            <div className="flex items-center gap-2 pt-1 text-white font-bold text-xs">
              <span className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-xl border border-[#262626]">
                🛵 <span>Envíos en el día</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-xl border border-[#262626]">
                ⭐ <span>Atención de Barrio</span>
              </span>
            </div>
          </div>

          {/* Categories Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-black text-sm uppercase text-white tracking-wider">
              Apartado de Combos
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('todos')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  🔥 Todos los Super Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('parrilleros')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  🥩 Combos Parrilleros & Asado
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('familiares')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  👨‍👩‍👧‍👦 Combos Familiares & Semanales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('frescos')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  🥬 Combos Verduras & Frutas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pollo')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  🍗 Combos Pollería & Granja
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('picadas')}
                  className="hover:text-[#FFE500] transition-colors cursor-pointer"
                >
                  🧀 Combos Picada & Fiambrería
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Hours */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-black text-sm uppercase text-white tracking-wider">
              Horarios y Envíos
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Lunes a Sábados:</span>
                  <span>08:30 a 20:30 hs.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-zinc-300">
                <Bike className="w-4 h-4 text-[#B7FF00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Repartos en Moto:</span>
                  <span>Salidas cada 45 minutos hacia todos los barrios.</span>
                </div>
              </div>

              <a
                href="https://wa.me/5493757608007"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-zinc-300 hover:text-[#25D366] transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-white block group-hover:text-[#25D366]">Pedidos & Consultas:</span>
                  <span>WhatsApp: +54 9 3757 60-8007</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} SUPER COMBOS - FRESCO EN TU CASA. Todos los derechos reservados.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-[#FFE500] transition-colors cursor-pointer font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Administrador</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
