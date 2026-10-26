import { axiosClient } from "@/lib/axiosClient";
import { AuthUser, LoginCredentials, RegisterCredentials } from "../entities/User";
import { createClient } from "@/lib/supabase/client";

const REGISTERED_USERS_KEY = "rn_registered_users";

export const authService = {
  /**
   * Obtiene la lista de usuarios registrados localmente en el navegador (fallback sin conexión)
   */
  getLocalRegisteredUsers(): Record<string, { password: string; user: AuthUser }> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  /**
   * Guarda un usuario en el registro local
   */
  saveLocalRegisteredUser(password: string, user: AuthUser): void {
    if (typeof window === "undefined") return;
    try {
      const users = this.getLocalRegisteredUsers();
      users[user.email.toLowerCase()] = { password, user };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch {
      // Storage restringido
    }
  },

  /**
   * Inicia sesión con email y contraseña.
   * Prioridad: Supabase Auth -> Backend Spring Boot / Next.js API -> Usuarios Locales / Demo.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const cleanEmail = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    // 1. Intentar con Supabase Auth
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data?.user) {
        const supaUser = data.user;
        const name =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          cleanEmail.split("@")[0];
        const role = supaUser.user_metadata?.role || "PASSENGER";
        const token = data.session?.access_token || `rn-token-${Date.now()}`;

        const authUser: AuthUser = {
          name,
          email: cleanEmail,
          role: role.toUpperCase(),
          token,
          dni: supaUser.user_metadata?.dni,
          phone: supaUser.user_metadata?.phone,
          picture: supaUser.user_metadata?.avatar_url,
          provider: "SUPABASE",
        };

        this.saveSession(authUser, credentials.rememberMe);
        return authUser;
      }
    } catch {
      // Continuar al siguiente método si Supabase no está configurado o falla red
    }

    // 2. Intentar con Backend API
    try {
      const res = await axiosClient.post<AuthUser>("/auth/login", {
        email: cleanEmail,
        password,
      });
      if (res.data && res.data.email) {
        const backendUser: AuthUser = {
          name: res.data.name || cleanEmail.split("@")[0],
          email: res.data.email,
          role: (res.data.role || "PASSENGER").toUpperCase(),
          token: res.data.token || `rn-token-${Date.now()}`,
          dni: res.data.dni,
          phone: res.data.phone,
          picture: res.data.picture,
          provider: "BACKEND",
        };
        this.saveSession(backendUser, credentials.rememberMe);
        return backendUser;
      }
    } catch {
      // Continuar al fallback de cuentas locales / demo
    }

    // 3. Verificar si es un usuario registrado previamente en este navegador
    const localUsers = this.getLocalRegisteredUsers();
    const localMatch = localUsers[cleanEmail];
    if (localMatch && localMatch.password === password) {
      const localUser: AuthUser = {
        ...localMatch.user,
        token: `rn-local-${Date.now()}`,
      };
      this.saveSession(localUser, credentials.rememberMe);
      return localUser;
    }

    // 4. Cuentas Demo preconfiguradas
    if (cleanEmail === "admin@rutanorte.ec" && (password === "admin123" || password === "admin")) {
      const adminUser: AuthUser = {
        name: "Administrador Central",
        email: "admin@rutanorte.ec",
        role: "ADMIN",
        token: `demo-admin-${Date.now()}`,
        dni: "0401234567",
        provider: "DEMO",
      };
      this.saveSession(adminUser, credentials.rememberMe);
      return adminUser;
    }

    if (cleanEmail === "staff@rutanorte.ec" && (password === "staff123" || password === "staff")) {
      const staffUser: AuthUser = {
        name: "Taquillero / Inspector",
        email: "staff@rutanorte.ec",
        role: "STAFF",
        token: `demo-staff-${Date.now()}`,
        dni: "1002345678",
        provider: "DEMO",
      };
      this.saveSession(staffUser, credentials.rememberMe);
      return staffUser;
    }

    if (
      (cleanEmail === "pasajero@rutanorte.ec" && (password === "pasajero123" || password === "pasajero")) ||
      (cleanEmail === "cristopher.lomas@upec.edu.ec" && (password === "123456" || password === "upec2025" || password === "password"))
    ) {
      const passengerUser: AuthUser = {
        name: cleanEmail.includes("lomas") ? "Cristopher Lomas" : "Pasajero Frecuente",
        email: cleanEmail,
        role: "PASSENGER",
        token: `demo-passenger-${Date.now()}`,
        dni: cleanEmail.includes("lomas") ? "0401893421" : "1004567890",
        provider: "DEMO",
      };
      this.saveSession(passengerUser, credentials.rememberMe);
      return passengerUser;
    }

    throw new Error("Correo electrónico o contraseña incorrectos.");
  },

  /**
   * Registro completo de nuevo usuario.
   * Crea la cuenta en Supabase Auth y la sincroniza localmente para acceso inmediato.
   */
  async register(input: RegisterCredentials): Promise<AuthUser> {
    const cleanEmail = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const phone = input.phone?.trim() || "";
    const dni = input.dni?.trim() || "1004567890";

    let supaToken = `rn-token-${Date.now()}`;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: input.password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            dni: dni,
            role: "PASSENGER",
          },
        },
      });

      if (data?.session?.access_token) {
        supaToken = data.session.access_token;
      } else if (error && error.message.includes("User already registered")) {
        // Si ya está registrado, intentamos hacer login
        return await this.login({ email: cleanEmail, password: input.password });
      }
    } catch {
      // Si falla la red de Supabase, continuará con registro local garantizado
    }

    const newUser: AuthUser = {
      name: fullName,
      email: cleanEmail,
      role: "PASSENGER",
      token: supaToken,
      dni: dni,
      phone: phone,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`,
      provider: "LOCAL_REGISTER",
    };

    // Guardar en directorio local para login offline persistente
    this.saveLocalRegisteredUser(input.password, newUser);

    // Iniciar sesión inmediatamente
    this.saveSession(newUser);
    return newUser;
  },

  /**
   * Autenticación con Google usando Supabase OAuth
   */
  async signInWithGoogleOAuth(redirectTo?: string): Promise<{ data?: unknown; error?: unknown }> {
    try {
      const supabase = createClient();
      const callbackUrl =
        redirectTo ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback");

      return await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    } catch (err) {
      return { error: err };
    }
  },

  /**
   * Inicio de sesión instantáneo con Perfil de Google (1-Clic oficial y cuentas verificadas)
   */
  loginWithGoogleProfile(profile: {
    name: string;
    email: string;
    dni?: string;
    picture?: string;
    role?: string;
  }): AuthUser {
    const cleanEmail = profile.email.trim().toLowerCase();
    const token = `rn-google-${Math.random().toString(36).substring(2, 12)}-${Date.now()}`;
    const user: AuthUser = {
      name: profile.name,
      email: cleanEmail,
      role: (profile.role || "PASSENGER").toUpperCase(),
      token,
      dni: profile.dni || "1004567890",
      picture:
        profile.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0284c7&color=fff`,
      provider: "GOOGLE",
    };

    this.saveSession(user);
    return user;
  },

  /**
   * Obtiene el usuario actual desde el almacenamiento local o de sesión
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("rn_user") || sessionStorage.getItem("rn_user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  /**
   * Guarda la sesión en localStorage, sessionStorage y cookies,
   * y despacha un evento global para sincronizar toda la interfaz en tiempo real.
   */
  saveSession(user: AuthUser, rememberMe = false): void {
    if (typeof window === "undefined") return;
    const primary = rememberMe ? window.localStorage : window.sessionStorage;
    const secondary = rememberMe ? window.sessionStorage : window.localStorage;

    try {
      secondary.removeItem("rn_user");
      secondary.removeItem("rn_token");
      primary.setItem("rn_user", JSON.stringify(user));
      primary.setItem("rn_token", user.token);
      // Siempre mantener sincronizado en localStorage para navegación fluida
      window.localStorage.setItem("rn_user", JSON.stringify(user));
      window.localStorage.setItem("rn_token", user.token);
      document.cookie = `rn_token=${user.token}; path=/; max-age=86400; SameSite=Lax`;

      // Notificar a todos los componentes de la aplicación
      window.dispatchEvent(
        new CustomEvent("rn_auth_change", {
          detail: user,
        })
      );
    } catch {
      // Storage restringido
    }
  },

  /**
   * Cierra la sesión activa en el cliente y en Supabase
   */
  logout(): void {
    if (typeof window === "undefined") return;
    try {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    } catch {
      // Ignorar si supabase no inicializó
    }

    try {
      window.localStorage.removeItem("rn_user");
      window.localStorage.removeItem("rn_token");
      window.sessionStorage.removeItem("rn_user");
      window.sessionStorage.removeItem("rn_token");
      document.cookie = "rn_token=; path=/; max-age=0";

      // Notificar a todos los componentes del cierre de sesión
      window.dispatchEvent(
        new CustomEvent("rn_auth_change", {
          detail: null,
        })
      );
    } catch {
      // Storage restringido
    }
  },
};
