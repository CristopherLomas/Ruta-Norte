"use client";

import * as React from "react";
import { Plus, Route as RouteIcon, Search, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Route, Stop } from "@/types";
import { createRouteAction, toggleRouteStatusAction } from "@/features/routes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { RouteMapCard, StopCoordinateEditor } from "@/lib/maps";

interface RoutesClientProps {
  initialRoutes: Route[];
  stops: Stop[];
}

export function RoutesClient({ initialRoutes, stops }: RoutesClientProps) {
  const [routes, setRoutes] = React.useState<Route[]>(initialRoutes);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Formulario
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [originStopId, setOriginStopId] = React.useState(stops[0]?.id || "");
  const [destinationStopId, setDestinationStopId] = React.useState(stops[1]?.id || "");
  const [currentStops, setCurrentStops] = React.useState<Stop[]>(stops);
  const [distanceKm, setDistanceKm] = React.useState(25.0);
  const [durationMin, setDurationMin] = React.useState(45);
  const [baseFare, setBaseFare] = React.useState(2.5);

  const selectedOriginStop = currentStops.find((s) => s.id === originStopId);
  const selectedDestStop = currentStops.find((s) => s.id === destinationStopId);

  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await createRouteAction({
      name,
      code,
      originStopId,
      destinationStopId,
      distanceKm: Number(distanceKm),
      durationMin: Number(durationMin),
      baseFare: Number(baseFare),
      isActive: true,
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setRoutes((prev) => [...prev, res.data]);
    setName("");
    setCode("");
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const res = await toggleRouteStatusAction(id, newStatus);
    if (res.success) {
      setRoutes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: newStatus } : r))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Rutas y Paradas Interparroquiales
          </h1>
          <p className="text-sm text-muted-foreground">
            Definición de trayectos, distancias estimadas, tiempos de viaje y tarifas base.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Nueva Ruta"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">Registrar Nueva Ruta Interparroquial</CardTitle>
            <CardDescription className="text-xs">
              Vincule una parada de origen y destino con sus distancias y tarifas calculadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="route-name">Nombre de la Ruta</Label>
                  <Input
                    id="route-name"
                    placeholder="Ibarra - Otavalo (Directo)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="route-code">Código de Ruta (Identificador)</Label>
                  <Input
                    id="route-code"
                    placeholder="RN-101"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="origin-stop">Parada de Origen</Label>
                  <select
                    id="origin-stop"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={originStopId}
                    onChange={(e) => setOriginStopId(e.target.value)}
                    required
                  >
                    {stops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destination-stop">Parada de Destino</Label>
                  <select
                    id="destination-stop"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={destinationStopId}
                    onChange={(e) => setDestinationStopId(e.target.value)}
                    required
                  >
                    {stops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="route-dist">Distancia (km)</Label>
                    <Input
                      id="route-dist"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="route-time">Duración Estimada (min)</Label>
                    <Input
                      id="route-time"
                      type="number"
                      min="5"
                      value={durationMin}
                      onChange={(e) => setDurationMin(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="route-fare">Tarifa Base (USD)</Label>
                    <Input
                      id="route-fare"
                      type="number"
                      step="0.05"
                      min="0.25"
                      value={baseFare}
                      onChange={(e) => setBaseFare(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Previsualización del trazado vial de la ruta */}
              {selectedOriginStop && selectedDestStop && (
                <div className="pt-2 border-t">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Previsualización Cartográfica y Vial en Tiempo Real
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Verifique que la ruta una las carreteras correctas antes de guardarla.
                    </span>
                  </div>
                  <RouteMapCard
                    origin={{
                      id: selectedOriginStop.id,
                      name: selectedOriginStop.name,
                      latitude: selectedOriginStop.latitude,
                      longitude: selectedOriginStop.longitude,
                    }}
                    destination={{
                      id: selectedDestStop.id,
                      name: selectedDestStop.name,
                      latitude: selectedDestStop.latitude,
                      longitude: selectedDestStop.longitude,
                    }}
                    scheduledDurationMin={durationMin}
                    height="300px"
                    showStopsList={false}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Ruta
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
          placeholder="Buscar ruta por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla de Rutas */}
      <div className="rounded-xl border bg-brand-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-light text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Ruta</th>
                <th className="px-6 py-3">Trayecto (Origen → Destino)</th>
                <th className="px-6 py-3 text-center">Distancia / Tiempo</th>
                <th className="px-6 py-3 text-center">Tarifa Base</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron rutas registradas.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-brand-primary">
                      {route.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {route.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{route.origin_stop?.name || "Origen"}</span>
                      <ArrowRight className="h-3 w-3 text-brand-secondary inline" />
                      <span>{route.destination_stop?.name || "Destino"}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs">
                      {route.distance_km} km · {route.duration_min} min
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-xs text-brand-primary">
                      {formatCurrency(route.base_fare || 2.5)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={route.is_active ? "success" : "destructive"}>
                        {route.is_active ? "Operativa" : "Suspendida"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={route.is_active ? "outline" : "default"}
                        onClick={() => handleToggleStatus(route.id, route.is_active)}
                        className="text-xs h-8"
                      >
                        {route.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Módulo de Administración de Coordenadas de Paradas */}
      <div className="pt-6 border-t">
        <StopCoordinateEditor
          stops={currentStops}
          onUpdated={(updatedStop) => {
            setCurrentStops((prev) =>
              prev.map((s) => (s.id === updatedStop.id ? updatedStop : s))
            );
          }}
        />
      </div>
    </div>
  );
}
