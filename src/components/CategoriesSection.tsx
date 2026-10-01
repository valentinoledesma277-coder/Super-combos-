import React from 'react';
import { Category } from '../types';
import { ArrowRight, Flame } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  activeCategory: string;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onSelectCategory,
  activeCategory,
}) => {
  const categoryIcons: Record<string, string> = {
    verduleria: '🥬',
    fruteria: '🍎',
    carnes: '🥩',
    polleria: '🍗',
    fiambreria: '🧀',
    combos: '🔥',
  };

  return (
    <section className="py-12 sm:py-16 bg-[#0a0a0a] border-y border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#B7FF00] bg-[#141414] px-3 py-1 rounded-md border border-[#222]">
              PASILLO DE COMPRAS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase mt-2 tracking-tight">
              CATEGORÍAS DE <span className="text-[#FFE500]">BARRIO</span>
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            Elegí tu sector favorito y explorá cortes y cosechas seleccionadas a mano día tras día.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            const icon = categoryIcons[cat.slug] || '🛒';

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative text-left rounded-2xl overflow-hidden border-2 p-3 sm:p-4 transition-all duration-300 flex flex-col justify-between h-44 sm:h-52 cursor-pointer ${
                  isSelected
                    ? 'border-[#FFE500] bg-[#1a1805] shadow-[0_0_20px_rgba(255,229,0,0.3)] scale-[1.02]'
                    : 'border-[#222222] bg-[#111111] hover:border-[#B7FF00] hover:bg-[#161616]'
                }`}
              >
                {/* Background image preview with dark gradient */}
                {cat.image_url && (
                  <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                  </div>
                )}

                {/* Top Icon Badge */}
                <div className="relative z-10">
                  <span className="text-3xl sm:text-4xl block transform group-hover:scale-110 transition-transform">
                    {icon}
                  </span>
                </div>

                {/* Bottom Title & Arrow */}
                <div className="relative z-10 pt-2">
                  <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#FFE500] uppercase tracking-tight leading-snug">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#B7FF00] mt-1 opacity-80 group-hover:opacity-100">
                    <span>Ver productos</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
