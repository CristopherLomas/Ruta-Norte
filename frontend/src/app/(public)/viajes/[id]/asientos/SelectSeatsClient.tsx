"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bus, MapPin, Calendar, Clock, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SeatMapSelector, SeatWithStatus } from "@/components/shared/SeatMapSelector";
import { TripSearchResult } from "@/features/trips/actions/search";
import { createReservationAction } from "@/features/bookings/actions";
import { RouteMapCard } from "@/lib/maps";

interface SelectSeatsClientProps {
  trip: TripSearchResult;
}

export function SelectSeatsClient({ trip }: SelectSeatsClientProps) {
  const router = useRouter();

  // Estados de asientos
  const [selectedSeatIds, setSelectedSeatIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Layout del bus
  const layout = trip.bus?.layout_config || { rows: 10, columns: 4, column_labels: ["A", "B", "_", "C", "D"] };
  const rows = layout.rows || 10;
  const columns = layout.columns || 4;

  // Asientos del bus (se pueden consultar en tiempo real o cargar)
  const [seats, setSeats] = React.useState<SeatWithStatus[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = React.useState(true);

  React.useEffect(() => {
    async function loadSeats() {
      try {
        const { getTripSeatsAction } = await import("@/features/trips/actions/seats");
        const res = await getTripSeatsAction(trip.id);
        if (res.success && res.data) {
          setSeats(res.data);
        } else {
          setErrorMsg(res.error || "No se pudieron cargar los asientos");
        }
      } catch {
        setErrorMsg("Error de conexión al cargar el mapa de asientos");
      } finally {
        setIsLoadingSeats(false);
      }
    }
    loadSeats();
  }, [trip.id]);

  const handleSeatToggle = (seat: SeatWithStatus) => {
    setErrorMsg(null);
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 4) {
        setErrorMsg("Solo puedes seleccionar un máximo de 4 asientos por reserva.");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  const handleCreateReservation = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg("Debe seleccionar al menos un asiento.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createReservationAction({
        tripId: trip.id,
        originStopId: trip.route.origin_stop_id,
        destinationStopId: trip.route.destination_stop_id,
        seatIds: selectedSeatIds,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al crear la reserva");
        setIsSubmitting(false);
      } else if (res.data) {
        // Redirigir a checkout con el bookingId generado
        router.push(`/checkout/${res.data.bookingId}`);
      }
    } catch {
      setErrorMsg("Error de comunicación con el servidor al registrar la reserva.");
      setIsSubmitting(false);
    }
  };

  const departureHour = new Date(trip.departure_time).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const departureDate = new Date(trip.departure_time).toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Botón Volver */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-brand-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la búsqueda de viajes
      </Button>

      {/* Cabecera del viaje seleccionado */}
      <Card className="bg-white border-2 border-brand-primary/10 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-brand-primary text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bus className="h-6 w-6 text-brand-secondary" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-tight">
                {trip.route.origin_stop.name} → {trip.route.destination_stop.name}
              </h2>
              <p className="text-xs text-brand-light/80">
                {trip.bus?.cooperative?.name || "Cooperativa Asociada"} · {trip.bus?.unit_number || "Unidad"} · Placa {trip.bus?.plate}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-mono text-xs">
              Tarifa: ${trip.fare_price.toFixed(2)} USD / asiento
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-secondary" />
            <span><strong>Fecha:</strong> {departureDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-secondary" />
            <span><strong>Hora de Salida:</strong> {departureHour}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span><strong>Disponibles:</strong> {trip.available_seats} asientos</span>
          </div>
        </CardContent>
      </Card>

      {/* Mapa interactivo y cálculo vial de la ruta */}
      <RouteMapCard
        origin={{
          id: trip.route.origin_stop.id,
          name: trip.route.origin_stop.name,
          latitude: trip.route.origin_stop.latitude,
          longitude: trip.route.origin_stop.longitude,
        }}
        destination={{
          id: trip.route.destination_stop.id,
          name: trip.route.destination_stop.name,
          latitude: trip.route.destination_stop.latitude,
          longitude: trip.route.destination_stop.longitude,
        }}
        scheduledDurationMin={trip.route.duration_min}
        departureTime={departureHour}
        height="360px"
      />

      {/* Alerta de error si aplica */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selector interactivo de asientos */}
      {isLoadingSeats ? (
        <div className="p-12 text-center bg-white rounded-2xl border flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando disponibilidad de asientos en tiempo real...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SeatMapSelector
            rows={rows}
            columns={columns}
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            maxSeats={4}
            baseFare={trip.fare_price}
            onSeatToggle={handleSeatToggle}
          />

          {/* Botón de Confirmación y Bloqueo Temporal */}
          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              disabled={selectedSeatIds.length === 0 || isSubmitting}
              onClick={handleCreateReservation}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-8 rounded-xl shadow-md h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reservando asientos...
                </>
              ) : (
                `Confirmar y Continuar al Pago (${selectedSeatIds.length} asiento${selectedSeatIds.length === 1 ? "" : "s"})`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
