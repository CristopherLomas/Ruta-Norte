import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint de intercambio de código OAuth para Supabase Auth (Google, GitHub, etc.)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/pasajero";
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.session?.user) {
        const user = data.session.user;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Usuario Google";

        // Creamos la redirección estableciendo también la cookie rn_token para compatibilidad
        const response = NextResponse.redirect(new URL(next, origin));
        if (data.session.access_token) {
          response.cookies.set("rn_token", data.session.access_token, {
            path: "/",
            maxAge: 86400 * 7,
            sameSite: "lax",
          });
        }
        return response;
      }
    } catch (err) {
      console.error("Error en auth callback:", err);
    }
  }

  // Redirigir a login si falla
  return NextResponse.redirect(new URL("/login?error=oauth_error", origin));
}
