import { createServerClient, type CookieOptions } from '@supabase/ssr';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://lazxzjumhxpetfmfbene.supabase.co';
const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T';

export const createClient = (request: any) => {
  let supabaseResponse = {
    headers: new Headers(),
    cookies: {
      set: (_name: string, _value: string, _options?: any) => {},
    },
  };

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request?.cookies?.getAll ? request.cookies.getAll() : [];
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            if (request?.cookies?.set) request.cookies.set(name, value);
            if (supabaseResponse?.cookies?.set) supabaseResponse.cookies.set(name, value, options);
          });
        } catch {}
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

export async function updateSession(request: any, responseObj?: any) {

  let response = responseObj || {
    headers: new Headers(),
    cookies: new Map(),
  };

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://lazxzjumhxpetfmfbene.supabase.co';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies?.getAll ? request.cookies.getAll() : [];
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies?.set?.(name, value);
            response = responseObj || response;
            response.cookies?.set?.(name, value, options);
          });
        } catch {}
      },
    },
  });

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection logic
  const pathname = request.nextUrl?.pathname || request.url || '';

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return { redirect: '/admin/login', response, user: null };
    }

    // Verify role in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { redirect: '/admin/login?error=unauthorized', response, user };
    }
  }

  return { response, user };
}
