"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { driverSchema, DriverInput } from "@/lib/validations";
import { ActionResult, Driver, DriverStatus } from "@/types";

/**
 * Server Action: Listar conductores registrados.
 */
export async function getDriversAction(): Promise<ActionResult<Driver[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drivers")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as Driver[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener los conductores";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Registrar un nuevo conductor.
 */
export async function createDriverAction(input: DriverInput): Promise<ActionResult<Driver>> {
  await requireRole(["admin", "operator"]);

  const parsed = driverSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de conductor inválidos",
    };
  }

  try {
    const supabase = await createClient();

    // Obtener un ID de perfil del usuario actual o crear conductor directo
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const profileId = user?.id || "00000000-0000-0000-0000-000000000001";

    const { data, error } = await supabase
      .from("drivers")
      .insert({
        profile_id: profileId,
        id_card: parsed.data.idCard,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        license_number: parsed.data.licenseNumber,
        license_category: parsed.data.licenseCategory,
        license_expiry: parsed.data.licenseExpiry,
        status: parsed.data.status,
        is_available: parsed.data.isAvailable,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate key")) {
        return { success: false, error: "Ya existe un conductor con este número de licencia o cédula." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Driver };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al registrar el conductor";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cambiar estado operativo del conductor (active, inactive, suspended).
 */
export async function updateDriverStatusAction(
  id: string,
  status: DriverStatus
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("drivers")
      .update({
        status,
        is_available: status === "active",
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar estado del conductor";
    return { success: false, error: msg };
  }
}
