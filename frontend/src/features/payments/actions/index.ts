"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { processPaymentSchema, ProcessPaymentInput } from "@/lib/validations";
import { ActionResult } from "@/types";

export interface PaymentSuccessData {
  bookingId: string;
  ticketsIssued: number;
}

/**
 * Server Action: Procesa el pago simulado y confirma la reserva (ADR-005).
 * Invoca la función RPC de base de datos confirm_booking_on_payment():
 * 1. Comprueba que expires_at > now().
 * 2. Transiciona la reserva a 'confirmed' y los asientos a 'sold'.
 * 3. Registra el pago en public.payments con referencia simulada.
 * 4. Emite boletos inmutables con token opaco RN-XXXXXXXXXXXXXXXX.
 */
export async function processPaymentAction(
  input: ProcessPaymentInput
): Promise<ActionResult<PaymentSuccessData>> {
  const parsed = processPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de pago inválidos",
    };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Debes iniciar sesión para confirmar el pago del boleto.",
      };
    }

    const supabase = await createClient();
    const { bookingId, paymentMethod, cardLastFour } = parsed.data;

    // Referencia de pago simulada académica (ADR-005)
    const simulatedReference = `SIM-PAY-${Date.now().toString(36).toUpperCase()}${
      cardLastFour ? `-CARD-${cardLastFour}` : ""
    }`;

    // Invocar la función RPC confirm_booking_on_payment
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "confirm_booking_on_payment",
      {
        p_booking_id: bookingId,
        p_payment_method: paymentMethod,
        p_simulated_reference: simulatedReference,
      }
    );

    if (rpcError) {
      let friendlyError = rpcError.message;
      if (rpcError.message.includes("RESERVA_EXPIRADA")) {
        friendlyError = "La reserva ha expirado. El tiempo límite de 10 minutos ha finalizado y los asientos han sido liberados.";
      } else if (rpcError.message.includes("RESERVA_NO_ENCONTRADA")) {
        friendlyError = "La reserva indicada no existe en el sistema.";
      } else if (rpcError.message.includes("ESTADO_RESERVA_INVALIDO")) {
        friendlyError = "La reserva ya ha sido procesada previamente o ha sido cancelada.";
      }

      return {
        success: false,
        error: friendlyError,
      };
    }

    const typedResult = rpcResult as { success?: boolean; booking_id?: string; tickets_issued?: number };

    return {
      success: true,
      data: {
        bookingId,
        ticketsIssued: typedResult?.tickets_issued ?? 1,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al procesar el pago simulado";
    return { success: false, error: msg };
  }
}
