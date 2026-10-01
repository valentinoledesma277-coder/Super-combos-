import React, { useState, useMemo } from 'react';
import { Combo } from '../types';
import { ComboCard } from './ComboCard';
import { Search, Flame, ArrowUpDown, X, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface CombosShowcaseProps {
  combos: Combo[];
  onAddToCart: (combo: Combo) => void;
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
}

type SortOption = 'featured' | 'savings' | 'price-asc' | 'price-desc';

interface ComboCategoryTag {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

const COMBO_TAGS: ComboCategoryTag[] = [
  { id: 'todos', label: 'Todos los Combos', icon: '🔥', keywords: [] },
  { id: 'parrilleros', label: 'Parrilleros & Carnes', icon: '🥩', keywords: ['parrillero', 'asado', 'asador', 'carne', 'vacio'] },
  { id: 'familiares', label: 'Familiares & Semanales', icon: '👨‍👩‍👧‍👦', keywords: ['familiar', 'completo', 'semanal', 'express'] },
  { id: 'frescos', label: 'Verduras & Frutas', icon: '🥬', keywords: ['verdura', 'fruta', 'saludable', 'fit'] },
  { id: 'pollo', label: 'Pollo & Granja', icon: '🍗', keywords: ['pollo', 'suprema', 'milanesero', 'milanesa'] },
  { id: 'picadas', label: 'Picadas & Fiambres', icon: '🧀', keywords: ['picada', 'amigos', 'queso', 'salame', 'fiambre'] },
  { id: 'ofertas', label: 'Mayor Ahorro', icon: '⚡', keywords: [] },
];

export const CombosShowcase: React.FC<CombosShowcaseProps> = ({
  combos,
  onAddToCart,
  selectedTag = 'todos',
  onSelectTag,
}) => {
  const [activeTag, setActiveTag] = useState<string>(selectedTag);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const handleTagChange = (tagId: string) => {
    setActiveTag(tagId);
    if (onSelectTag) onSelectTag(tagId);
  };

  // Filter & Sort
  const filteredCombos = useMemo(() => {
    let result = [...combos];

    // Filter by category tag
    if (activeTag !== 'todos') {
      if (activeTag === 'ofertas') {
        result = result.filter(c => c.previous_price && c.previous_price > c.price);
      } else {
        const tagConfig = COMBO_TAGS.find(t => t.id === activeTag);
        if (tagConfig && tagConfig.keywords.length > 0) {
          result = result.filter(c => {
            const combined = `${c.name} ${c.description} ${(c.items_summary || []).join(' ')}`.toLowerCase();
            return tagConfig.keywords.some(kw => combined.includes(kw));
          });
        }
      }
    }

    // Filter by search query (searches combo title, description, AND included items)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const descMatch = c.description.toLowerCase().includes(q);
        const itemsMatch = (c.items_summary || []).some(item => item.toLowerCase().includes(q));
        return nameMatch || descMatch || itemsMatch;
      });
    }

    // Sort combos
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured === b.featured) return 0;
        return a.featured ? -1 : 1;
      }
      if (sortBy === 'savings') {
        const savingsA = a.previous_price ? a.previous_price - a.price : 0;
        const savingsB = b.previous_price ? b.previous_price - b.price : 0;
        return savingsB - savingsA;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

    return result;
  }, [combos, activeTag, searchQuery, sortBy]);

  return (
    <section id="apartado-combos" className="py-14 sm:py-20 bg-[#070707] border-y border-[#1c1c1c] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#2e2e2e] text-[#FFE500] text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-[#FFE500]" />
              <span>APARTADO EXCLUSIVO DE COMBOS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              NUESTROS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE500] via-[#B7FF00] to-[#FFE500]">SUPER COMBOS</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
              Diseñados para resolver tus comidas semanales, asados y picadas al mejor precio directo de barrio. 
              ¡Seleccioná tu combo y ahorrá hasta un 30% en cada compra!
            </p>
          </div>

          <div className="text-xs sm:text-sm font-bold text-zinc-400 bg-[#121212] px-4 py-2 rounded-2xl border border-[#222] self-start md:self-auto shrink-0">
            Mostrando <strong className="text-[#FFE500] text-base">{filteredCombos.length}</strong> combos disponibles
          </div>
        </div>

        {/* Filter controls row */}
        <div className="bg-[#0e0e0e] border border-[#222222] rounded-3xl p-4 sm:p-5 mb-8 space-y-4 shadow-xl">
          
          {/* Top row: search + sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o producto incluido (ej: asado, papa, pollo, frutas)..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white cursor-pointer"
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
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FFE500] appearance-none cursor-pointer font-bold"
              >
                <option value="featured">⭐ Orden: Destacados</option>
                <option value="savings">💰 Orden: Mayor Ahorro ($)</option>
                <option value="price-asc">💵 Precio: Menor a Mayor</option>
                <option value="price-desc">🏷️ Precio: Mayor a Menor</option>
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Bottom row: Category tags */}
          <div className="pt-2 border-t border-[#1c1c1c] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {COMBO_TAGS.map((tag) => {
              const isSelected = activeTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagChange(tag.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)] scale-[1.02]'
                      : 'bg-[#181818] text-zinc-300 hover:text-white hover:bg-[#222]'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Combos Grid */}
        {filteredCombos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCombos.map((combo) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0c0c0c] rounded-3xl border border-[#222] p-8 space-y-4">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-black text-white">No encontramos combos con ese criterio</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Probá borrando el texto de búsqueda o seleccionando "Todos los Combos".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTag('todos');
              }}
              className="mt-2 px-5 py-2.5 bg-[#FFE500] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#B7FF00] transition-colors cursor-pointer"
            >
              Ver Todos los Combos
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
