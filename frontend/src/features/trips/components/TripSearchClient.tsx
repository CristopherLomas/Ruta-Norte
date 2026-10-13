"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, ArrowRight, Bus, Clock, ShieldCheck, AlertCircle, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stop } from "@/types";
import { searchTripsAction, TripSearchResult } from "@/features/trips/actions/search";
import { RouteMapCard } from "@/lib/maps";

interface TripSearchClientProps {
  stops: Stop[];
}

export function TripSearchClient({ stops }: TripSearchClientProps) {
  const router = useRouter();

  // Identificar parada por defecto (Tulcán como origen si existe)
  const defaultOrigin = stops.find((s) => s.name.toLowerCase().includes("tulcán")) || stops[0];
  const defaultDest = stops.find((s) => s.id !== defaultOrigin?.id) || stops[1];

  // Estados del formulario
  const [originStopId, setOriginStopId] = React.useState<string>(defaultOrigin?.id || "");
  const [destinationStopId, setDestinationStopId] = React.useState<string>(defaultDest?.id || "");
  const [departureDate, setDepartureDate] = React.useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [results, setResults] = React.useState<TripSearchResult[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [showRoadMap, setShowRoadMap] = React.useState(true);

  const selectedOriginStop = stops.find((s) => s.id === originStopId);
  const selectedDestinationStop = stops.find((s) => s.id === destinationStopId);

  // Manejar búsqueda
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originStopId || !destinationStopId) {
      setErrorMsg("Debe seleccionar origen y destino.");
      return;
    }

    if (originStopId === destinationStopId) {
      setErrorMsg("El origen y el destino no pueden ser iguales.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await searchTripsAction({
        originStopId,
        destinationStopId,
        departureDate,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al buscar viajes");
        setResults([]);
      } else {
        setResults(res.data || []);
      }
    } catch {
      setErrorMsg("Error de conexión al consultar viajes.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Formulario de Búsqueda de Viajes */}
      <Card className="max-w-4xl mx-auto shadow-lg border-2 border-brand-primary/10 rounded-2xl overflow-hidden">
        <div className="bg-brand-primary p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-secondary" />
            <h3 className="font-bold text-base">Buscar Horarios y Pasajes Disponibles</h3>
          </div>
          <span className="text-xs text-brand-light/80">Ruta Norte · Conectando parroquias</span>
        </div>

        <CardContent className="p-6 bg-white">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Origen */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                Origen
              </label>
              <select
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                value={originStopId}
                onChange={(e) => setOriginStopId(e.target.value)}
                required
              >
                <option value="" disabled>Seleccione origen</option>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name} {stop.locality?.canton ? `(${stop.locality.canton})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                Destino
              </label>
              <select
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                value={destinationStopId}
                onChange={(e) => setDestinationStopId(e.target.value)}
                required
              >
                <option value="" disabled>Seleccione destino</option>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name} {stop.locality?.canton ? `(${stop.locality.canton})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-secondary" />
                Fecha de Viaje
              </label>
              <input
                type="date"
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
              />
            </div>

            {/* Botón Buscar */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading ? "Buscando..." : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar Viajes
                  </>
                )}
              </Button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualización del Mapa Interactivo y Trazado de Carretera del Trayecto */}
      {selectedOriginStop && selectedDestinationStop && selectedOriginStop.id !== selectedDestinationStop.id && (
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapIcon className="h-4 w-4 text-brand-secondary" />
              Visualización Cartográfica del Trayecto Seleccionado
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRoadMap(!showRoadMap)}
              className="text-xs text-brand-primary h-7 gap-1"
            >
              {showRoadMap ? "Ocultar Mapa" : "Mostrar Mapa Interactivo"}
            </Button>
          </div>

          {showRoadMap && (
            <RouteMapCard
              origin={{
                id: selectedOriginStop.id,
                name: selectedOriginStop.name,
                latitude: selectedOriginStop.latitude,
                longitude: selectedOriginStop.longitude,
              }}
              destination={{
                id: selectedDestinationStop.id,
                name: selectedDestinationStop.name,
                latitude: selectedDestinationStop.latitude,
                longitude: selectedDestinationStop.longitude,
              }}
              height="380px"
              showStopsList={true}
            />
          )}
        </div>
      )}

      {/* 2. Resultados de la Búsqueda */}
      <div className="max-w-4xl mx-auto space-y-4">
        {hasSearched && (
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-bold text-lg text-brand-primary">
              Salidas Disponibles ({results.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Tarifas autorizadas ANT · Reserva de hasta 4 asientos
            </span>
          </div>
        )}

        {hasSearched && results.length === 0 && !isLoading && !errorMsg && (
          <Card className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl">
            <Bus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-bold text-slate-800">No se encontraron viajes programados</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              No hay salidas registradas para la ruta o fecha seleccionada. Intenta seleccionar otra fecha u otra combinación de paradas.
            </p>
          </Card>
        )}

        {results.map((trip) => {
          const departureHour = new Date(trip.departure_time).toLocaleTimeString("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const arrivalHour = new Date(trip.arrival_time).toLocaleTimeString("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const cooperativeName = trip.bus?.cooperative?.name || "Cooperativa Asociada";
          const unitNumber = trip.bus?.unit_number || "Unidad";

          return (
            <Card
              key={trip.id}
              className="bg-white border hover:border-brand-primary/50 transition-all shadow-xs hover:shadow-md rounded-2xl overflow-hidden"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Horario y Trayecto */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 font-mono text-xs">
                      {cooperativeName} · {unitNumber}
                    </Badge>
                    <Badge
                      variant={trip.status === "boarding" ? "secondary" : "default"}
                      className={trip.status === "boarding" ? "bg-amber-100 text-amber-800 text-[10px]" : "bg-emerald-100 text-emerald-800 text-[10px]"}
                    >
                      {trip.status === "boarding" ? "En Andén (Embarcando)" : "A tiempo"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="font-extrabold text-xl text-brand-primary font-mono block">
                        {departureHour}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{trip.route.origin_stop.name}</span>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {trip.route.duration_min ? `${trip.route.duration_min} min` : "Directo"}
                      </span>
                      <div className="w-16 h-0.5 bg-slate-300 relative my-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary absolute -top-0.5 right-0" />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="font-extrabold text-xl text-slate-800 font-mono block">
                        {arrivalHour}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{trip.route.destination_stop.name}</span>
                    </div>
                  </div>
                </div>

                {/* Asientos, Tarifa y Acción */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">Tarifa por pasajero</span>
                    <span className="text-2xl font-black text-brand-primary">
                      ${trip.fare_price.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">USD</span>
                    </span>
                    <span className="block text-[11px] text-emerald-700 font-medium">
                      {trip.available_seats} asientos disponibles
                    </span>
                  </div>

                  <Button
                    onClick={() => router.push(`/viajes/${trip.id}/asientos`)}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-5 gap-1.5 font-bold shadow-sm"
                  >
                    <span>Elegir Asientos</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
