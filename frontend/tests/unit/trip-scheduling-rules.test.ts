import { describe, it, expect } from "vitest";

interface BusAvailability {
  id: string;
  status: "active" | "maintenance" | "inactive";
  isActive: boolean;
}

interface DriverAvailability {
  id: string;
  status: "active" | "inactive" | "suspended";
  isAvailable: boolean;
}

/**
 * Validador de reglas de programación de viajes en servidor (reproduce la lógica de scheduleTripAction)
 */
function validateTripSchedulingEligibility(
  bus: BusAvailability,
  driver: DriverAvailability
): { eligible: boolean; error?: string } {
  if (!bus.isActive || bus.status === "maintenance" || bus.status === "inactive") {
    const estadoMsg = bus.status === "maintenance" ? "mantenimiento" : bus.status;
    return {
      eligible: false,
      error: `No se puede programar el viaje: La unidad seleccionada se encuentra en estado '${estadoMsg}'.`,
    };
  }

  if (!driver.isAvailable || driver.status === "inactive" || driver.status === "suspended") {
    return {
      eligible: false,
      error: `No se puede programar el viaje: El conductor seleccionado se encuentra '${driver.status}'.`,
    };
  }

  return { eligible: true };
}

describe("Reglas de Negocio en Programación de Viajes (Trips)", () => {
  const activeBus: BusAvailability = { id: "bus-1", status: "active", isActive: true };
  const maintenanceBus: BusAvailability = { id: "bus-2", status: "maintenance", isActive: true };
  const inactiveBus: BusAvailability = { id: "bus-3", status: "inactive", isActive: false };

  const availableDriver: DriverAvailability = { id: "driver-1", status: "active", isAvailable: true };
  const suspendedDriver: DriverAvailability = { id: "driver-2", status: "suspended", isAvailable: false };
  const inactiveDriver: DriverAvailability = { id: "driver-3", status: "inactive", isAvailable: false };

  it("debe permitir la programación de salidas cuando la unidad y el conductor están activos y disponibles", () => {
    const res = validateTripSchedulingEligibility(activeBus, availableDriver);
    expect(res.eligible).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it("debe bloquear terminantemente la programación de una unidad que esté en Mantenimiento", () => {
    const res = validateTripSchedulingEligibility(maintenanceBus, availableDriver);
    expect(res.eligible).toBe(false);
    expect(res.error).toContain("mantenimiento");
  });

  it("debe bloquear la programación de una unidad que esté Inactiva o dada de baja", () => {
    const res = validateTripSchedulingEligibility(inactiveBus, availableDriver);
    expect(res.eligible).toBe(false);
    expect(res.error).toContain("inactive");
  });

  it("debe bloquear la programación si el conductor seleccionado está Suspendido", () => {
    const res = validateTripSchedulingEligibility(activeBus, suspendedDriver);
    expect(res.eligible).toBe(false);
    expect(res.error).toContain("suspended");
  });

  it("debe bloquear la programación si el conductor está marcado como Inactivo", () => {
    const res = validateTripSchedulingEligibility(activeBus, inactiveDriver);
    expect(res.eligible).toBe(false);
    expect(res.error).toContain("inactive");
  });
});
