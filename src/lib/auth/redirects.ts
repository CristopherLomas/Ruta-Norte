import { UserRole } from "@/types";

/**
 * Mapeo de rutas de inicio predeterminadas para cada rol del sistema.
 */
export const DEFAULT_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/admin",
  operator: "/operator",
  seller: "/seller",
  inspector: "/inspector",
  passenger: "/passenger",
};

/**
 * Valida y obtiene una URL de redirección segura para evitar ataques de redirección abierta (Open Redirect).
 * @param requestedUrl URL solicitada como destino (ej: query param ?redirect=/admin)
 * @param userRole Rol verificado del usuario
 * @returns Ruta local segura a la cual redirigir
 */
export function getSafeRedirectUrl(requestedUrl: string | null | undefined, userRole: UserRole): string {
  const defaultRoute = DEFAULT_DASHBOARD_ROUTES[userRole] || "/passenger";

  if (!requestedUrl) {
    return defaultRoute;
  }

  // Sanitización de URL: debe comenzar con '/' y NO con '//', ni contener protocolos maliciosos
  const trimmed = requestedUrl.trim();

  // Rechazar URLs absolutas o con protocolos (ej: http://, https://, //malicious.com, javascript:)
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes(":") ||
    trimmed.includes("..")
  ) {
    return defaultRoute;
  }

  return trimmed;
}
