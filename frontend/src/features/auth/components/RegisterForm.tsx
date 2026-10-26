"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  User,
  Mail,
  LockKeyhole,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { authService } from "../services/authService";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("next");

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [dni, setDni] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);

    if (password.length < 6) {
      setServerError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const user = await authService.register({
        fullName,
        email,
        password,
        dni: dni || "1004567890",
        phone: phone || "0991234567",
      });

      setIsSuccess(true);
      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push("/pasajero");
        }
      }, 800);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al registrar la cuenta. Intente nuevamente.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center animate-in fade-in">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
          <h3 className="text-base font-bold">¡Cuenta Creada Exitosamente!</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Iniciando sesión automáticamente para <strong className="text-emerald-600">{email}</strong>...
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Redirigiendo al panel de viajes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Opción Rápida con Google */}
      <div className="mb-4">
        <GoogleSignInButton
          redirectTo={redirectParam || "/pasajero"}
          onSuccess={() => {
            router.push(redirectParam || "/pasajero");
          }}
        />
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            o regístrate con tu correo
          </span>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-in fade-in">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre Completo */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan.perez@correo.com"
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Fila Cédula y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cédula / Identificación
            </label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="10 dígitos"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Teléfono Celular
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0991234567"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Contraseña */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Contraseña
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-500/20 mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>{isLoading ? "Creando cuenta..." : "Completar Registro y Entrar"}</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Inicia Sesión aquí
        </Link>
      </div>

      <div className="pt-1 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Kiosco</span>
        </Link>
      </div>
    </div>
  );
}
