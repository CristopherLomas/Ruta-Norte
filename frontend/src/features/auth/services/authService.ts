import { axiosClient } from "@/lib/axiosClient";
import { AuthUser, LoginCredentials } from "../entities/User";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await axiosClient.post<AuthUser>("/auth/login", {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    return res.data;
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("rn_user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  saveSession(user: AuthUser, rememberMe = false): void {
    if (typeof window === "undefined") return;
    const primary = rememberMe ? window.localStorage : window.sessionStorage;
    const secondary = rememberMe ? window.sessionStorage : window.localStorage;

    try {
      secondary.removeItem("rn_user");
      secondary.removeItem("rn_token");
      primary.setItem("rn_user", JSON.stringify(user));
      primary.setItem("rn_token", user.token);
      window.localStorage.setItem("rn_user", JSON.stringify(user));
      window.localStorage.setItem("rn_token", user.token);
      document.cookie = `rn_token=${user.token}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      // Storage restringido
    }
  },

  logout(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("rn_user");
    window.localStorage.removeItem("rn_token");
    window.sessionStorage.removeItem("rn_user");
    window.sessionStorage.removeItem("rn_token");
    document.cookie = "rn_token=; path=/; max-age=0";
  },
};
