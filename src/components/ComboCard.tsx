import React, { useState } from 'react';
import { Combo } from '../types';
import { ShoppingCart, Check, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

interface ComboCardProps {
  combo: Combo;
  onAddToCart: (combo: Combo) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const discountPercent =
    combo.previous_price && combo.previous_price > combo.price
      ? Math.round(((combo.previous_price - combo.price) / combo.previous_price) * 100)
      : null;

  const handleAdd = () => {
    onAddToCart(combo);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="relative group bg-[#0d0d0d] rounded-3xl border-2 border-[#262626] hover:border-[#FFE500] transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(255,229,0,0.25)] flex flex-col justify-between">
      
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <span className="bg-[#FFE500] text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-black" />
          <span>SUPER COMBO</span>
        </span>
        {discountPercent ? (
          <span className="bg-[#B7FF00] text-black font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            AHORRÁS {discountPercent}%
          </span>
        ) : null}
      </div>

      {/* Combo Image with hover zoom */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-zinc-900">
        <img
          src={combo.image_url}
          alt={combo.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-90" />
      </div>

      {/* Body content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FFE500] transition-colors leading-tight">
            {combo.name}
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 line-clamp-2">
            {combo.description}
          </p>

          {/* Included Products List */}
          {combo.items_summary && combo.items_summary.length > 0 && (
            <div className="mt-4 bg-[#141414] p-3.5 rounded-2xl border border-[#222]">
              <p className="text-[11px] font-black uppercase text-[#B7FF00] tracking-wider mb-2 flex items-center gap-1">
                <span>📦 QUÉ INCLUYE ESTE COMBO:</span>
              </p>
              <ul className="space-y-1.5">
                {combo.items_summary.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B7FF00] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
                {combo.items_summary.length > 5 && (
                  <li className="text-[11px] text-[#FFE500] font-bold pl-5">
                    + {combo.items_summary.length - 5} productos más...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-[#202020] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              {combo.previous_price && (
                <div className="text-xs sm:text-sm text-zinc-500 line-through font-semibold">
                  Antes: ${combo.previous_price.toLocaleString('es-AR')}
                </div>
              )}
              <div className="text-2xl sm:text-3xl font-black text-[#FFE500] tracking-tight">
                ${combo.price.toLocaleString('es-AR')}
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-[#B7FF00] bg-[#B7FF00]/10 border border-[#B7FF00]/30 px-2.5 py-1 rounded-lg">
              🔥 SÚPER PRECIO
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              added
                ? 'bg-[#B7FF00] text-black shadow-[0_0_20px_rgba(183,255,0,0.6)]'
                : 'bg-[#FFE500] hover:bg-[#B7FF00] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>¡AGREGADO AL CARRITO!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>AGREGAR AL CARRITO</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
