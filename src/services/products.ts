import { supabase } from '../utils/supabase/client';
import { Product } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './demoData';

/**
 * Seeds initial categories and products directly into Supabase tables if empty.
 */
export async function seedProductsToSupabase(): Promise<boolean> {
  try {
    // 1. Ensure categories exist first
    const { data: existingCats } = await supabase.from('categories').select('id').limit(1);
    if (!existingCats || existingCats.length === 0) {
      const catsToInsert = INITIAL_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        image_url: c.image_url || null,
        active: c.active,
      }));
      await supabase.from('categories').upsert(catsToInsert, { onConflict: 'id' });
    }

    // 2. Insert products (without non-existent subcategory column)
    const prodsToInsert = INITIAL_PRODUCTS.map(p => ({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: p.description || '',
      price: p.price,
      previous_price: p.previous_price || null,
      stock: p.stock ?? 50,
      image_url: p.image_url,
      active: p.active ?? true,
      featured: p.featured ?? false,
      is_offer: p.is_offer ?? false,
      unit: p.unit || 'kg',
    }));

    const { error } = await supabase.from('products').upsert(prodsToInsert, { onConflict: 'id' });
    if (error) {
      console.warn('Seeding products warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Seeding products exception:', err);
    return false;
  }
}

/**
 * Gets all products from Supabase database.
 */
export async function getProducts(options?: {
  onlyActive?: boolean;
  categorySlug?: string;
  isOffer?: boolean;
  isFeatured?: boolean;
  search?: string;
}): Promise<Product[]> {
  const onlyActive = options?.onlyActive ?? true;

  try {
    let query = supabase.from('products').select('*, categories(name, slug)').order('name');

    if (onlyActive) {
      query = query.eq('active', true);
    }
    if (options?.isOffer) {
      query = query.eq('is_offer', true);
    }
    if (options?.isFeatured) {
      query = query.eq('featured', true);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase getProducts error:', error);
      throw new Error(`Error de Supabase al cargar productos: ${error.message} (${error.code || ''})`);
    }

    // If database table is empty, auto-seed with initial store catalog directly into Supabase
    if (!data || data.length === 0) {
      const seeded = await seedProductsToSupabase();
      if (seeded) {
        const { data: seededData } = await query;
        if (seededData && seededData.length > 0) {
          return mapProductsData(seededData, options);
        }
      }
      return [];
    }

    return mapProductsData(data, options);
  } catch (err: any) {
    console.error('Failed to get products from Supabase:', err);
    throw err;
  }
}

function mapProductsData(
  data: any[],
  options?: { categorySlug?: string }
): Product[] {
  const mapped = data.map((p: any) => ({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price),
    previous_price: p.previous_price ? Number(p.previous_price) : null,
    stock: Number(p.stock ?? 0),
    image_url: p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    active: Boolean(p.active),
    featured: Boolean(p.featured),
    is_offer: Boolean(p.is_offer),
    unit: p.unit || 'kg',
    subcategory: undefined,
    category_name: p.categories?.name,
    category_slug: p.categories?.slug,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  if (options?.categorySlug && options.categorySlug !== 'todos' && options.categorySlug !== 'combos') {
    return mapped.filter(p => p.category_slug === options.categorySlug);
  }

  return mapped;
}

/**
 * Creates a new product directly in Supabase.
 * Throws explicit error if Supabase fails.
 */
export async function createProduct(prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const payload: any = {
    name: prod.name.trim(),
    slug: prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category_id: prod.category_id,
    description: prod.description || '',
    price: Number(prod.price),
    previous_price: prod.previous_price ? Number(prod.previous_price) : null,
    stock: Number(prod.stock ?? 0),
    image_url: prod.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    active: prod.active ?? true,
    featured: prod.featured ?? false,
    is_offer: prod.is_offer ?? false,
    unit: prod.unit || 'kg',
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select('*, categories(name, slug)');

  if (error) {
    const errorMsg = error?.message || 'Error desconocido al crear producto en Supabase.';
    console.error('Supabase createProduct failed:', error);
    throw new Error(`Error en Supabase: ${errorMsg} (Código: ${error?.code || 'DESCONOCIDO'})`);
  }

  const createdItem = Array.isArray(data) ? data[0] : data;
  if (!createdItem) {
    throw new Error('No se pudo confirmar la creación del producto en Supabase.');
  }

  return {
    ...createdItem,
    price: Number(createdItem.price),
    previous_price: createdItem.previous_price ? Number(createdItem.previous_price) : null,
    stock: Number(createdItem.stock),
    category_name: createdItem.categories?.name,
    category_slug: createdItem.categories?.slug,
  } as Product;
}

/**
 * Updates an existing product in Supabase.
 * Throws explicit error if Supabase update fails.
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (!id) {
    throw new Error('ID de producto requerido para actualizar.');
  }

  const payload: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Remove joined or virtual properties that are not columns in products table
  delete payload.category_name;
  delete payload.category_slug;
  delete payload.categories;
  delete payload.subcategory;
  delete payload.id;

  // Numeric sanitization
  if ('price' in payload && payload.price !== undefined) {
    payload.price = Number(payload.price);
    if (isNaN(payload.price) || payload.price < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a 0.');
    }
  }
  if ('previous_price' in payload) {
    payload.previous_price = payload.previous_price ? Number(payload.previous_price) : null;
  }
  if ('stock' in payload && payload.stock !== undefined) {
    payload.stock = Number(payload.stock);
    if (isNaN(payload.stock) || payload.stock < 0) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0.');
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*, categories(name, slug)');

  if (error) {
    const errorMsg = error?.message || 'Error desconocido al actualizar producto en Supabase.';
    console.error('Supabase updateProduct failed:', error);
    throw new Error(`Error en Supabase: ${errorMsg} (Código: ${error?.code || 'DESCONOCIDO'})`);
  }

  const updatedItem = Array.isArray(data) ? data[0] : data;
  if (!updatedItem) {
    throw new Error(`No se encontró el producto con ID ${id} en Supabase para actualizar.`);
  }

  return {
    ...updatedItem,
    price: Number(updatedItem.price),
    previous_price: updatedItem.previous_price ? Number(updatedItem.previous_price) : null,
    stock: Number(updatedItem.stock),
    category_name: updatedItem.categories?.name,
    category_slug: updatedItem.categories?.slug,
  } as Product;
}

/**
 * Deletes a product from Supabase.
 * Throws explicit error if Supabase delete fails.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  if (!id) throw new Error('ID de producto requerido para eliminar.');

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Supabase deleteProduct failed:', error);
    throw new Error(`Error al eliminar en Supabase: ${error.message} (Código: ${error.code})`);
  }

  return true;
}
