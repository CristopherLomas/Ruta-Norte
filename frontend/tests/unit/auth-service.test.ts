import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock de Supabase client y axiosClient para tests unitarios rápidos y deterministas
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: new Error("Mock offline") }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: "https://accounts.google.com/o/oauth2/v2/auth" }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

vi.mock("@/lib/axiosClient", () => ({
  axiosClient: {
    post: vi.fn().mockRejectedValue(new Error("Mock network unavailable")),
  },
}));

import { authService } from "@/features/auth/services/authService";

describe("authService - Módulo de Autenticación y Google Sign-In", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe("Google 1-Clic Login", () => {
    it("debe iniciar sesión instantáneamente con un perfil de Google y guardar la sesión", () => {
      const googleProfile = {
        name: "Cristopher Lomas",
        email: "cristopher.lomas@upec.edu.ec",
        dni: "0401893421",
        role: "PASSENGER",
      };

      const user = authService.loginWithGoogleProfile(googleProfile);

      expect(user).toBeDefined();
      expect(user.name).toBe("Cristopher Lomas");
      expect(user.email).toBe("cristopher.lomas@upec.edu.ec");
      expect(user.role).toBe("PASSENGER");
      expect(user.provider).toBe("GOOGLE");
      expect(user.token).toContain("rn-google-");

      // Verificar que se guardó en el almacenamiento
      const currentUser = authService.getCurrentUser();
      expect(currentUser).not.toBeNull();
      expect(currentUser?.email).toBe("cristopher.lomas@upec.edu.ec");
      expect(currentUser?.token).toBe(user.token);
    });

    it("debe soportar perfiles de Google con rol personalizado y generar avatar de fallback", () => {
      const user = authService.loginWithGoogleProfile({
        name: "Viajero Pasajero",
        email: "pasajero.norte@gmail.com",
      });

      expect(user.email).toBe("pasajero.norte@gmail.com");
      expect(user.picture).toContain("ui-avatars.com");
    });
  });

  describe("Registro de Nuevos Pasajeros (authService.register)", () => {
    it("debe registrar un nuevo usuario y loguearlo inmediatamente", async () => {
      const newUser = await authService.register({
        fullName: "María Belén Imbaquingo",
        email: "mbelen@upec.edu.ec",
        password: "passwordSeguro123",
        dni: "1004567890",
        phone: "0991234567",
      });

      expect(newUser.name).toBe("María Belén Imbaquingo");
      expect(newUser.email).toBe("mbelen@upec.edu.ec");
      expect(newUser.role).toBe("PASSENGER");

      // La sesión activa debe ser el nuevo usuario
      const active = authService.getCurrentUser();
      expect(active?.email).toBe("mbelen@upec.edu.ec");

      // Debe poder volver a iniciar sesión con sus credenciales registradas
      authService.logout();
      expect(authService.getCurrentUser()).toBeNull();

      const loggedIn = await authService.login({
        email: "mbelen@upec.edu.ec",
        password: "passwordSeguro123",
      });
      expect(loggedIn.email).toBe("mbelen@upec.edu.ec");
    });
  });

  describe("Login con Cuentas de Acceso Rápido y Demo", () => {
    it("debe autenticar al Administrador Central con credenciales demo", async () => {
      const admin = await authService.login({
        email: "admin@rutanorte.ec",
        password: "admin",
      });

      expect(admin.role).toBe("ADMIN");
      expect(admin.name).toBe("Administrador Central");
      expect(authService.getCurrentUser()?.role).toBe("ADMIN");
    });

    it("debe autenticar al Taquillero / Personal de Operaciones", async () => {
      const staff = await authService.login({
        email: "staff@rutanorte.ec",
        password: "staff",
      });

      expect(staff.role).toBe("STAFF");
      expect(authService.getCurrentUser()?.role).toBe("STAFF");
    });

    it("debe rechazar credenciales no registradas o erróneas", async () => {
      await expect(
        authService.login({
          email: "desconocido@correo.com",
          password: "passwordFalsa",
        })
      ).rejects.toThrow("Correo electrónico o contraseña incorrectos.");
    });
  });

  describe("Cierre de Sesión (authService.logout)", () => {
    it("debe limpiar los tokens y datos de usuario en localStorage y sessionStorage", () => {
      authService.loginWithGoogleProfile({
        name: "Test User",
        email: "test@example.com",
      });

      expect(authService.getCurrentUser()).not.toBeNull();

      authService.logout();

      expect(authService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem("rn_user")).toBeNull();
      expect(localStorage.getItem("rn_token")).toBeNull();
    });
  });
});
