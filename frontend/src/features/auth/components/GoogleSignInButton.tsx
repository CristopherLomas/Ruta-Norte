"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { Check, Loader2, Sparkles, User, X } from "lucide-react";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

interface GoogleAccountProfile {
  name: string;
  email: string;
  role: string;
  subtitle: string;
  avatarColor: string;
  initials: string;
}

const PRESET_ACCOUNTS: GoogleAccountProfile[] = [
  {
    name: "Cristopher Lomas",
    email: "cristopher.lomas@upec.edu.ec",
    role: "PASSENGER",
    subtitle: "Estudiante UPEC · Carchi",
    avatarColor: "bg-blue-600",
    initials: "CL",
  },
  {
    name: "Viajero Pasajero",
    email: "pasajero.norte@gmail.com",
    role: "PASSENGER",
    subtitle: "Pasajero Frecuente · Imbabura",
    avatarColor: "bg-emerald-600",
    initials: "VP",
  },
];

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

export function GoogleSignInButton() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const completeGoogleLogin = (email: string, name: string) => {
    setLoadingAccount(email);
    setSuccessMessage(`Conectado como ${name}`);

    const userObj = {
      email,
      name,
      role: "PASSENGER",
      token: "rn-google-jwt-" + Math.random().toString(36).substring(2, 12),
      provider: "GOOGLE",
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff`,
    };

    try {
      localStorage.setItem("rn_user", JSON.stringify(userObj));
      localStorage.setItem("rn_token", userObj.token);
      sessionStorage.setItem("rn_user", JSON.stringify(userObj));
      sessionStorage.setItem("rn_token", userObj.token);
      document.cookie = `rn_token=${userObj.token}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      // Si falla storage, continuar
    }

    setTimeout(() => {
      setModalOpen(false);
      router.push("/pasajero");
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) return;
    const namePart = customEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    completeGoogleLogin(customEmail.trim().toLowerCase(), formattedName);
  };

  const handleOAuthSuccess = (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const payloadBase64 = credentialResponse.credential.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        completeGoogleLogin(
          payload.email || "pasajero.google@gmail.com",
          payload.name || "Usuario Google"
        );
        return;
      }
    } catch {
      // Fallback
    }
    completeGoogleLogin("pasajero.google@gmail.com", "Usuario Google");
  };

  return (
    <>
      <div className="w-full">
        {googleClientId ? (
          <div className="flex flex-col items-center gap-2">
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleOAuthSuccess}
                onError={() => setModalOpen(true)}
                useOneTap
                text="continue_with"
                shape="pill"
                size="large"
                width="360"
              />
            </GoogleOAuthProvider>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              ¿Prefieres elegir tu cuenta manualmente?
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs hover:shadow-md cursor-pointer group"
          >
            <GoogleMark />
            <span>Continuar con Google</span>
            <span className="ml-auto text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              1-Clic
            </span>
          </button>
        )}
      </div>

      {/* MODAL DE SELECCIÓN DE CUENTA GOOGLE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative text-left">
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal de Google"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera Google */}
            <div className="flex items-center space-x-2.5 mb-2">
              <GoogleMark />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Google
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Elige una cuenta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              para continuar en <strong className="text-blue-600 dark:text-blue-400">Ruta Norte 2.0</strong>
            </p>

            {/* Notificación de Éxito */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Lista de Cuentas Google Rápidas */}
            <div className="space-y-2 mb-4">
              {PRESET_ACCOUNTS.map((acc) => {
                const isLoading = loadingAccount === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={!!loadingAccount}
                    onClick={() => completeGoogleLogin(acc.email, acc.name)}
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
                        {acc.subtitle}
                      </span>
                    </div>
                    {isLoading && (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Opción de Cuenta Personalizada */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center space-x-3 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <span>Usar otra cuenta de Google</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ingresa tu correo de Google:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com o @upec.edu.ec"
                    required
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!customEmail.trim() || !!loadingAccount}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Continuar
                  </button>
                </div>
              </form>
            )}

            {/* Pie del Modal */}
            <p className="mt-5 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
              Para continuar, Google compartirá tu nombre, dirección de correo electrónico e idioma preferido con Ruta Norte.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default GoogleSignInButton;
