"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { createIncidentSchema, CreateIncidentInput } from "@/lib/validations";
import { ActionResult, Incident } from "@/types";

/**
 * Server Action: Listar incidencias registradas.
 */
export async function getIncidentsAction(): Promise<ActionResult<Incident[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("reported_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as Incident[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener las incidencias";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Registrar una nueva incidencia operativa en ruta.
 */
export async function reportIncidentAction(
  input: CreateIncidentInput
): Promise<ActionResult<Incident>> {
  const { user } = await requireRole(["admin", "operator", "inspector"]);

  const parsed = createIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de incidencia inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("incidents")
      .insert({
        trip_id: parsed.data.tripId,
        reported_by: user.id,
        type: parsed.data.type,
        severity: parsed.data.severity,
        description: parsed.data.description,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Incident };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al registrar la incidencia";
    return { success: false, error: msg };
  }
}
