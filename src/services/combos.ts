import { supabase } from '../utils/supabase/client';
import { Combo, ComboItem } from '../types';
import { INITIAL_COMBOS } from './demoData';

/**
 * Helper to parse clean description and items summary from combo description.
 */
export function parseComboDescription(rawDescription: string): { cleanDescription: string; itemsSummary: string[] } {
  if (!rawDescription) return { cleanDescription: '', itemsSummary: [] };

  const contentMarkerIndex = rawDescription.indexOf('Contenido:');
  if (contentMarkerIndex !== -1) {
    const cleanDescription = rawDescription.slice(0, contentMarkerIndex).trim();
    const itemsPart = rawDescription.slice(contentMarkerIndex + 'Contenido:'.length).trim();
    const itemsSummary = itemsPart
      .split('\n')
      .map(line => line.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);
    return { cleanDescription, itemsSummary };
  }

  const lines = rawDescription.split('\n');
  const bulletLines: string[] = [];
  const descLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletLines.push(trimmed.replace(/^[•\-\*]\s*/, ''));
    } else {
      descLines.push(trimmed);
    }
  }

  if (bulletLines.length > 0) {
    return { cleanDescription: descLines.join('\n').trim(), itemsSummary: bulletLines };
  }

  return { cleanDescription: rawDescription.trim(), itemsSummary: [] };
}

/**
 * Helper to format clean description and items summary into a single description string.
 */
export function formatComboDescription(cleanDescription: string, itemsSummary?: string[]): string {
  const desc = (cleanDescription || '').trim();
  if (!itemsSummary || itemsSummary.length === 0) {
    return desc;
  }
  const cleanItems = itemsSummary
    .map(i => i.trim().replace(/^[•\-\*]\s*/, ''))
    .filter(Boolean);
  if (cleanItems.length === 0) return desc;

  const itemsBlock = cleanItems.map(i => `• ${i}`).join('\n');
  return desc ? `${desc}\n\nContenido:\n${itemsBlock}` : `Contenido:\n${itemsBlock}`;
}

/**
 * Seeds initial combos directly into Supabase tables if empty.
 */
