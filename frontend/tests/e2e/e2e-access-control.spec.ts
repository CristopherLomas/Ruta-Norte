import { test, expect } from "@playwright/test";

test.describe("Flujo E2E: Control de Acceso y Protección de Rutas por Rol (ADR-004)", () => {
  test("Intento de acceso sin autenticación a /admin es interceptado y redirigido a /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    // Debe redirigir a /login con redirectTo=/admin
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("button", { name: /Iniciar Sesión/i })).toBeVisible();
  });

  test("Intento de acceso sin autenticación a /operator es interceptado y redirigido a /login", async ({
    page,
  }) => {
    await page.goto("/operator");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("button", { name: /Iniciar Sesión/i })).toBeVisible();
  });

  test("Intento de acceso sin autenticación a /inspector es interceptado y redirigido a /login", async ({
    page,
  }) => {
    await page.goto("/inspector");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("button", { name: /Iniciar Sesión/i })).toBeVisible();
  });
});
