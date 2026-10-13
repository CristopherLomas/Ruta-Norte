"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { ActionResult, TripStatus } from "@/types";

/**
 * Server Action: Cambiar estado de despacho de un viaje en tiempo real.
 */
export async function updateTripDispatchStatusAction(
  tripId: string,
  newStatus: TripStatus
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("trips")
      .update({ status: newStatus })
      .eq("id", tripId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar el estado de despacho";
    return { success: false, error: msg };
  }
}
