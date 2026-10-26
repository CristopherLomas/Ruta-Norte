import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

const DEFAULT_SUPABASE_URL = "https://npgxydljljhatmjaaxnj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_zkuRxgcFOqXNocvK4RDxUA_ZPZlY2MU";

/**
 * Cliente de Supabase para Server Components y Server Actions.
 * Lee y sincroniza cookies de autenticación de forma segura.
 */
export async function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // El método `setAll` fue invocado desde un Server Component.
          // Esto puede ser ignorado si el middleware refresca la sesión.
        }
      },
    },
  });
}
