"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RegisterForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await registerAction(data);
      if (!res.success) {
        setServerError(res.error);
        setIsLoading(false);
        return;
      }

      setRegisteredEmail(res.data.email);
      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setServerError("Ocurrió un error inesperado al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="font-bold">¡Registro Exitoso!</AlertTitle>
          <AlertDescription className="mt-2 text-xs">
            Se ha creado la cuenta para <span className="font-semibold">{registeredEmail}</span>. Si se requiere confirmación por correo, por favor revise su bandeja de entrada. Ya puede iniciar sesión.
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Link href="/login">Ir a Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          placeholder="Juan Pérez"
          disabled={isLoading}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="juan.perez@correo.com"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Número Celular (Ecuador)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0991234567"
          disabled={isLoading}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground">Formato de 10 dígitos iniciando con 09</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando cuenta...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrarme como Pasajero
          </>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-2">
        ¿Ya tiene una cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-primary hover:underline">
          Iniciar Sesión
        </Link>
      </div>
    </form>
  );
}
