"use client";

import * as React from "react";
import { Plus, AlertTriangle, Clock, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Incident, Trip } from "@/types";
import { reportIncidentAction } from "@/features/incidents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatEcuadorDate } from "@/lib/utils";

interface IncidentsClientProps {
  initialIncidents: Incident[];
  trips: Trip[];
}

export function IncidentsClient({ initialIncidents, trips }: IncidentsClientProps) {
  const [incidents, setIncidents] = React.useState<Incident[]>(initialIncidents);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Formulario
  const [tripId, setTripId] = React.useState(trips[0]?.id || "");
  const [type, setType] = React.useState<"delay" | "breakdown" | "accident" | "other">("delay");
  const [severity, setSeverity] = React.useState<"low" | "medium" | "high" | "critical">("medium");
  const [description, setDescription] = React.useState("");

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await reportIncidentAction({
      tripId,
      type,
      severity,
      description,
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setIncidents((prev) => [res.data, ...prev]);
    setDescription("");
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <Badge variant="destructive">Crítica</Badge>;
      case "high":
        return <Badge variant="default" className="bg-red-600 text-white">Alta</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-amber-600 text-white">Media</Badge>;
      case "low":
      default:
        return <Badge variant="outline">Baja</Badge>;
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "delay":
        return "Demora en Ruta";
      case "breakdown":
        return "Falla Mecánica";
      case "accident":
        return "Accidente / Siniestro";
      case "other":
      default:
        return "Otro";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Incidencias y Novedades Operativas
          </h1>
          <p className="text-sm text-muted-foreground">
            Bitácora de retrasos, desperfectos mecánicos, desvíos y eventos en carretera.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Reportar Incidencia"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-amber-500/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">Registrar Novedad en Ruta</CardTitle>
            <CardDescription className="text-xs">
              Detalle el tipo de suceso y la gravedad para alertar al centro de operaciones y pasajeros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateIncident} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="inc-trip">Viaje Afectado</Label>
                  <select
                    id="inc-trip"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    required
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.route?.name || "Ruta"} ({t.bus?.unit_number || "Bus"}) — Salida: {formatEcuadorDate(t.departure_time)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inc-type">Tipo de Evento</Label>
                  <select
                    id="inc-type"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={type}
                    onChange={(e) => setType(e.target.value as "delay" | "breakdown" | "accident" | "other")}
                  >
                    <option value="delay">Demora / Tráfico Pesado</option>
                    <option value="breakdown">Desperfecto Mecánico</option>
                    <option value="accident">Accidente o Cierre de Vía</option>
                    <option value="other">Otro Suceso</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inc-sev">Severidad</Label>
                  <select
                    id="inc-sev"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high" | "critical")}
                  >
                    <option value="low">Baja (Retraso menor a 15 min)</option>
                    <option value="medium">Media (Retraso 15-45 min)</option>
                    <option value="high">Alta (Unidad detenida)</option>
                    <option value="critical">Crítica (Requiere transbordo)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="inc-desc">Descripción Detallada</Label>
                  <Input
                    id="inc-desc"
                    placeholder="Describa el motivo, ubicación aproximada y medidas adoptadas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrar Incidencia
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Incidencias */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              No se han registrado incidencias operativas activas. La operación se desarrolla con normalidad.
            </CardContent>
          </Card>
        ) : (
          incidents.map((inc) => (
            <Card key={inc.id} className="border-border shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-sm text-brand-primary">{getTypeLabel(inc.type)}</span>
                    {getSeverityBadge(inc.severity)}
                  </div>
                  <p className="text-xs text-foreground">{inc.description}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Reportado el {formatEcuadorDate(inc.reported_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
