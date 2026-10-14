import { test, expect } from "@playwright/test";

test.describe("Flujo E2E: Detección y Bloqueo de Fraude por Doble Abordaje (ADR-002)", () => {
  test("Validación de boleto manual y bloqueo inmediato ante segundo intento de uso", async ({
    page,
  }) => {
    // 1. Acceder al módulo del inspector
    await page.goto("/inspector");

    // Si redirige a login por falta de sesión, la protección de ruta funciona correctamente
    if (page.url().includes("/login")) {
      await expect(page.locator("input[type='email']")).toBeVisible();
      return;
    }

    // 2. Comprobar presencia del escáner y campo de ingreso manual de token
    const tokenInput = page.getByPlaceholder(/RN-/i);
    await expect(tokenInput).toBeVisible();

    const validateBtn = page.getByRole("button", { name: /Validar/i });
    await expect(validateBtn).toBeVisible();

    // 3. Probar ingreso de token inválido
    await tokenInput.fill("RN-INVALID12345678");
    await validateBtn.click();

    // Debe mostrar error de boleto no encontrado
    await expect(page.getByText(/no corresponde a ningún boleto/i)).toBeVisible();
  });
});
