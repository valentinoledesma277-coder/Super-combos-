import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Check, Flame, Star, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const discount =
    product.previous_price && product.previous_price > product.price
      ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
      : null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-[#0e0e0e] rounded-2xl border-2 border-[#202020] hover:border-[#FFE500] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[0_0_20px_rgba(255,229,0,0.15)]">
      
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
        {product.is_offer && (
          <span className="bg-[#FFE500] text-black text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
            <Flame className="w-3 h-3 fill-black" />
            <span>OFERTA {discount ? `-${discount}%` : ''}</span>
          </span>
        )}
        {product.featured && (
          <span className="bg-[#B7FF00] text-black text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
            <Star className="w-3 h-3 fill-black" />
            <span>DESTACADO</span>
          </span>
        )}
      </div>

      {/* Stock indicator badge on right */}
      <div className="absolute top-2.5 right-2.5 z-10">
        {isOutOfStock ? (
          <span className="bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
            Agotado
          </span>
        ) : isLowStock ? (
          <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            ¡Últimos {product.stock}!
          </span>
        ) : (
          <span className="bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-800">
            Stock: {product.stock}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-900">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80" />
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {product.category_name && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B7FF00]">
              {product.category_name}
            </span>
          )}
          <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#FFE500] transition-colors leading-tight line-clamp-1 mt-0.5">
            {product.name}
          </h4>
          <p className="text-zinc-400 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add Button */}
        <div className="pt-2 border-t border-[#1d1d1d] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              {product.previous_price && product.previous_price > product.price && (
                <span className="text-xs text-zinc-500 line-through font-semibold block">
                  Antes: ${product.previous_price.toLocaleString('es-AR')}
                </span>
              )}
              <div className="text-xl sm:text-2xl font-black text-[#FFE500] tracking-tight">
                ${product.price.toLocaleString('es-AR')}
                <span className="text-xs font-bold text-zinc-400 ml-1">
                  /{product.unit || 'kg'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : added
                ? 'bg-[#B7FF00] text-black shadow-[0_0_15px_rgba(183,255,0,0.5)]'
                : 'bg-[#FFE500] hover:bg-[#B7FF00] text-black shadow hover:shadow-[0_0_12px_rgba(255,229,0,0.3)]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡AGREGADO!</span>
              </>
            ) : isOutOfStock ? (
              <span>SIN STOCK</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>AGREGAR</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