export async function seedCombosToSupabase(): Promise<boolean> {
  try {
    const combosToInsert = INITIAL_COMBOS.map(c => {
      let desc = c.description || '';
      if (c.items_summary && c.items_summary.length > 0) {
        desc = formatComboDescription(desc, c.items_summary);
      }
      return {
        id: c.id,
        name: c.name,
        description: desc,
        price: c.price,
        previous_price: c.previous_price || null,
        image_url: c.image_url,
        active: c.active ?? true,
        featured: c.featured ?? false,
      };
    });

    const { error } = await supabase.from('combos').upsert(combosToInsert, { onConflict: 'id' });
    if (error) {
      console.warn('Seeding combos warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Seeding combos exception:', err);
    return false;
  }
}

/**
 * Gets all combos from Supabase.
 */
export async function getCombos(onlyActive = true): Promise<Combo[]> {
  try {
    let query = supabase
      .from('combos')
      .select('*')
      .order('name');

    if (onlyActive) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase getCombos error:', error);
      throw new Error(`Error al cargar combos de Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      const seeded = await seedCombosToSupabase();
      if (seeded) {
        const { data: seededData } = await query;
        if (seededData && seededData.length > 0) {
          return mapCombosData(seededData);
        }
      }
      return [];
    }

    return mapCombosData(data);
  } catch (err: any) {
    console.error('Failed to get combos from Supabase:', err);
    throw err;
  }
}

function mapCombosData(data: any[]): Combo[] {
  return data.map((c: any) => {
    const { cleanDescription, itemsSummary } = parseComboDescription(c.description || '');

    const items: ComboItem[] = itemsSummary.map((summaryText, idx) => ({
      id: `${c.id}-item-${idx}`,
      combo_id: c.id,
      product_name: summaryText,
      quantity: 1,
      unit: '',
    }));

    return {
      id: c.id,
      name: c.name,
      description: cleanDescription || c.description || '',
      price: Number(c.price),
      previous_price: c.previous_price ? Number(c.previous_price) : null,
      image_url: c.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      active: Boolean(c.active),
      featured: Boolean(c.featured),
      category: 'Super Combos',
      items,
      items_summary: itemsSummary,
      created_at: c.created_at,
      updated_at: c.updated_at,
    };
  });
}

/**
 * Creates a new combo in Supabase.
 */
export async function createCombo(combo: Omit<Combo, 'id' | 'created_at' | 'updated_at'>): Promise<Combo> {
  let summary = combo.items_summary || [];
  if (summary.length === 0 && combo.items && combo.items.length > 0) {
    summary = combo.items.map(it => `${it.quantity} ${it.unit || ''} ${it.product_name || 'Producto'}`.trim());
  }

  const fullDescription = formatComboDescription(combo.description || '', summary);

  const payload = {
    name: combo.name.trim(),
    description: fullDescription,
    price: Number(combo.price),
    previous_price: combo.previous_price ? Number(combo.previous_price) : null,
    image_url: combo.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    active: combo.active ?? true,
    featured: combo.featured ?? false,
  };

  const { data: newCombo, error: comboError } = await supabase
    .from('combos')
    .insert([payload])
    .select()
    .single();

  if (comboError || !newCombo) {
    console.error('Supabase createCombo failed:', comboError);
    throw new Error(`Error al crear combo en Supabase: ${comboError?.message || 'Error desconocido'}`);
  }

  const { cleanDescription, itemsSummary } = parseComboDescription(newCombo.description || '');

  return {
    ...newCombo,
    description: cleanDescription,
    price: Number(newCombo.price),
    previous_price: newCombo.previous_price ? Number(newCombo.previous_price) : null,
    items: combo.items || [],
    items_summary: itemsSummary.length > 0 ? itemsSummary : summary,
  };
}

/**
 * Updates a combo in Supabase.
 */
export async function updateCombo(id: string, updates: Partial<Combo>): Promise<Combo> {
  if (!id) throw new Error('ID de combo requerido para actualizar.');

  const payload: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Remove fields not in Supabase schema
  const items = payload.items;
  let items_summary = payload.items_summary;
  delete payload.items;
  delete payload.items_summary;
  delete payload.combo_items;
  delete payload.category;
  delete payload.id;

  if (items && Array.isArray(items) && (!items_summary || items_summary.length === 0)) {
    items_summary = items.map((it: ComboItem) =>
      `${it.quantity} ${it.unit || ''} ${it.product_name || 'Producto'}`.trim()
    );
  }

  if (items_summary !== undefined || updates.description !== undefined) {
    const baseDesc = updates.description !== undefined ? updates.description : '';
    payload.description = formatComboDescription(baseDesc, items_summary);
  }

  if ('price' in payload && payload.price !== undefined) {
    payload.price = Number(payload.price);
    if (isNaN(payload.price) || payload.price < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a 0.');
    }
  }
  if ('previous_price' in payload) {
    payload.previous_price = payload.previous_price ? Number(payload.previous_price) : null;
  }

  const { data: updatedCombo, error } = await supabase
    .from('combos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updatedCombo) {
    console.error('Supabase updateCombo failed:', error);
    throw new Error(`Error al actualizar combo en Supabase: ${error?.message || 'Error desconocido'}`);
  }

  const { cleanDescription, itemsSummary } = parseComboDescription(updatedCombo.description || '');

  return {
    ...updatedCombo,
    description: cleanDescription,
    price: Number(updatedCombo.price),
    previous_price: updatedCombo.previous_price ? Number(updatedCombo.previous_price) : null,
    items: items || [],
    items_summary: itemsSummary,
  };
}

/**
 * Deletes a combo from Supabase.
 */
export async function deleteCombo(id: string): Promise<boolean> {
  if (!id) throw new Error('ID de combo requerido para eliminar.');

  const { error } = await supabase.from('combos').delete().eq('id', id);

  if (error) {
    console.error('Supabase deleteCombo failed:', error);
    throw new Error(`Error al eliminar combo en Supabase: ${error.message}`);
  }

  return true;
}
