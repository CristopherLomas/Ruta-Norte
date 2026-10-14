import { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar Contraseña — Ruta Norte",
  description: "Solicite un enlace para restablecer su contraseña de acceso.",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">
          Recuperar Contraseña
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Le enviaremos un enlace seguro a su correo electrónico
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
