import { createClient } from "@supabase/supabase-js";

/**
 * Cliente administrativo de Supabase con Service Role Key.
 * EXCLUSIVAMENTE para ejecución en servidor (Server Actions privilegiadas, webhooks, seed).
 * NUNCA exponer ni importar este cliente en componentes de cliente ni navegadores.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
