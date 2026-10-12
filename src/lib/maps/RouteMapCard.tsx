"use client";

import * as React from "react";
import {
  MapPin,
  Clock,
  Navigation,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InteractiveMap } from "./InteractiveMap";
import { DrivingCalculationResult, RouteStopWaypoint } from "./types";
import { getDrivingRouteAction } from "./actions";

interface RouteMapCardProps {
  origin: {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
  };
  destination: {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
  };
  intermediateStops?: Array<{
    id: string;
    name: string;
    sequenceOrder: number;
    latitude: number | null;
    longitude: number | null;
  }>;
  scheduledDurationMin?: number | null;
  departureTime?: string | null;
  height?: string;
  showStopsList?: boolean;
}

export function RouteMapCard({
  origin,
  destination,
  intermediateStops = [],
  scheduledDurationMin,
  departureTime,
  height = "420px",
  showStopsList = true,
}: RouteMapCardProps) {
  const [calculation, setCalculation] = React.useState<DrivingCalculationResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Comprobar coordenadas de origen y destino
  const hasOriginCoords = typeof origin.latitude === "number" && typeof origin.longitude === "number";
  const hasDestCoords = typeof destination.latitude === "number" && typeof destination.longitude === "number";

  React.useEffect(() => {
    async function loadRoute() {
      if (!hasOriginCoords || !hasDestCoords) {
        setIsLoading(false);
        setErrorMsg("Las paradas seleccionadas requieren configuración de coordenadas geográficas.");
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);

      try {
        const res = await getDrivingRouteAction({
          origin: {
            id: origin.id,
            name: origin.name,
            latitude: origin.latitude!,
            longitude: origin.longitude!,
          },
          destination: {
            id: destination.id,
            name: destination.name,
            latitude: destination.latitude!,
            longitude: destination.longitude!,
          },
          intermediateStops: intermediateStops
            .filter((s) => typeof s.latitude === "number" && typeof s.longitude === "number")
            .map((s) => ({
              id: s.id,
              name: s.name,
              sequenceOrder: s.sequenceOrder,
              latitude: s.latitude!,
              longitude: s.longitude!,
            })),
        });

        if (res.success && res.data) {
          setCalculation(res.data);
        } else {
          setErrorMsg(res.error || "No se pudo calcular la ruta vial por carretera.");
        }
      } catch (err: unknown) {
        setErrorMsg("Error de red al consultar el trayecto cartográfico.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRoute();
  }, [origin.id, destination.id, origin.latitude, origin.longitude, destination.latitude, destination.longitude]);

  // Lista de waypoints para renderizar
  const fallbackWaypoints: RouteStopWaypoint[] = React.useMemo(() => {
    const list: RouteStopWaypoint[] = [];
    if (hasOriginCoords) {
      list.push({
        id: origin.id,
        name: origin.name,
        sequenceOrder: 0,
        latitude: origin.latitude!,
        longitude: origin.longitude!,
        isOrigin: true,
      });
    }
    intermediateStops
      .filter((s) => typeof s.latitude === "number" && typeof s.longitude === "number")
      .forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          sequenceOrder: s.sequenceOrder,
          latitude: s.latitude!,
          longitude: s.longitude!,
        });
      });
    if (hasDestCoords) {
      list.push({
        id: destination.id,
        name: destination.name,
        sequenceOrder: 9999,
        latitude: destination.latitude!,
        longitude: destination.longitude!,
        isDestination: true,
      });
    }
    return list;
  }, [origin, destination, intermediateStops, hasOriginCoords, hasDestCoords]);

  const waypoints = calculation?.waypoints && calculation.waypoints.length > 0 ? calculation.waypoints : fallbackWaypoints;

  return (
    <Card className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-brand-primary text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-brand-secondary shrink-0" />
            <div>
              <CardTitle className="text-base font-bold text-white leading-snug">
                Recorrido Vial Interparroquial
              </CardTitle>
              <p className="text-xs text-brand-light/80">
                {origin.name} → {destination.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs font-normal">
              Red Vial Nacional / E35 Carchi
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Panel comparativo de métricas (distancia, duración carretera vs programada) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Distancia vial */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Distancia por carretera
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {calculation?.success ? `${calculation.distanceKm} km` : isLoading ? "Calculando..." : "N/D"}
              </span>
            </div>
          </div>

          {/* Duración vial estimada */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary/15 text-brand-secondary flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Tiempo de viaje en carretera
              </span>
              <span className="text-lg font-extrabold text-brand-primary">
                {calculation?.success
                  ? calculation.durationFormatted
                  : isLoading
                  ? "Calculando..."
                  : "N/D"}
              </span>
              {calculation?.trafficConsidered && (
                <span className="text-[10px] text-emerald-600 block">Considera tráfico real</span>
              )}
            </div>
          </div>

          {/* Duración programada del bus */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Horario programado en turno
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {scheduledDurationMin ? `${scheduledDurationMin} min` : "Salida regular"}
              </span>
              {departureTime && (
                <span className="text-[10px] text-muted-foreground block">
                  Salida: {departureTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alerta de error si aplica */}
        {errorMsg && (
          <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Mapa interactivo */}
        <div className="relative">
          <InteractiveMap
            waypoints={waypoints}
            geometry={calculation?.geometry}
            height={height}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 rounded-2xl z-10 text-xs font-semibold text-brand-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculando trazado vial en tiempo real...
            </div>
          )}
        </div>

        {/* Leyenda y Atribución */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#20A878] inline-block border border-[#16825c]" />
              Origen (A)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#173B57] inline-block border border-[#0f2638]" />
              Destino (B)
            </span>
            {waypoints.length > 2 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block border border-[#d97706]" />
                Paradas Intermedias
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <Info className="h-3 w-3" />
            <span>Datos viales: OpenStreetMap / OSRM · Altitud y trazado oficial</span>
          </div>
        </div>

        {/* Lista de paradas en secuencia si showStopsList es true */}
        {showStopsList && waypoints.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Secuencia e Itinerario de Paradas ({waypoints.length})
            </h4>
            <div className="space-y-1.5">
              {waypoints.map((wp, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === waypoints.length - 1;
                return (
                  <div
                    key={wp.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          isFirst
                            ? "bg-[#20A878]"
                            : isLast
                            ? "bg-[#173B57]"
                            : "bg-[#F59E0B]"
                        }`}
                      >
                        {isFirst ? "A" : isLast ? "B" : idx}
                      </div>
                      <span className="font-medium text-slate-800">{wp.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {isFirst ? "Embarque Principal" : isLast ? "Destino Final" : `Escala #${wp.sequenceOrder}`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
