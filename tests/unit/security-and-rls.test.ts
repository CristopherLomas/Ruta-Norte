import { describe, it, expect } from "vitest";
import { UserRole } from "@/types";

/**
 * Simulador de verificación de permisos basado en get_user_role() y has_role()
 * definido en la migración 002.
 */
function hasRole(currentRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(currentRole);
}

function canManageFleet(role: UserRole): boolean {
  return hasRole(role, ["admin", "operator"]);
}

function canIssueCashTicket(role: UserRole): boolean {
  return hasRole(role, ["admin", "seller"]);
}

function canValidateBoarding(role: UserRole): boolean {
  return hasRole(role, ["admin", "inspector"]);
}

function canAccessAuditLogs(role: UserRole): boolean {
  return hasRole(role, ["admin"]);
}

describe("Políticas de Seguridad y Control de Acceso por Rol (docs/security-model.md)", () => {
  it("un pasajero (passenger) NO debe tener acceso a gestión de flota ni a taquilla ni a inspección", () => {
    const role: UserRole = "passenger";
    expect(canManageFleet(role)).toBe(false);
    expect(canIssueCashTicket(role)).toBe(false);
    expect(canValidateBoarding(role)).toBe(false);
    expect(canAccessAuditLogs(role)).toBe(false);
  });

  it("un operador (operator) debe poder gestionar flota pero no acceder a auditoría de seguridad", () => {
    const role: UserRole = "operator";
    expect(canManageFleet(role)).toBe(true);
    expect(canAccessAuditLogs(role)).toBe(false);
  });

  it("un inspector (inspector) solo debe poder validar embarques pero no gestionar rutas ni taquilla", () => {
    const role: UserRole = "inspector";
    expect(canValidateBoarding(role)).toBe(true);
    expect(canManageFleet(role)).toBe(false);
    expect(canIssueCashTicket(role)).toBe(false);
  });

  it("un vendedor (seller) debe poder emitir boletos en taquilla pero no alterar rutas ni buses", () => {
    const role: UserRole = "seller";
    expect(canIssueCashTicket(role)).toBe(true);
    expect(canManageFleet(role)).toBe(false);
    expect(canValidateBoarding(role)).toBe(false);
  });

  it("el administrador (admin) debe tener acceso privilegiado a todas las operaciones y auditoría", () => {
    const role: UserRole = "admin";
    expect(canManageFleet(role)).toBe(true);
    expect(canIssueCashTicket(role)).toBe(true);
    expect(canValidateBoarding(role)).toBe(true);
    expect(canAccessAuditLogs(role)).toBe(true);
  });
});
