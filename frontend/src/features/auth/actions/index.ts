"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations";
import { ActionResult } from "@/types";
import { getSafeRedirectUrl } from "@/lib/auth/redirects";
import { getCurrentRole } from "@/lib/auth/session";

/**
 * Server Action: Iniciar sesión con email y contraseña.
 */
export async function loginAction(
  data: LoginInput,
  requestedRedirect?: string | null
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de ingreso inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, error: "Correo electrónico o contraseña incorrectos." };
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Por favor confirme su correo electrónico antes de ingresar." };
      }
      return { success: false, error: error.message };
    }

    // Obtener rol verificado del usuario desde BD
    const role = (await getCurrentRole()) || "passenger";
    const safeRedirect = getSafeRedirectUrl(requestedRedirect, role);

    return {
      success: true,
      data: { redirectUrl: safeRedirect },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al iniciar sesión";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Registro de pasajero con validación y asignación protegida de rol.
 */
export async function registerAction(
  data: RegisterInput
): Promise<ActionResult<{ email: string; requiresEmailConfirmation: boolean }>> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de registro inválidos",
    };
  }

  try {
    const supabase = await createClient();

    // Solo se envían metadatos no privilegiados: full_name y phone.
    // NUNCA se permite asignar rol desde el payload del cliente.
    const { data: authData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone || null,
        },
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        return { success: false, error: "Ya existe una cuenta registrada con este correo electrónico." };
      }
      return { success: false, error: error.message };
    }

    const requiresEmailConfirmation = !authData.session;

    return {
      success: true,
      data: {
        email: parsed.data.email,
        requiresEmailConfirmation,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado durante el registro";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Cierre de sesión seguro.
 */
export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cerrar sesión";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Solicitar enlace de recuperación de contraseña.
 */
export async function forgotPasswordAction(email: string): Promise<ActionResult<void>> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Ingrese un correo electrónico válido." };
  }

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al solicitar recuperación de contraseña";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Restablecer contraseña con el token de recuperación.
 */
export async function resetPasswordAction(newPassword: string): Promise<ActionResult<void>> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar la contraseña";
    return { success: false, error: message };
  }
}
