import React from 'react';
import { Combo } from '../types';
import { ComboCard } from './ComboCard';
import { Flame, Sparkles } from 'lucide-react';

interface SuperCombosSectionProps {
  combos: Combo[];
  onAddToCart: (combo: Combo) => void;
}

export const SuperCombosSection: React.FC<SuperCombosSectionProps> = ({ combos, onAddToCart }) => {
  return (
    <section id="super-combos-section" className="py-14 sm:py-20 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-[#FFE500] text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-[#FFE500]" />
            <span>LA OPCIÓN MÁS CONVENIENTE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            🔥 <span className="text-[#FFE500]">SUPER</span> COMBOS
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-medium">
            "Más productos, mejores precios." Diseñados para que no te falte nada en tu mesa y ahorres hasta un 30% en cada compra.
          </p>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} onAddToCart={onAddToCart} />
          ))}
        </div>

      </div>
    </section>
  );
};
