"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await loginAction(data, redirectParam);
      if (!res.success) {
        setServerError(res.error);
        setIsLoading(false);
        return;
      }

      router.push(res.data.redirectUrl);
      router.refresh();
    } catch {
      setServerError("Ocurrió un error inesperado al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-brand-primary hover:underline text-muted-foreground"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-2">
        ¿Aún no tiene cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-primary hover:underline">
          Registrarse como Pasajero
        </Link>
      </div>
    </form>
  );
}
