import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://npgxydljljhatmjaaxnj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_zkuRxgcFOqXNocvK4RDxUA_ZPZlY2MU";

/**
 * Cliente de Supabase para componentes del navegador (Client Components).
 * Utiliza las variables públicas y maneja las cookies del navegador automáticamente.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
