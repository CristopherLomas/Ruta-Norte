import { describe, it, expect } from "vitest";
import { getSafeRedirectUrl, DEFAULT_DASHBOARD_ROUTES } from "@/lib/auth/redirects";

describe("Prevención de Redirección Abierta (Open Redirect) — getSafeRedirectUrl", () => {
  it("debe redirigir al dashboard correspondiente a cada rol cuando no hay URL solicitada", () => {
    expect(getSafeRedirectUrl(null, "admin")).toBe("/admin");
    expect(getSafeRedirectUrl(undefined, "operator")).toBe("/operator");
    expect(getSafeRedirectUrl("", "seller")).toBe("/seller");
    expect(getSafeRedirectUrl(null, "inspector")).toBe("/inspector");
    expect(getSafeRedirectUrl(null, "passenger")).toBe("/passenger");
  });

  it("debe permitir rutas relativas locales seguras", () => {
    expect(getSafeRedirectUrl("/passenger/bookings", "passenger")).toBe("/passenger/bookings");
    expect(getSafeRedirectUrl("/admin/routes", "admin")).toBe("/admin/routes");
    expect(getSafeRedirectUrl("/inspector/scan", "inspector")).toBe("/inspector/scan");
  });

  it("debe neutralizar intentos de ataque de Open Redirect con URLs absolutas externas", () => {
    const maliciousHttp = "http://sitio-malicioso.com";
    const maliciousHttps = "https://phishing.com/login";

    // Debe neutralizarse retornando la ruta por defecto segura del rol
    expect(getSafeRedirectUrl(maliciousHttp, "admin")).toBe("/admin");
    expect(getSafeRedirectUrl(maliciousHttps, "passenger")).toBe("/passenger");
  });

  it("debe neutralizar esquemas de barra doble que evaden navegadores (//evil.com)", () => {
    const protocolRelative = "//sitio-atacante.com";
    expect(getSafeRedirectUrl(protocolRelative, "seller")).toBe("/seller");
  });

  it("debe neutralizar esquemas de pseudoprotocolos como javascript: o data:", () => {
    const jsScheme = "javascript:alert(document.cookie)";
    expect(getSafeRedirectUrl(jsScheme, "operator")).toBe("/operator");
  });

  it("debe neutralizar secuencias de path traversal (..)", () => {
    const pathTraversal = "/../etc/passwd";
    expect(getSafeRedirectUrl(pathTraversal, "admin")).toBe("/admin");
  });
});
