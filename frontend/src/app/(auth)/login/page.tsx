"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  LogIn,
  Mail,
  ShieldAlert,
  UserPlus,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

interface LoginResponse {
  email: string;
  role: string;
  token: string;
  [key: string]: unknown;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveSessionAndRedirect = (user: LoginResponse) => {
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

    try {
      otherStorage.removeItem("rn_user");
      otherStorage.removeItem("rn_token");
      storage.removeItem("rn_user");
      storage.removeItem("rn_token");
      storage.setItem("rn_user", JSON.stringify(user));
      storage.setItem("rn_token", user.token);
      document.cookie = `rn_token=${user.token}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      setErrorMsg(
        "No se pudo guardar la sesión en este navegador. Habilita el almacenamiento e inténtalo nuevamente."
      );
      return;
    }

    if (user.role === "ADMIN") {
      router.push("/admin");
    } else if (user.role === "STAFF") {
      router.push("/operaciones");
    } else {
      router.push("/pasajero");
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await axiosClient.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });
      saveSessionAndRedirect(response.data);
    } catch (error: unknown) {
      // Fallback para credenciales demo locales
      if (email.trim() === "admin@rutanorte.ec" && password === "admin123") {
        saveSessionAndRedirect({
          email: "admin@rutanorte.ec",
          role: "ADMIN",
          token: "demo-admin-token",
        });
        return;
      }
      if (email.trim() === "staff@rutanorte.ec" && password === "staff123") {
        saveSessionAndRedirect({
          email: "staff@rutanorte.ec",
          role: "STAFF",
          token: "demo-staff-token",
        });
        return;
      }
      if (email.trim() === "pasajero@rutanorte.ec" && password === "pasajero123") {
        saveSessionAndRedirect({
          email: "pasajero@rutanorte.ec",
          role: "PASSENGER",
          token: "demo-passenger-token",
        });
        return;
      }

      const message = isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : null;
      setErrorMsg(message || "Credenciales inválidas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: "STAFF" | "ADMIN") => {
    if (demoRole === "ADMIN") {
      saveSessionAndRedirect({
        email: "admin@rutanorte.ec",
        role: "ADMIN",
        token: "demo-admin-token-123",
      });
    } else {
      saveSessionAndRedirect({
        email: "staff@rutanorte.ec",
        role: "STAFF",
        token: "demo-staff-token-123",
      });
    }
  };

  return (
    <div className="w-full text-slate-900 dark:text-slate-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Iniciar Sesión
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Ingresa a tu cuenta para gestionar tus viajes
        </p>
      </div>

      {/* Botón Funcional de Google */}
      <GoogleSignInButton />

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            o con tu correo
          </span>
        </div>
      </div>

      {errorMsg && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200"
          role="alert"
        >
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ejemplo@correo.com"
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Contraseña
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-12 text-sm text-slate-900 dark:text-white shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              Recordarme
            </label>
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{loading ? "Iniciando..." : "Acceder al Sistema"}</span>
        </button>
      </form>

      {/* Botones de Acceso Rápido para Pruebas de Personal */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-2">
          Acceso Rápido a Paneles Internos
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("STAFF")}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Chofer / Taquilla</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("ADMIN")}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Administrador</span>
          </button>
        </div>
      </div>

      {/* Botón de Registro */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          ¿Aún no tienes una cuenta en Ruta Norte?
        </p>
        <Link
          href="/register"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 px-4 shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Regístrate aquí</span>
        </Link>
      </div>

      {/* Volver al Kiosco */}
      <div className="mt-3 text-center">
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium py-2.5 px-4 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span>Volver al Kiosco de Pasajeros</span>
        </Link>
      </div>
    </div>
  );
}
