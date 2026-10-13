import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión — Ruta Norte",
  description: "Acceso al sistema de gestión de transporte Ruta Norte.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">
          Bienvenido a Ruta Norte
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ingrese sus credenciales para acceder a la plataforma
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-xs text-muted-foreground">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
