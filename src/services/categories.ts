import { supabase } from '../utils/supabase/client';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from './demoData';

/**
 * Seeds categories into Supabase if table is empty.
 */
export async function seedCategoriesToSupabase(): Promise<boolean> {
  try {
    const catsToInsert = INITIAL_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      image_url: c.image_url || null,
      active: c.active ?? true,
    }));

    const { error } = await supabase.from('categories').upsert(catsToInsert, { onConflict: 'id' });
    if (error) {
      console.warn('Seed categories error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Seed categories exception:', err);
    return false;
  }
}

/**
 * Gets all categories from Supabase.
 */
export async function getCategories(onlyActive = true): Promise<Category[]> {
  try {
    let query = supabase.from('categories').select('*').order('name');
    if (onlyActive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase getCategories error, fallback to initial categories:', error.message);
      return onlyActive ? INITIAL_CATEGORIES.filter(c => c.active) : INITIAL_CATEGORIES;
    }

    if (!data || data.length === 0) {
      const seeded = await seedCategoriesToSupabase();
      if (seeded) {
        const { data: seededData } = await query;
        if (seededData && seededData.length > 0) {
          return seededData as Category[];
        }
      }
      return onlyActive ? INITIAL_CATEGORIES.filter(c => c.active) : INITIAL_CATEGORIES;
    }

    return data as Category[];
  } catch (err: any) {
    console.warn('Failed to get categories from Supabase, using initial catalog:', err);
    return onlyActive ? INITIAL_CATEGORIES.filter(c => c.active) : INITIAL_CATEGORIES;
  }
}

/**
 * Creates a new category in Supabase.
 */
export async function createCategory(cat: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const payload = {
    name: cat.name.trim(),
    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: cat.description || null,
    image_url: cat.image_url || null,
    active: cat.active ?? true,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    console.error('Supabase createCategory failed:', error);
    throw new Error(`Error al crear categoría en Supabase: ${error?.message || 'Error desconocido'}`);
  }

  return data as Category;
}

/**
 * Updates a category in Supabase.
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (!id) throw new Error('ID de categoría requerido para actualizar.');

  const payload: any = { ...updates };
  delete payload.id;

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Supabase updateCategory failed:', error);
    throw new Error(`Error al actualizar categoría en Supabase: ${error?.message || 'Error desconocido'}`);
  }

  return data as Category;
}

/**
 * Deletes a category from Supabase.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  if (!id) throw new Error('ID de categoría requerido para eliminar.');

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Supabase deleteCategory failed:', error);
    throw new Error(`Error al eliminar categoría en Supabase: ${error.message}`);
  }

  return true;
}
