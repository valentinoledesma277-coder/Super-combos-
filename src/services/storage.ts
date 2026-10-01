import { supabase } from '../utils/supabase/client';

const PRIMARY_BUCKET = 'product-images';
const FALLBACK_BUCKET = 'products';

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Try PRIMARY_BUCKET first
  let { error: uploadError } = await supabase.storage
    .from(PRIMARY_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  let activeBucket = PRIMARY_BUCKET;

  // If failed, try FALLBACK_BUCKET
  if (uploadError) {
    const fallbackAttempt = await supabase.storage
      .from(FALLBACK_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!fallbackAttempt.error) {
      uploadError = null;
      activeBucket = FALLBACK_BUCKET;
    }
  }

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError.message);
    throw new Error(
      `Error al subir imagen a Supabase Storage: ${uploadError.message}. Verificá que el bucket 'product-images' o 'products' exista y tenga permisos públicos.`
    );
  }

  const { data } = supabase.storage.from(activeBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    let bucket = '';
    if (imageUrl.includes(PRIMARY_BUCKET)) {
      bucket = PRIMARY_BUCKET;
    } else if (imageUrl.includes(FALLBACK_BUCKET)) {
      bucket = FALLBACK_BUCKET;
    } else {
      return false;
    }

    const parts = imageUrl.split(`${bucket}/`);
    if (parts.length < 2) return false;
    const filePath = parts[1];

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    return !error;
  } catch (err) {
    console.warn('Failed to delete image from bucket:', err);
    return false;
  }
}
