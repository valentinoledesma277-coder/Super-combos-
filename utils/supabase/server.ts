import { createServerClient } from '@supabase/ssr';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://lazxzjumhxpetfmfbene.supabase.co';

const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T';

/**
 * Creates a Supabase client for Server-Side operations / Next.js server components / route handlers.
 */
export function createClient(cookieStore?: any) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        if (cookieStore?.getAll) return cookieStore.getAll();
        return [];
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (cookieStore?.set) {
              cookieStore.set(name, value, options);
            }
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

