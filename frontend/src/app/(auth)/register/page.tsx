import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Registro de Pasajero — Ruta Norte",
  description: "Cree una cuenta para reservar y adquirir boletos en Ruta Norte.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">
          Crear Cuenta de Pasajero
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Complete el formulario para comprar y gestionar sus boletos
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
