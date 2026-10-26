import type { Metadata } from "next";
import React, { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Registro de Pasajero — Ruta Norte",
  description: "Cree una cuenta para reservar y adquirir boletos en Ruta Norte.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Crear Cuenta de Pasajero
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete el formulario para comprar y gestionar sus boletos
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Cargando formulario de registro...</span>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
