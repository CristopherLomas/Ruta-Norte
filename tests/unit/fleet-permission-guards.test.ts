import { describe, it, expect } from "vitest";
import { UserRole } from "@/types";

/**
 * Simulador de verificación de permisos para operaciones de flota y rutas en Server Actions
 */
function verifyFleetOperationPermission(role: UserRole): { allowed: boolean; error?: string } {
  const allowedRoles: UserRole[] = ["admin", "operator"];

  if (!allowedRoles.includes(role)) {
    return {
      allowed: false,
      error: `Acceso no autorizado: Se requiere rol de administrador u operador. Su rol actual es '${role}'.`,
    };
  }

  return { allowed: true };
}

describe("Verificación de Permisos en Operaciones de Flota y Rutas (Fase 3)", () => {
  it("un pasajero ('passenger') debe recibir error de autorización al intentar crear rutas o buses", () => {
    const res = verifyFleetOperationPermission("passenger");
    expect(res.allowed).toBe(false);
    expect(res.error).toContain("Acceso no autorizado");
  });

  it("un vendedor de taquilla ('seller') debe recibir error de autorización al intentar crear rutas o buses", () => {
    const res = verifyFleetOperationPermission("seller");
    expect(res.allowed).toBe(false);
    expect(res.error).toContain("Acceso no autorizado");
  });

  it("un inspector ('inspector') debe recibir error de autorización al intentar gestionar flota", () => {
    const res = verifyFleetOperationPermission("inspector");
    expect(res.allowed).toBe(false);
    expect(res.error).toContain("Acceso no autorizado");
  });

  it("un operador ('operator') debe tener autorización concedida para gestionar rutas y flota", () => {
    const res = verifyFleetOperationPermission("operator");
    expect(res.allowed).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it("un administrador ('admin') debe tener autorización total para gestionar rutas y flota", () => {
    const res = verifyFleetOperationPermission("admin");
    expect(res.allowed).toBe(true);
    expect(res.error).toBeUndefined();
  });
});
