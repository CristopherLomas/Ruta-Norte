"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, Building2, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReservationTimer } from "@/components/shared/ReservationTimer";
import { processPaymentAction } from "@/features/payments/actions";

interface CheckoutClientProps {
  booking: {
    id: string;
    trip_id: string;
    passenger_id: string;
    status: string;
    expires_at: string;
    total_amount: number;
    is_expired: boolean;
    trip: {
      route: {
        name: string;
        origin_stop?: { name: string };
        destination_stop?: { name: string };
      };
      bus?: {
        plate: string;
        unit_number: string | null;
        cooperative?: { name: string };
      };
      departure_time: string;
    };
    seats: {
      seat_number: string;
      seat_row: number;
      seat_column: number;
    }[];
  };
  currentUserRole?: string | null;
}

export function CheckoutClient({ booking, currentUserRole }: CheckoutClientProps) {
  const router = useRouter();

  // Estados del formulario de checkout
  const [paymentMethod, setPaymentMethod] = React.useState<"simulated_card" | "simulated_cash" | "simulated_transfer">(
    "simulated_card"
  );
  const [cardNumber, setCardNumber] = React.useState("4532 8901 2345 6789");
  const [cardHolder, setCardHolder] = React.useState("JUAN PEREZ (SIMULADO)");
  const [expiryDate, setExpiryDate] = React.useState("12/28");
  const [cvv, setCvv] = React.useState("123");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isExpiredState, setIsExpiredState] = React.useState(booking.is_expired);

  const handleExpire = () => {
    setIsExpiredState(true);
    setErrorMsg("El tiempo límite de 10 minutos para pagar ha finalizado. La reserva ha sido cancelada.");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isExpiredState) {
      setErrorMsg("No es posible pagar una reserva expirada. Debes seleccionar nuevos asientos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Extraer últimos 4 dígitos simulados si es tarjeta
      const cardDigitsOnly = cardNumber.replace(/\D/g, "");
      const cardLastFour = cardDigitsOnly.slice(-4) || "6789";

      const res = await processPaymentAction({
        bookingId: booking.id,
        paymentMethod,
        cardLastFour: paymentMethod === "simulated_card" ? cardLastFour : undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al procesar el pago");
        setIsSubmitting(false);
      } else {
        // Redirigir a la vista de boletos del pasajero
        router.push(`/passenger/boletos?booking=${booking.id}`);
      }
    } catch {
      setErrorMsg("Error de conexión al procesar la pasarela simulada.");
      setIsSubmitting(false);
    }
  };

  const isSellerOrAdmin = currentUserRole === "admin" || currentUserRole === "seller";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Temporizador de expiración regresivo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-primary">Pasarela de Pago Segura</h2>
        {!isExpiredState && (
          <ReservationTimer expiresAt={booking.expires_at} onExpire={handleExpire} />
        )}
      </div>

      {/* Alerta de expiración */}
      {isExpiredState && (
        <div className="p-4 bg-red-50 border-2 border-red-200 text-red-900 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Reserva Expirada</h4>
            <p className="text-xs">
              Los asientos reservados temporalmente han sido liberados para otros usuarios. Por favor, realiza una nueva búsqueda de viaje.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="mt-2 text-xs border-red-300 hover:bg-red-100"
            >
              Volver a buscar viajes
            </Button>
          </div>
        </div>
      )}

      {/* Resumen del Viaje y Asientos */}
      <Card className="bg-white border rounded-2xl shadow-xs overflow-hidden">
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Detalle de Compra</span>
            <h4 className="font-bold text-brand-primary text-base">
              {booking.trip.route?.name || "Ruta Seleccionada"}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Monto a Cancelar</span>
            <span className="text-2xl font-black text-brand-secondary">
              ${booking.total_amount.toFixed(2)} USD
            </span>
          </div>
        </div>

        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Cooperativa</span>
              <span className="font-semibold">{booking.trip.bus?.cooperative?.name || "Asociada"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Unidad</span>
              <span className="font-semibold">{booking.trip.bus?.unit_number || "Bus"} ({booking.trip.bus?.plate})</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Salida</span>
              <span className="font-semibold">
                {new Date(booking.trip.departure_time).toLocaleTimeString("es-EC", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Asientos Reservados</span>
              <div className="flex gap-1 flex-wrap mt-0.5">
                {booking.seats.map((s) => (
                  <Badge key={s.seat_number} variant="secondary" className="text-[11px] font-mono">
                    {s.seat_number}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Checkout / Pasarela Simulada */}
      {!isExpiredState && (
        <Card className="bg-white border-2 border-brand-primary/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-secondary" />
              <h3 className="font-bold text-sm">Selecciona el Método de Pago Simulado (ADR-005)</h3>
            </div>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px]">
              Entorno Seguro Demo
            </Badge>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Opciones de Método de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("simulated_card")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === "simulated_card"
                      ? "border-brand-primary bg-brand-light ring-2 ring-brand-primary/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-brand-primary" />
                  <span className="font-bold text-xs text-brand-primary">Tarjeta Demo</span>
                  <span className="text-[10px] text-muted-foreground">Crédito / Débito de prueba</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("simulated_transfer")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === "simulated_transfer"
                      ? "border-brand-primary bg-brand-light ring-2 ring-brand-primary/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="h-5 w-5 text-brand-primary" />
                  <span className="font-bold text-xs text-brand-primary">Transferencia Demo</span>
                  <span className="text-[10px] text-muted-foreground">Comprobante simulado</span>
                </button>

                {isSellerOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("simulated_cash")}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === "simulated_cash"
                        ? "border-brand-primary bg-brand-light ring-2 ring-brand-primary/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Banknote className="h-5 w-5 text-brand-secondary" />
                    <span className="font-bold text-xs text-brand-primary">Efectivo Ventanilla</span>
                    <span className="text-[10px] text-muted-foreground">Cobro en boletería</span>
                  </button>
                )}
              </div>

              {/* Campos condicionales para Tarjeta Simulada */}
              {paymentMethod === "simulated_card" && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Número de Tarjeta Simulado</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Titular Simulado</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Expiración (MM/AA)</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje de seguridad ADR-005 */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Aviso de Seguridad:</strong> Este entorno opera con pagos simulados con fines de gestión y docencia académica. No se procesan ni almacenan números reales de tarjetas bancarias.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón Pagar */}
              <Button
                type="submit"
                disabled={isSubmitting || isExpiredState}
                className="w-full h-12 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold text-base rounded-xl shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando pago y emitiendo boletos...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Confirmar Pago (${booking.total_amount.toFixed(2)} USD)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
