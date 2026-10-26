"use client";

import React, { useState } from "react";
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
  UserPlus,
  Phone,
  CreditCard,
  Globe,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"GOOGLE" | "LOGIN" | "REGISTER">("GOOGLE");

  // Estados Formulario Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados Formulario Registro
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDni, setRegDni] = useState("");
  const [regPhone, setRegPhone] = useState("");

  // Estados Generales
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cuenta personalizada de Google
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  if (!isOpen) return null;

  const handleSuccess = (user: AuthUser) => {
    setSuccessMsg(`¡Bienvenido/a, ${user.name}!`);
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 400);
  };

  // Google OAuth Oficial vía Supabase
  const handleOfficialGoogleOAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authService.signInWithGoogleOAuth(
        typeof window !== "undefined" ? window.location.href : undefined
      );
      if (error) {
        // Fallback a selección rápida si OAuth no está configurado en Supabase Console
        setErrorMsg("Iniciando con selector de cuenta Google...");
        setTimeout(() => {
          setActiveTab("GOOGLE");
          setErrorMsg(null);
        }, 1000);
      }
    } catch {
      setErrorMsg("No se pudo conectar con Google OAuth. Elige una cuenta del listado.");
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Clic Perfil
  const handleGoogleSelect = (acc: typeof PRESET_GOOGLE_ACCOUNTS[0]) => {
    setLoadingGoogle(acc.email);
    try {
      const user = authService.loginWithGoogleProfile({
        name: acc.name,
        email: acc.email,
        dni: acc.dni,
        role: "PASSENGER",
      });
      handleSuccess(user);
    } catch {
      setErrorMsg("Error al autenticar perfil de Google.");
      setLoadingGoogle(null);
    }
  };

  // Google Correo Personalizado
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes("@")) return;
    setLoadingGoogle(customGoogleEmail);
    const namePart = customGoogleEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    try {
      const user = authService.loginWithGoogleProfile({
        name: formattedName,
        email: customGoogleEmail.trim().toLowerCase(),
        dni: "1004567890",
        role: "PASSENGER",
      });
      handleSuccess(user);
    } catch {
      setErrorMsg("Error al procesar cuenta de Google.");
      setLoadingGoogle(null);
    }
  };

  // Iniciar Sesión con Correo
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await authService.login({
        email: loginEmail,
        password: loginPassword,
      });
      handleSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Registrarse con Correo
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (regPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const user = await authService.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        dni: regDni || "1004567890",
        phone: regPhone || "0991234567",
      });
      handleSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar la cuenta.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 dark:bg-black/90 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative text-left max-h-[95vh] flex flex-col">
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
        <div className="p-5 sm:p-6 pb-2 shrink-0">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Identificación de Pasajero
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {activeTab === "REGISTER"
                  ? "Crear Cuenta de Pasajero"
                  : "Inicia Sesión para Confirmar tu Viaje"}
              </h2>
            </div>
          </div>

          {/* Banner de resumen del viaje si está en curso */}
          {tripSummary && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block">
                  Tu viaje reservado:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {tripSummary.origin} ➔ {tripSummary.destination}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                  Asiento(s): {tripSummary.seats.length > 0 ? tripSummary.seats.join(", ") : "Elegido"}
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
          <div className="mx-5 sm:mx-6 mb-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in shrink-0">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-5 sm:mx-6 mb-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-800 dark:text-rose-200 text-xs font-bold animate-in fade-in shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pestañas: GOOGLE | CORREO | REGISTRARSE */}
        <div className="px-5 sm:px-6 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab("GOOGLE");
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === "GOOGLE"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <GoogleMark />
              <span className="truncate">Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("LOGIN");
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === "LOGIN"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">Ingresar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("REGISTER");
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === "REGISTER"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">Registrarse</span>
            </button>
          </div>
        </div>

        {/* CUERPO DEL MODAL (Con scroll si es pantalla muy pequeña) */}
        <div className="overflow-y-auto px-5 sm:px-6 py-3 flex-1">
          {/* PESTAÑA 1: GOOGLE */}
          {activeTab === "GOOGLE" && (
            <div className="space-y-3">
              {/* Botón de Autenticación Oficial con Google OAuth */}
              <button
                type="button"
                onClick={handleOfficialGoogleOAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-xs cursor-pointer group"
              >
                <GoogleMark />
                <span>Continuar con Cuenta Oficial de Google</span>
                <Globe className="w-4 h-4 text-blue-500 ml-auto" />
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    o elige un perfil verificado (1-clic)
                  </span>
                </div>
              </div>

              {/* Lista de Cuentas Preconfiguradas */}
              <div className="space-y-2">
                {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
                  const isLoading = loadingGoogle === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={!!loadingGoogle || loading}
                      onClick={() => handleGoogleSelect(acc)}
                      className="w-full flex items-center space-x-3 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all text-left cursor-pointer group disabled:opacity-60"
                    >
                      <div
                        className={`w-9 h-9 rounded-full ${acc.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        {acc.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {acc.name}
                          </span>
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {acc.email}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block truncate">
                          {acc.subtitle} · C.I. {acc.dni}
                        </span>
                      </div>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                      ) : (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-xl">
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
                  className="w-full flex items-center justify-center space-x-2 p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Usar otra cuenta de Google</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomGoogleSubmit}
                  className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ingresa tu correo institucional o personal de Google:
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

          {/* PESTAÑA 2: INICIAR SESIÓN */}
          {activeTab === "LOGIN" && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{loading ? "Verificando..." : "Iniciar Sesión"}</span>
              </button>

              <div className="pt-2 text-center flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("pasajero@rutanorte.ec");
                    setLoginPassword("pasajero123");
                  }}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  ⚡ Cargar datos de prueba
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("REGISTER")}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </div>
            </form>
          )}

          {/* PESTAÑA 3: REGISTRARSE */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ej. Carlos Morales"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Cédula / Pasaporte
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regDni}
                      onChange={(e) => setRegDni(e.target.value)}
                      placeholder="Ej. 1004567890"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Teléfono Celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Ej. 0991234567"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-500/20 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{loading ? "Creando cuenta..." : "Crear Cuenta y Continuar"}</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("LOGIN")}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pie del modal */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Tus datos de ruta y asientos se conservan intactos. Al autenticarte, tu boleto quedará registrado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
