import { describe, it, expect } from "vitest";

interface TicketCheckContext {
  ticketOwnerId: string;
  requestingUserId: string;
  requestingUserRole: "admin" | "operator" | "seller" | "inspector" | "passenger";
}

/**
 * Validador de autorización que aplica las políticas de seguridad y RLS de tickets:
 * - Un pasajero SOLO puede visualizar sus propios boletos.
 * - Roles operativos autorizados ('admin', 'seller', 'inspector', 'operator') tienen visibilidad.
 */
function authorizeTicketView(ctx: TicketCheckContext): { authorized: boolean; reason?: string } {
  if (ctx.requestingUserId === ctx.ticketOwnerId) {
    return { authorized: true };
  }

  const staffRoles = ["admin", "seller", "inspector", "operator"];
  if (staffRoles.includes(ctx.requestingUserRole)) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: "Acceso no autorizado: No tienes permiso para visualizar este boleto.",
  };
}

describe("Seguridad y RLS: Autorización de visualización de boletos", () => {
  const passengerA = "user-passenger-aaa";
  const passengerB = "user-passenger-bbb";
  const adminUser = "user-admin-999";
  const inspectorUser = "user-inspector-888";
  const sellerUser = "user-seller-777";

  it("permite a un pasajero visualizar su propio boleto", () => {
    const result = authorizeTicketView({
      ticketOwnerId: passengerA,
      requestingUserId: passengerA,
      requestingUserRole: "passenger",
    });

    expect(result.authorized).toBe(true);
  });

  it("bloquea estrictamente a un pasajero de ver boletos emitidos a otro pasajero", () => {
    const result = authorizeTicketView({
      ticketOwnerId: passengerA,
      requestingUserId: passengerB, // Pasajero ajeno
      requestingUserRole: "passenger",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toContain("Acceso no autorizado");
  });

  it("permite a un inspector autorizado visualizar boletos para control de embarque", () => {
    const result = authorizeTicketView({
      ticketOwnerId: passengerA,
      requestingUserId: inspectorUser,
      requestingUserRole: "inspector",
    });

    expect(result.authorized).toBe(true);
  });

  it("permite al administrador y taquillero consultar boletos para fines operativos", () => {
    const adminCheck = authorizeTicketView({
      ticketOwnerId: passengerA,
      requestingUserId: adminUser,
      requestingUserRole: "admin",
    });
    expect(adminCheck.authorized).toBe(true);

    const sellerCheck = authorizeTicketView({
      ticketOwnerId: passengerA,
      requestingUserId: sellerUser,
      requestingUserRole: "seller",
    });
    expect(sellerCheck.authorized).toBe(true);
  });
});
