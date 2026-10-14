"use client";

import * as React from "react";
import { Bus, Clock, Play, CheckCircle, Navigation, Users } from "lucide-react";
import { Trip, TripStatus } from "@/types";
import { updateTripDispatchStatusAction } from "@/features/trips/actions/dispatch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatEcuadorDate } from "@/lib/utils";

interface DispatchClientProps {
  initialTrips: Trip[];
}

export function DispatchClient({ initialTrips }: DispatchClientProps) {
  const [trips, setTrips] = React.useState<Trip[]>(initialTrips);

  const handleUpdateStatus = async (tripId: string, status: TripStatus) => {
    const res = await updateTripDispatchStatusAction(tripId, status);
    if (res.success) {
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status } : t))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
          Control de Despacho en Andén
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestión del ciclo de vida de salidas: apertura de andén, embarque de pasajeros y despacho a ruta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hay salidas registradas para el día de hoy.
          </div>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} className="border-border shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {trip.route?.code || "RN-XXX"}
                  </Badge>
                  <Badge
                    variant={
                      trip.status === "boarding"
                        ? "secondary"
                        : trip.status === "in_progress"
                        ? "default"
                        : trip.status === "completed"
                        ? "success"
                        : "outline"
                    }
                  >
                    {trip.status === "scheduled" && "Programado"}
                    {trip.status === "boarding" && "Embarque Abierto"}
                    {trip.status === "in_progress" && "En Ruta"}
                    {trip.status === "completed" && "Completado"}
                    {trip.status === "cancelled" && "Cancelado"}
                  </Badge>
                </div>
                <CardTitle className="text-base text-brand-primary mt-2">
                  {trip.route?.name || "Ruta Interparroquial"}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Salida: {formatEcuadorDate(trip.departure_time)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="bg-brand-light p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidad:</span>
                    <span className="font-semibold text-brand-primary">
                      {trip.bus?.unit_number || "Disco"} ({trip.bus?.plate})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conductor:</span>
                    <span className="font-medium text-foreground">
                      {trip.driver?.full_name || trip.driver?.profile?.full_name || "Chofer"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asientos Libres:</span>
                    <span className="font-bold text-brand-secondary">{trip.available_seats} plazas</span>
                  </div>
                </div>

                {/* Acciones de despacho según el estado actual */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {trip.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(trip.id, "boarding")}
                      className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white text-xs gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Abrir Embarque en Andén
                    </Button>
                  )}

                  {trip.status === "boarding" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(trip.id, "in_progress")}
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Despachar Unidad a Ruta
                    </Button>
                  )}

                  {trip.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(trip.id, "completed")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Marcar Llegada a Destino
                    </Button>
                  )}

                  {trip.status === "completed" && (
                    <div className="w-full text-center text-xs text-muted-foreground py-1 font-medium">
                      ✓ Salida completada con éxito
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
