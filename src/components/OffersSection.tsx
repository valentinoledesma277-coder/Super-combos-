import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Clock, Sparkles } from 'lucide-react';

interface OffersSectionProps {
  offers: Product[];
  onAddToCart: (product: Product) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers, onAddToCart }) => {
  if (offers.length === 0) return null;

  return (
    <section id="ofertas-section" className="py-12 sm:py-16 bg-[#080808] border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE500]/15 text-[#FFE500] text-xs font-black uppercase tracking-wider border border-[#FFE500]/30">
              <Flame className="w-3.5 h-3.5 fill-[#FFE500]" />
              <span>OFERTAS POR TIEMPO LIMITADO</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              🔥 OFERTAS <span className="text-[#FFE500]">DEL DÍA</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-[#141414] px-3.5 py-2 rounded-xl border border-[#262626]">
            <Clock className="w-4 h-4 text-[#B7FF00] animate-pulse" />
            <span>Precios promocionales válidos hasta agotar stock</span>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {offers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>

      </div>
    </section>
  );
};
