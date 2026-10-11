"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResetPasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (password !== confirmPassword) {
      setServerError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setServerError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    const res = await resetPasswordAction(password);
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
          <AlertTitle className="font-bold">Contraseña Actualizada</AlertTitle>
          <AlertDescription className="mt-2 text-xs">
            Su contraseña ha sido modificada con éxito. Ya puede iniciar sesión con sus nuevas credenciales.
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Link href="/login">Iniciar Sesión</Link>
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
        <Label htmlFor="password">Nueva Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repita la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            Actualizando contraseña...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" />
            Guardar Nueva Contraseña
          </>
        )}
      </Button>
    </form>
  );
}
