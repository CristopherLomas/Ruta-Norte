import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (icono)
     * - archivos con extensiones (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
