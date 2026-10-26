"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  User,
} from "lucide-react";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { authService } from "@/features/auth/services/authService";
import { AuthUser } from "@/features/auth/entities/User";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirigir si ya tiene sesión activa
  useEffect(() => {
    const existing = authService.getCurrentUser();
    if (existing) {
      navigateByRole(existing);
    }
  }, []);

  const navigateByRole = (user: AuthUser) => {
    if (redirectParam) {
      router.push(redirectParam);
      return;
    }
    const roleUpper = (user.role || "").toUpperCase();
    if (roleUpper === "ADMIN") {
      router.push("/admin");
    } else if (roleUpper === "STAFF") {
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
      const user = await authService.login({
        email,
        password,
        rememberMe,
      });
      navigateByRole(user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Credenciales inválidas o servidor no disponible.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: "STAFF" | "ADMIN" | "PASSENGER") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (demoRole === "ADMIN") {
        const user = await authService.login({
          email: "admin@rutanorte.ec",
          password: "admin",
          rememberMe: true,
        });
        navigateByRole(user);
      } else if (demoRole === "STAFF") {
        const user = await authService.login({
          email: "staff@rutanorte.ec",
          password: "staff",
          rememberMe: true,
        });
        navigateByRole(user);
      } else {
        const user = await authService.login({
          email: "cristopher.lomas@upec.edu.ec",
          password: "password",
          rememberMe: true,
        });
        navigateByRole(user);
      }
    } catch {
      setErrorMsg("Error al ingresar con la cuenta de prueba.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-900 dark:text-slate-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Iniciar Sesión
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Ingresa a tu cuenta para gestionar tus viajes y boletos
        </p>
      </div>

      {/* Botón Funcional de Google con Soporte OAuth y 1-Clic */}
      <GoogleSignInButton
        redirectTo={redirectParam || undefined}
        onSuccess={() => {
          const user = authService.getCurrentUser();
          if (user) navigateByRole(user);
        }}
      />

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
          className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-in fade-in"
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
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
          <span>{loading ? "Iniciando sesión..." : "Acceder al Sistema"}</span>
        </button>
      </form>

      {/* Botones de Acceso Rápido para Pruebas del Jurado / Evaluadores */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-2">
          Acceso Rápido de Evaluación
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemoLogin("PASSENGER")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
          >
            <User className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
            <span>Pasajero</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemoLogin("STAFF")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 mb-0.5" />
            <span>Taquilla/Chofer</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemoLogin("ADMIN")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer text-center"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mb-0.5" />
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
          <span>Volver al Kiosco Principal</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          <span>Cargando portal de acceso...</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
