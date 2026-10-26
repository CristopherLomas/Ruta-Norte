"use client";

import React, { useState } from "react";
import { isAxiosError } from "axios";
import {
  X,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  ShieldAlert,
  Sparkles,
  User,
  Check,
  Bus,
} from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { AuthUser } from "../entities/User";
import { authService } from "../services/authService";

export type { AuthUser };

interface TripSummary {
  origin: string;
  destination: string;
  seats: number[];
  price: number;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  tripSummary?: TripSummary | null;
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      width={20}
      height={20}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: "Cristopher Lomas",
    email: "cristopher.lomas@upec.edu.ec",
    dni: "0401893421",
    role: "PASSENGER",
    subtitle: "Estudiante UPEC · Carchi",
    avatarColor: "bg-blue-600",
    initials: "CL",
  },
  {
    name: "Viajero Pasajero",
    email: "pasajero.norte@gmail.com",
    dni: "1004567890",
    role: "PASSENGER",
    subtitle: "Pasajero Frecuente · Imbabura",
    avatarColor: "bg-emerald-600",
    initials: "VP",
  },
];

export function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  tripSummary,
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"GOOGLE" | "EMAIL">("GOOGLE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cuenta personalizada de Google
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  if (!isOpen) return null;

  const saveAndComplete = (user: AuthUser) => {
    authService.saveSession(user);
    setSuccessMsg(`¡Bienvenido, ${user.name}!`);
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 500);
  };

  const handleGoogleSelect = (acc: typeof PRESET_GOOGLE_ACCOUNTS[0]) => {
    setLoadingGoogle(acc.email);
    const user: AuthUser = {
      name: acc.name,
      email: acc.email,
      role: "PASSENGER",
      token: "rn-google-jwt-" + Math.random().toString(36).substring(2, 12),
      dni: acc.dni,
      provider: "GOOGLE",
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&background=0284c7&color=fff`,
    };
    saveAndComplete(user);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes("@")) return;
    setLoadingGoogle(customGoogleEmail);
    const namePart = customGoogleEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const user: AuthUser = {
      name: formattedName,
      email: customGoogleEmail.trim().toLowerCase(),
      role: "PASSENGER",
      token: "rn-google-jwt-" + Math.random().toString(36).substring(2, 12),
      dni: "1004567890",
      provider: "GOOGLE",
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0284c7&color=fff`,
    };
    saveAndComplete(user);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await axiosClient.post<{
        name?: string;
        email: string;
        role: string;
        token: string;
        dni?: string;
      }>("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;
      const user: AuthUser = {
        name: data.name || email.split("@")[0],
        email: data.email,
        role: data.role || "PASSENGER",
        token: data.token || "rn-token-" + Date.now(),
        dni: data.dni || "1004567890",
      };
      saveAndComplete(user);
    } catch (error: unknown) {
      // Credenciales de prueba
      if (email.trim() === "pasajero@rutanorte.ec" || email.trim() === "cristopher.lomas@upec.edu.ec") {
        const user: AuthUser = {
          name: "Cristopher Lomas",
          email: email.trim(),
          role: "PASSENGER",
          token: "demo-token-" + Date.now(),
          dni: "0401893421",
        };
        saveAndComplete(user);
        return;
      }

      const message = isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : null;
      setErrorMsg(message || "Credenciales incorrectas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative text-left">
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Ícono y Título */}
        <div className="p-5 sm:p-6 pb-3">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Identificación de Pasajero
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Inicia Sesión para Confirmar tu Viaje
              </h2>
            </div>
          </div>

          {/* Banner de resumen del viaje si está en curso */}
          {tripSummary && (
            <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block">
                  Tu viaje está en espera:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {tripSummary.origin} ➔ {tripSummary.destination}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                  Asiento(s): {tripSummary.seats.length > 0 ? tripSummary.seats.join(", ") : "Seleccionado"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ${tripSummary.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notificación de Éxito o Error */}
        {successMsg && (
          <div className="mx-5 sm:mx-6 mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-5 sm:mx-6 mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selector de Pestaña: Google o Correo */}
        <div className="px-5 sm:px-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("GOOGLE")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === "GOOGLE"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <GoogleMark />
              <span>Con Google (1-Clic)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("EMAIL")}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === "EMAIL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Correo y Clave</span>
            </button>
          </div>
        </div>

        {/* Contenido Pestaña GOOGLE */}
        {activeTab === "GOOGLE" && (
          <div className="p-5 sm:p-6 pt-4 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona tu perfil de Google para asociar tu boleto de inmediato:
            </p>

            <div className="space-y-2">
              {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
                const isLoading = loadingGoogle === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={!!loadingGoogle}
                    onClick={() => handleGoogleSelect(acc)}
                    className="w-full flex items-center space-x-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all text-left cursor-pointer group disabled:opacity-60"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${acc.avatarColor} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      {acc.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        {acc.email}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block truncate">
                        {acc.subtitle} · C.I. {acc.dni}
                      </span>
                    </div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-xl">
                        Elegir ➔
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Otra cuenta de Google */}
            {!showCustomGoogle ? (
              <button
                type="button"
                onClick={() => setShowCustomGoogle(true)}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Usar otra cuenta de Google</span>
              </button>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ingresa tu correo institucional o personal:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="tunombre@gmail.com o @upec.edu.ec"
                    required
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!customGoogleEmail.trim() || !!loadingGoogle}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Acceder
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Contenido Pestaña CORREO */}
        {activeTab === "EMAIL" && (
          <form onSubmit={handleEmailLogin} className="p-5 sm:p-6 pt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{loading ? "Verificando..." : "Iniciar Sesión y Continuar"}</span>
            </button>

            {/* Acceso Rápido Demo Pasajero */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  const demoUser: AuthUser = {
                    name: "Cristopher Lomas",
                    email: "cristopher.lomas@upec.edu.ec",
                    role: "PASSENGER",
                    token: "demo-token-" + Date.now(),
                    dni: "0401893421",
                  };
                  saveAndComplete(demoUser);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                ⚡ Ingreso rápido de prueba como Pasajero UPEC
              </button>
            </div>
          </form>
        )}

        {/* Pie del modal */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Tus datos de ruta y asientos se conservan intactos. Al iniciar sesión, tu boleto quedará registrado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
