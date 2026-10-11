import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentRole, getCurrentProfile } from "./session";
import { UserRole } from "@/types";

/**
 * Guardia de servidor: Requiere que exista una sesión activa.
 * Si el usuario no está autenticado, redirige inmediatamente al login.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const role = await getCurrentRole();
  const profile = await getCurrentProfile();

  return {
    user,
    role: role || "passenger",
    profile,
  };
}

/**
 * Guardia de servidor: Requiere que el usuario tenga uno de los roles autorizados.
 * Si no está autenticado, redirige a /login.
 * Si su rol no está autorizado, redirige a /unauthorized.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const auth = await requireAuth();

  if (!allowedRoles.includes(auth.role)) {
    redirect("/unauthorized");
  }

  return auth;
}
