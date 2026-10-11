"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { cooperativeSchema, CooperativeInput } from "@/lib/validations";
import { ActionResult, Cooperative } from "@/types";

/**
 * Server Action: Listar cooperativas registradas.
 */
export async function getCooperativesAction(): Promise<ActionResult<Cooperative[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cooperatives")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as Cooperative[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener cooperativas";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Crear una nueva cooperativa (requiere rol admin u operator).
 */
export async function createCooperativeAction(
  input: CooperativeInput
): Promise<ActionResult<Cooperative>> {
  // Validación estricta de autorización en servidor
  await requireRole(["admin", "operator"]);

  const parsed = cooperativeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de cooperativa inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cooperatives")
      .insert({
        name: parsed.data.name,
        ruc: parsed.data.ruc,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        logo_url: parsed.data.logoUrl || null,
        is_active: parsed.data.isActive,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate key")) {
        return { success: false, error: "Ya existe una cooperativa registrada con este número de RUC." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Cooperative };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al registrar la cooperativa";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Actualizar cooperativa existente.
 */
export async function updateCooperativeAction(
  id: string,
  input: Partial<CooperativeInput>
): Promise<ActionResult<Cooperative>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cooperatives")
      .update({
        ...(input.name && { name: input.name }),
        ...(input.ruc && { ruc: input.ruc }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.address !== undefined && { address: input.address || null }),
        ...(input.logoUrl !== undefined && { logo_url: input.logoUrl || null }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Cooperative };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar la cooperativa";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Baja lógica de cooperativa (evita violaciones de integridad referencial).
 */
export async function toggleCooperativeStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("cooperatives")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al cambiar el estado de la cooperativa";
    return { success: false, error: msg };
  }
}
