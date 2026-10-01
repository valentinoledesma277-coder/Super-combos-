import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, Filter, X } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddToCart: (product: Product) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAddToCart,
}) => {
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter category
    if (selectedCategory && selectedCategory !== 'todos' && selectedCategory !== 'combos') {
      result = result.filter(p => p.category_slug === selectedCategory);
    }

    // Filter search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Filter only offers
    if (onlyOffers) {
      result = result.filter(p => p.is_offer);
    }

    // Filter in stock
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured === b.featured) return 0;
        return a.featured ? -1 : 1;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [products, selectedCategory, searchQuery, onlyOffers, onlyInStock, sortBy]);

  const activeCategoryTitle =
    categories.find(c => c.slug === selectedCategory)?.name ||
    (selectedCategory === 'todos' ? 'Todos los Productos' : 'Catálogo');

  return (
    <section id="catalogo-section" className="py-12 sm:py-16 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
              CATÁLOGO COMPLETO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase mt-1 tracking-tight">
              {activeCategoryTitle}
            </h2>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-400">
            Mostrando <strong className="text-[#FFE500] font-black">{filteredProducts.length}</strong> productos
          </div>
        </div>

        {/* Filter controls row */}
        <div className="bg-[#0e0e0e] border border-[#222222] rounded-2xl p-4 mb-8 space-y-4">
          
          {/* Top row: search + sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="sm:col-span-4 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] appearance-none cursor-pointer font-bold"
              >
                <option value="featured">⭐ Orden: Destacados</option>
                <option value="price-asc">💵 Precio: Menor a Mayor</option>
                <option value="price-desc">💰 Precio: Mayor a Menor</option>
                <option value="name-asc">🔤 Nombre: A - Z</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Bottom row: category pills + toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1a1a1a]">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => onSelectCategory('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategory === 'todos'
                    ? 'bg-[#FFE500] text-black shadow-md'
                    : 'bg-[#181818] text-zinc-300 hover:text-white hover:bg-[#222]'
                }`}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => onSelectCategory(c.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategory === c.slug
                      ? 'bg-[#FFE500] text-black shadow-md'
                      : 'bg-[#181818] text-zinc-300 hover:text-white hover:bg-[#222]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Quick check toggles */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={(e) => setOnlyOffers(e.target.checked)}
                  className="rounded text-[#FFE500] focus:ring-0 focus:ring-offset-0 bg-[#222] border-zinc-700"
                />
                <span className="flex items-center gap-1">
                  🔥 <span>Solo Ofertas</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#B7FF00] focus:ring-0 focus:ring-offset-0 bg-[#222] border-zinc-700"
                />
                <span className="flex items-center gap-1">
                  📦 <span>En Stock</span>
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0c0c0c] rounded-3xl border border-[#222] p-8 space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-black text-white">No encontramos productos con esos filtros</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Probá borrando el texto de búsqueda o cambiando la categoría seleccionada.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('todos');
                setOnlyOffers(false);
                setOnlyInStock(false);
              }}
              className="mt-2 px-4 py-2 bg-[#FFE500] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#B7FF00] transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
