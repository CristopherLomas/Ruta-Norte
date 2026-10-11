"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { busSchema, BusInput } from "@/lib/validations";
import { ActionResult, Bus, BusLayoutConfig } from "@/types";
import { generateSeatsFromLayout } from "../utils";

/**
 * Server Action: Listar buses y unidades registradas.
 */
export async function getBusesAction(): Promise<ActionResult<Bus[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("buses")
      .select("*, cooperatives(*)")
      .order("unit_number", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as Bus[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener las unidades";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Crear una nueva unidad con layout JSONB y asientos sincronizados (ADR-003).
 */
export async function createBusAction(input: BusInput): Promise<ActionResult<Bus>> {
  await requireRole(["admin", "operator"]);

  const parsed = busSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de unidad inválidos",
    };
  }

  try {
    const supabase = await createClient();

    // 1. Construir layout_config JSONB
    const columnLabels = parsed.data.columns === 4 ? ["A", "B", "_", "C", "D"] : ["A", "B", "C"];
    const layoutConfig: BusLayoutConfig = {
      rows: parsed.data.rows,
      columns: parsed.data.columns,
      column_labels: columnLabels,
      special_seats: [
        { seat_number: "1A", type: "accessibility" },
        { seat_number: "1B", type: "accessibility" },
      ],
    };

    // 2. Generar lista de asientos
    const calculatedSeats = generateSeatsFromLayout(parsed.data.rows, parsed.data.columns, columnLabels);
    const totalCalculatedSeats = calculatedSeats.length;

    // 3. Insertar la unidad en la base de datos
    const { data: busData, error: busError } = await supabase
      .from("buses")
      .insert({
        cooperative_id: parsed.data.cooperativeId || null,
        plate: parsed.data.plate.toUpperCase(),
        unit_number: parsed.data.unitNumber,
        model: parsed.data.model || null,
        brand: parsed.data.brand || null,
        chassis: parsed.data.chassis || null,
        year: parsed.data.year,
        total_seats: totalCalculatedSeats,
        layout_config: layoutConfig,
        status: parsed.data.status,
        is_active: parsed.data.isActive,
      })
      .select()
      .single();

    if (busError) {
      if (busError.message.includes("unique") || busError.message.includes("duplicate key")) {
        return { success: false, error: "Ya existe un vehículo registrado con esta placa." };
      }
      return { success: false, error: busError.message };
    }

    // 4. Insertar asientos relacionales en bus_seats
    const seatsToInsert = calculatedSeats.map((s) => ({
      bus_id: busData.id,
      seat_number: s.seatNumber,
      seat_row: s.seatRow,
      seat_column: s.seatColumn,
      seat_type: s.seatType,
      is_active: true,
    }));

    const { error: seatsError } = await supabase
      .from("bus_seats")
      .insert(seatsToInsert);

    if (seatsError) {
      return { success: false, error: `Error al generar asientos de la unidad: ${seatsError.message}` };
    }

    return { success: true, data: busData as Bus };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al registrar la unidad";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Actualizar estado operativo de una unidad (active, maintenance, inactive).
 */
export async function updateBusStatusAction(
  id: string,
  status: "active" | "maintenance" | "inactive"
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("buses")
      .update({
        status,
        is_active: status === "active",
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar estado de la unidad";
    return { success: false, error: msg };
  }
}
