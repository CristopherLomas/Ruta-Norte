"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, LogIn, LogOut, ShieldCheck, Moon, Sun } from "lucide-react";

interface NavbarVisualProps {
  isInternal?: boolean;
  roleTitle?: string;
}

export function NavbarVisual({ isInternal, roleTitle }: NavbarVisualProps) {
  const pathname = usePathname();

  const isStaffPage = pathname === "/operaciones";
  const isAdminPage = pathname === "/admin";
  const internalActive = isInternal || isStaffPage || isAdminPage;

  const currentRole =
    roleTitle ||
    (isAdminPage ? "⚙️ Administrador" : isStaffPage ? "🎫 Taquilla / Chofer" : "");

  // Control de Modo Oscuro
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rn_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("rn_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("rn_theme", "light");
    }
  };

  return (
    <header className="shrink-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs z-50 transition-colors duration-200">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Izquierda: Logo y Subtítulo */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                RUTA NORTE
              </span>
              <span className="bg-amber-400 text-amber-950 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                2.0
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 block leading-tight truncate">
              Carchi & Imbabura
            </span>
          </div>
        </Link>

        {/* Derecha: Botón de Modo Oscuro + Acciones de Sesión */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Botón de Modo Oscuro */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Alternar modo oscuro"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>

          {internalActive ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentRole && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{currentRole}</span>
                </div>
              )}
              <Link
                href="/"
                className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>🚪 Cerrar Sesión</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-extrabold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:scale-102"
            >
              <LogIn className="w-4 h-4 text-amber-400 dark:text-amber-300" />
              <span>🔑 Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavbarVisual;
