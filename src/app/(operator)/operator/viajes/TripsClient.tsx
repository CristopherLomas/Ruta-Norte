"use client";

import * as React from "react";
import { Plus, Calendar, Clock, Bus, User, Route as RouteIcon, Search, AlertCircle, Loader2 } from "lucide-react";
import { Trip, Route, Bus as BusType, Driver } from "@/types";
import { scheduleTripAction, cancelTripAction } from "@/features/trips/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatEcuadorDate } from "@/lib/utils";

interface TripsClientProps {
  initialTrips: Trip[];
  routes: Route[];
  buses: BusType[];
  drivers: Driver[];
}

export function TripsClient({ initialTrips, routes, buses, drivers }: TripsClientProps) {
  const [trips, setTrips] = React.useState<Trip[]>(initialTrips);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Formulario
  const [routeId, setRouteId] = React.useState(routes[0]?.id || "");
  const [busId, setBusId] = React.useState(buses[0]?.id || "");
  const [driverId, setDriverId] = React.useState(drivers[0]?.id || "");

  // Fechas por defecto (hoy a las 08:00 y 09:00 UTC)
  const defaultDeparture = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  const defaultArrival = new Date(Date.now() + 7200000).toISOString().slice(0, 16);
  const [departureTime, setDepartureTime] = React.useState(defaultDeparture);
  const [arrivalTime, setArrivalTime] = React.useState(defaultArrival);

  // Filtrar solo buses activos para el selector (respetando restricción de negocio)
  const activeBuses = buses.filter((b) => b.is_active && b.status !== "maintenance" && b.status !== "inactive");
  // Filtrar solo conductores disponibles
  const availableDrivers = drivers.filter((d) => d.is_available && d.status !== "inactive" && d.status !== "suspended");

  const filteredTrips = trips.filter(
    (t) =>
      (t.route?.name && t.route.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.bus?.plate && t.bus.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.bus?.unit_number && t.bus.unit_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await scheduleTripAction({
      routeId,
      busId,
      driverId,
      departureTime: new Date(departureTime).toISOString(),
      arrivalTime: new Date(arrivalTime).toISOString(),
      status: "scheduled",
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setTrips((prev) => [res.data, ...prev]);
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleCancelTrip = async (tripId: string) => {
    const reason = window.prompt("Ingrese el motivo de cancelación del viaje (mínimo 5 caracteres):");
    if (!reason) return;

    const res = await cancelTripAction(tripId, reason);
    if (res.success) {
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status: "cancelled" } : t))
      );
    } else {
      alert(`Error al cancelar: ${res.error}`);
    }
  };

  const getTripStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default" className="bg-brand-primary">Programado</Badge>;
      case "boarding":
        return <Badge variant="secondary" className="bg-brand-secondary text-white">En Embarque</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-blue-600 text-white">En Ruta</Badge>;
      case "completed":
        return <Badge variant="success">Finalizado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Programación y Calendario de Viajes
          </h1>
          <p className="text-sm text-muted-foreground">
            Planificación de salidas calendarizadas vinculando ruta, bus disponible y conductor autorizado.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Programar Nuevo Viaje"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">Programar Nueva Salida de Transporte</CardTitle>
            <CardDescription className="text-xs">
              El sistema bloquea automáticamente unidades en mantenimiento o conductores no disponibles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleTrip} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="trip-route">Ruta Interparroquial</Label>
                  <select
                    id="trip-route"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    required
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trip-bus">Unidad de Transporte (Solo Activas)</Label>
                  <select
                    id="trip-bus"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    required
                  >
                    {activeBuses.length === 0 ? (
                      <option value="">No hay unidades activas disponibles</option>
                    ) : (
                      activeBuses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.unit_number || "Disco S/N"} ({b.plate}) - {b.total_seats} asientos
                        </option>
                      ))
                    )}
                  </select>
                  {activeBuses.length === 0 && (
                    <p className="text-[11px] text-destructive">
                      Atención: Todas las unidades están en mantenimiento o inactivas.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trip-driver">Conductor Asignado</Label>
                  <select
                    id="trip-driver"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    required
                  >
                    {availableDrivers.length === 0 ? (
                      <option value="">No hay conductores disponibles</option>
                    ) : (
                      availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name || d.profile?.full_name || "Chofer"} ({d.license_category})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trip-departure">Fecha y Hora de Salida (Ecuador)</Label>
                  <Input
                    id="trip-departure"
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trip-arrival">Fecha y Hora Estimada de Llegada</Label>
                  <Input
                    id="trip-arrival"
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || activeBuses.length === 0} className="bg-brand-primary text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Programar Salida y Habilitar Asientos
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Barra de búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar viaje por ruta o unidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla de Viajes Programados */}
      <div className="rounded-xl border bg-brand-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-light text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Ruta</th>
                <th className="px-6 py-3">Salida / Llegada (America/Guayaquil)</th>
                <th className="px-6 py-3">Unidad / Disco</th>
                <th className="px-6 py-3">Conductor</th>
                <th className="px-6 py-3 text-center">Disponibilidad</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No hay viajes programados registrados.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-primary">
                      <div className="flex items-center gap-1.5">
                        <RouteIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.route?.name || "Ruta Interparroquial"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{trip.route?.code}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-primary" />
                        {formatEcuadorDate(trip.departure_time)}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        Llegada: {formatEcuadorDate(trip.arrival_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-brand-primary flex items-center gap-1">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                        {trip.bus?.unit_number || "Unidad"} ({trip.bus?.plate})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {trip.driver?.full_name || trip.driver?.profile?.full_name || "Chofer Asignado"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-xs text-brand-secondary">
                      {trip.available_seats} libres
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getTripStatusBadge(trip.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trip.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelTrip(trip.id)}
                          className="text-xs h-8"
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
