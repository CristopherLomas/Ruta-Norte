import { createClient } from "@/lib/supabase/server";
import { UserRole, Profile } from "@/types";

interface UserRoleQueryResult {
  roles: {
    name: UserRole;
  } | null;
}

/**
 * Obtiene el usuario autenticado actual desde la sesión de Supabase Auth (Servidor).
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Obtiene el rol verificado del usuario actual desde la base de datos relacional.
 * NUNCA confía en metadatos editables del cliente.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createClient();

    // Consulta directa a la relación user_roles -> roles
    const { data, error } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.roles) {
      return "passenger";
    }

    const typedData = data as unknown as UserRoleQueryResult;
    return typedData.roles?.name || "passenger";
  } catch {
    return "passenger";
  }
}

/**
 * Obtiene el perfil completo del usuario actual desde la tabla profiles.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  } catch {
    return null;
  }
}
