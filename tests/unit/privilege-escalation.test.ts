import { describe, it, expect } from "vitest";
import { UserRole } from "@/types";

interface TestUserSession {
  userId: string;
  email: string;
  assignedRole: UserRole;
}

/**
 * Validador de acceso estricto de servidor que implementa la semántica de requireRole()
 */
function verifyRoleAccess(
  session: TestUserSession | null,
  allowedRoles: UserRole[]
): { allowed: boolean; redirect: string } {
  if (!session) {
    return { allowed: false, redirect: "/login" };
  }

  if (!allowedRoles.includes(session.assignedRole)) {
    return { allowed: false, redirect: "/unauthorized" };
  }

  return { allowed: true, redirect: "" };
}

describe("Protección contra Escalada de Privilegios y Control de Acceso por Rol", () => {
  const passengerUser: TestUserSession = {
    userId: "uuid-passenger-123",
    email: "pasajero@rutanorte.ec",
    assignedRole: "passenger",
  };

  const sellerUser: TestUserSession = {
    userId: "uuid-seller-456",
    email: "vendedor@rutanorte.ec",
    assignedRole: "seller",
  };

  const inspectorUser: TestUserSession = {
    userId: "uuid-inspector-789",
    email: "inspector@rutanorte.ec",
    assignedRole: "inspector",
  };

  const adminUser: TestUserSession = {
    userId: "uuid-admin-000",
    email: "admin@rutanorte.ec",
    assignedRole: "admin",
  };

  describe("Protección del Módulo de Administración (/admin)", () => {
    it("debe rechazar el acceso a pasajeros y redirigir a /unauthorized", () => {
      const res = verifyRoleAccess(passengerUser, ["admin"]);
      expect(res.allowed).toBe(false);
      expect(res.redirect).toBe("/unauthorized");
    });

    it("debe rechazar el acceso a vendedores y redirigir a /unauthorized", () => {
      const res = verifyRoleAccess(sellerUser, ["admin"]);
      expect(res.allowed).toBe(false);
      expect(res.redirect).toBe("/unauthorized");
    });

    it("debe rechazar el acceso a inspectores y redirigir a /unauthorized", () => {
      const res = verifyRoleAccess(inspectorUser, ["admin"]);
      expect(res.allowed).toBe(false);
      expect(res.redirect).toBe("/unauthorized");
    });

    it("debe permitir el acceso exclusivo a usuarios con rol admin", () => {
      const res = verifyRoleAccess(adminUser, ["admin"]);
      expect(res.allowed).toBe(true);
    });
  });

  describe("Protección del Módulo de Taquilla (/seller)", () => {
    it("debe rechazar a pasajeros comunes", () => {
      const res = verifyRoleAccess(passengerUser, ["admin", "seller"]);
      expect(res.allowed).toBe(false);
      expect(res.redirect).toBe("/unauthorized");
    });

    it("debe permitir el acceso a vendedores autorizados y administradores", () => {
      expect(verifyRoleAccess(sellerUser, ["admin", "seller"]).allowed).toBe(true);
      expect(verifyRoleAccess(adminUser, ["admin", "seller"]).allowed).toBe(true);
    });
  });

  describe("Protección del Módulo de Inspección (/inspector)", () => {
    it("debe rechazar a usuarios no autorizados", () => {
      expect(verifyRoleAccess(passengerUser, ["admin", "inspector"]).allowed).toBe(false);
      expect(verifyRoleAccess(sellerUser, ["admin", "inspector"]).allowed).toBe(false);
    });

    it("debe permitir el acceso a inspectores autorizados", () => {
      expect(verifyRoleAccess(inspectorUser, ["admin", "inspector"]).allowed).toBe(true);
    });
  });

  describe("Sesión no iniciada (invitados / anónimos)", () => {
    it("debe redirigir a /login ante cualquier intento de acceso a rutas protegidas", () => {
      const res = verifyRoleAccess(null, ["passenger"]);
      expect(res.allowed).toBe(false);
      expect(res.redirect).toBe("/login");
    });
  });
});
