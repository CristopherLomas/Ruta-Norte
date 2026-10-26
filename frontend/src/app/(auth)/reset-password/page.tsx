import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer Contraseña — Ruta Norte",
  description: "Defina una nueva contraseña para su cuenta de Ruta Norte.",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">
          Restablecer Contraseña
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ingrese y confirme su nueva contraseña de acceso
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
