"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, User, Ticket, Settings, ArrowRight } from "lucide-react";

export function NavbarVisual() {
  const pathname = usePathname();

  const isPassenger = pathname === "/pasajero" || pathname === "/";
  const isStaff = pathname === "/operaciones";
  const isAdmin = pathname === "/admin";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Título */}
          <Link href="/pasajero" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  RUTA NORTE
                </span>
                <span className="bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2.0 Visual
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 block">
                Carchi & Imbabura · Kiosco de Transporte
              </span>
            </div>
          </Link>

          {/* Selector Rápido de Rol (Modo Demo en 1 Clic) */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <Link
              href="/pasajero"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                isPassenger
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <User className="w-5 h-5" />
              <span>🧍 Pasajero</span>
            </Link>

            <Link
              href="/operaciones"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                isStaff
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-102"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span>🎫 Taquilla / Chofer</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                isAdmin
                  ? "bg-purple-700 text-white shadow-md shadow-purple-500/30 scale-102"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>⚙️ Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavbarVisual;
