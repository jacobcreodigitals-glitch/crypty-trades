import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createSupabaseServer = () => {
  const nextCookies = cookies();

  const cookieMethods = {
    get: (key: string) => {
      const cookie = nextCookies.get(key);
      return cookie?.value ?? null;
    },
    set: (key: string, value: string, options: any) => {
      nextCookies.set(key, value, options);
    },
    remove: (key: string) => {
      nextCookies.delete(key);
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
};
