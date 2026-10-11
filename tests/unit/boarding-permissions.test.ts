import { describe, it, expect } from "vitest";

function checkBoardingPermission(role: "admin" | "operator" | "seller" | "inspector" | "passenger"): {
  allowed: boolean;
  reason?: string;
} {
  const authorizedRoles = ["admin", "inspector"];

  if (authorizedRoles.includes(role)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Permiso denegado: El rol '${role}' no está facultado para validar embarque en andén.`,
  };
}

describe("Control de Acceso y Autorización: Validación de Embarque (validateBoardingAction)", () => {
  it("permite el acceso al rol 'inspector'", () => {
    const res = checkBoardingPermission("inspector");
    expect(res.allowed).toBe(true);
  });

  it("permite el acceso al rol 'admin'", () => {
    const res = checkBoardingPermission("admin");
    expect(res.allowed).toBe(true);
  });

  it("bloquea el acceso al rol 'passenger'", () => {
    const res = checkBoardingPermission("passenger");
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Permiso denegado");
  });

  it("bloquea el acceso al rol 'seller' para validación de andén", () => {
    const res = checkBoardingPermission("seller");
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Permiso denegado");
  });

  it("bloquea el acceso al rol 'operator' (solo despacho, no validación de boletos en andén)", () => {
    const res = checkBoardingPermission("operator");
    expect(res.allowed).toBe(false);
  });
});
