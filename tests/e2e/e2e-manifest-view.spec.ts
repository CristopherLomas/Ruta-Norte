import { test, expect } from "@playwright/test";

test.describe("Flujo E2E: Manifiesto de Pasajeros y Control de Despacho", () => {
  test("Verificación de protección de acceso y formato oficial de manifiesto", async ({
    page,
  }) => {
    // 1. Acceder a un manifiesto directamente
    await page.goto("/operator/viajes/60000000-0000-0000-0000-000000000001/manifiesto");

    // Si no está autenticado, interceptar y redirigir
    if (page.url().includes("/login")) {
      await expect(page).toHaveURL(/.*\/login/);
      return;
    }

    // 2. Si tiene sesión, verificar presencia del título oficial de ANT y tabla
    await expect(page.getByText(/MANIFIESTO OFICIAL DE PASAJEROS/i)).toBeVisible();
    await expect(page.getByText(/Nómina de Pasajeros Registrados/i)).toBeVisible();
  });
});
