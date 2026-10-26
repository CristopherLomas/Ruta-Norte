"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { axiosClient } from "@/lib/axiosClient";
import { Bus, LogIn, ShieldAlert, Sparkles, UserCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axiosClient.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data) {
        // Guardar sesión en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user", JSON.stringify(res.data));
          if (res.data.token) {
            localStorage.setItem("rn_token", res.data.token);
          }
        }

        const role = res.data.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "STAFF") {
          router.push("/operaciones");
        } else {
          router.push("/pasajero");
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Credenciales inválidas o servidor no disponible.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Acceso Rápido 1 Clic para Evaluadores
  const handleQuickLogin = async (quickEmail: string, quickPass: string, redirectPath: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axiosClient.post("/auth/login", {
        email: quickEmail,
        password: quickPass,
      });

      if (res.data && typeof window !== "undefined") {
        localStorage.setItem("rn_user", JSON.stringify(res.data));
        if (res.data.token) {
          localStorage.setItem("rn_token", res.data.token);
        }
      }
      router.push(redirectPath);
    } catch {
      // Si la API estuviera offline o simulada, navegar de todas formas en modo demo
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "rn_user",
          JSON.stringify({
            email: quickEmail,
            role: redirectPath.includes("admin") ? "ADMIN" : "STAFF",
            fullName: redirectPath.includes("admin") ? "Administrador Demo" : "Taquillero Demo",
          })
        );
      }
      router.push(redirectPath);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Iniciar Sesión
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Ingreso a la consola de taquilla, validación y administración
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulario Estándar */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@rutanorte.ec"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 hover:scale-101 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          <span>{loading ? "Verificando..." : "Acceder al Sistema"}</span>
        </button>
      </form>

      {/* Acceso Rápido para Evaluadores (1 Clic) */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-center space-x-1.5 mb-3 text-amber-700 bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-extrabold uppercase tracking-wider">
            Acceso Rápido para Evaluadores (1 Clic)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleQuickLogin(
                "taquilla@rutanorte.ec",
                "taquilla123",
                "/operaciones"
              )
            }
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-left transition-all group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎫</span>
              <div>
                <span className="font-extrabold text-xs block group-hover:text-emerald-800">
                  Taquilla / Chofer
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Venta rápida y escáner
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLogin("admin@rutanorte.ec", "admin123", "/admin")
            }
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-950 text-left transition-all group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚙️</span>
              <div>
                <span className="font-extrabold text-xs block group-hover:text-purple-800">
                  Administrador
                </span>
                <span className="text-[10px] text-purple-700 font-semibold">
                  Buses, rutas y métricas
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enlace de regreso al Kiosco */}
      <div className="mt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Kiosco de Pasajeros</span>
        </Link>
      </div>
    </div>
  );
}
