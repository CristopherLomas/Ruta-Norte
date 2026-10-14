"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);

    const res = await forgotPasswordAction(email);
    if (!res.success) {
      setServerError(res.error);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="font-bold">Correo Enviado</AlertTitle>
          <AlertDescription className="mt-2 text-xs">
            Si el correo <span className="font-semibold">{email}</span> está registrado en la plataforma, recibirá un enlace para restablecer su contraseña en los próximos minutos.
          </AlertDescription>
        </Alert>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Correo Electrónico Registrado</Label>
        <Input
          id="email"
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando enlace...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Enviar Enlace de Recuperación
          </>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-2">
        <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline">
          <ArrowLeft className="h-3 w-3" /> Regresar al Login
        </Link>
      </div>
    </form>
  );
}
