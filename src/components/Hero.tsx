import React from 'react';
import { ArrowDown, Flame, Bike, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onScrollToCombos: () => void;
  onScrollToProducts: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToCombos, onScrollToProducts }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050505] via-[#0c0c0c] to-[#050505] pt-6 pb-16 border-b border-[#1f1f1f]">
      {/* Background ambient glows in brand yellow & lime */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#FFE500]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[250px] bg-[#B7FF00]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#2e2e2e] shadow-inner text-xs sm:text-sm font-black text-[#FFE500]">
              <span className="flex h-2 w-2 rounded-full bg-[#B7FF00] animate-ping" />
              <span>🛵 ¡ENVÍOS RÁPIDOS EN EL DÍA!</span>
              <span className="text-zinc-500">|</span>
              <span className="text-white">FRUTAS, VERDURAS & CARNES</span>
            </div>

            {/* Main Headline with high visual impact */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.95]">
                <span className="text-white drop-shadow-md block">SUPER</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE500] via-[#B7FF00] to-[#FFE500] drop-shadow-[0_4px_20px_rgba(255,229,0,0.35)] block">
                  COMBOS
                </span>
              </h1>
              <div className="inline-block mt-2 bg-[#141414] border-2 border-[#B7FF00] px-4 py-1.5 rounded-2xl shadow-[0_0_15px_rgba(183,255,0,0.3)]">
                <span className="text-lg sm:text-2xl font-black text-[#B7FF00] tracking-wider uppercase flex items-center gap-2">
                  <span>FRESCO EN TU CASA</span>
                  <span className="text-white text-xl">🏠</span>
                </span>
              </div>
            </div>

            {/* Subtitle / Value Proposition */}
            <p className="text-lg sm:text-xl text-zinc-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Todo lo que necesitás, <strong className="text-white font-bold underline decoration-[#FFE500] decoration-2">fresco y directo a tu puerta</strong>.
              Ahorrá tiempo y dinero con nuestros combos familiares y productos seleccionados a mano.
            </p>

            {/* Key Micro Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-bold text-zinc-200">
              <div className="flex items-center gap-2 bg-[#121212] p-2.5 rounded-xl border border-[#222]">
                <div className="w-8 h-8 rounded-lg bg-[#FFE500]/15 flex items-center justify-center text-[#FFE500]">
                  🛵
                </div>
                <span>Motos Rápidas</span>
              </div>
              <div className="flex items-center gap-2 bg-[#121212] p-2.5 rounded-xl border border-[#222]">
                <div className="w-8 h-8 rounded-lg bg-[#B7FF00]/15 flex items-center justify-center text-[#B7FF00]">
                  🥬
                </div>
                <span>100% Fresco</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-[#121212] p-2.5 rounded-xl border border-[#222]">
                <div className="w-8 h-8 rounded-lg bg-[#FFE500]/15 flex items-center justify-center text-[#FFE500]">
                  🥩
                </div>
                <span>Cortes Selectos</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={onScrollToCombos}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-lg tracking-wide uppercase transition-all shadow-[0_0_25px_rgba(255,229,0,0.4)] hover:shadow-[0_0_30px_rgba(183,255,0,0.6)] cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 group"
              >
                <Flame className="w-6 h-6 text-black group-hover:scale-110 transition-transform fill-black" />
                <span>VER SUPER COMBOS</span>
              </button>

              <button
                onClick={onScrollToCombos}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#161616] hover:bg-[#202020] text-white font-extrabold text-base tracking-wide uppercase transition-all border-2 border-[#333333] hover:border-[#FFE500] cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>APARTADO DE COMBOS</span>
                <ArrowDown className="w-5 h-5 text-[#FFE500]" />
              </button>
            </div>
          </div>

          {/* Right Column: Prominent Official Logo Display */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Outer neon border glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FFE500] via-[#B7FF00] to-[#FFE500] rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />
              
              {/* Logo Card container */}
              <div className="relative rounded-3xl overflow-hidden bg-[#0d0d0d] border-2 border-[#333333] p-3 shadow-2xl">
                <img
                  src="/logo/logo.png"
                  alt="Super Combos - Fresco en tu Casa Logo Oficial"
                  className="w-full h-auto object-contain rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* Floating pill over image */}
                <div className="absolute bottom-6 left-6 right-6 bg-black/85 backdrop-blur-md rounded-xl p-3 border border-[#FFE500]/50 shadow-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#B7FF00] inline-block animate-ping" />
                    <span className="font-extrabold text-white">¡CALIDAD DE BARRIO GARANTIZADA!</span>
                  </div>
                  <span className="font-black text-[#FFE500]">⭐ 5.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
