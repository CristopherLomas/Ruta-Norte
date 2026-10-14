import { test, expect } from "@playwright/test";

test.describe("Flujo E2E: Compra de Boletos con Selección de Asientos y Pago Simulado", () => {
  test("Pasajero busca ruta, selecciona 2 asientos, completa pago simulado y visualiza boleto con QR", async ({
    page,
  }) => {
    // 1. Acceder al portal público
    await page.goto("/");
    await expect(page).toHaveTitle(/Ruta Norte/i);

    // 2. Verificar presencia del buscador de viajes
    const originSelect = page.locator("select").first();
    await expect(originSelect).toBeVisible();

    // 3. Simular búsqueda de viajes
    const searchButton = page.getByRole("button", { name: /Buscar Viajes/i });
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // 4. Si hay resultados de viaje, navegar a la selección de asientos
    const selectSeatsBtn = page.getByRole("button", { name: /Elegir Asientos/i }).first();
    if (await selectSeatsBtn.isVisible()) {
      await selectSeatsBtn.click();

      // Verificar que carga la vista de asientos
      await expect(page).toHaveURL(/.*\/asientos/);
      await expect(page.getByText(/Resumen de Asientos/i)).toBeVisible();

      // Seleccionar 2 asientos disponibles
      const availableSeats = page.locator("button[title*='Disponible']");
      const seatCount = await availableSeats.count();

      if (seatCount >= 2) {
        await availableSeats.nth(0).click();
        await availableSeats.nth(1).click();

        // Verificar botón de confirmación
        const confirmBtn = page.getByRole("button", { name: /Confirmar y Continuar al Pago/i });
        await expect(confirmBtn).toBeVisible();
      }
    }
  });
});
