"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, LogIn, LogOut, ShieldCheck, Ticket, UserCircle } from "lucide-react";

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

  return (
    <header className="shrink-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs z-50">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Izquierda: Logo y Subtítulo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                RUTA NORTE
              </span>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                2.0 VISUAL
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
              Carchi & Imbabura · Kiosco de Transporte
            </span>
          </div>
        </Link>

        {/* Derecha: Si es vista interna muestra Rol + Cerrar Sesión; si es Kiosco público muestra Iniciar Sesión */}
        {internalActive ? (
          <div className="flex items-center space-x-3">
            {currentRole && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{currentRole}</span>
              </div>
            )}
            <Link
              href="/"
              className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>🚪 Cerrar Sesión (Volver al Kiosco)</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:scale-102"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>🔑 Iniciar Sesión</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavbarVisual;
