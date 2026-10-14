"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Printer,
  Bus,
  User,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Play,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TripManifestData } from "@/features/trips/actions/manifest";
import { updateTripDispatchStatusAction } from "@/features/trips/actions/dispatch";
import { TripStatus } from "@/types";

interface ManifestViewClientProps {
  initialManifest: TripManifestData;
}

export function ManifestViewClient({ initialManifest }: ManifestViewClientProps) {
  const router = useRouter();
  const [manifest, setManifest] = React.useState<TripManifestData>(initialManifest);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (nextStatus: TripStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await updateTripDispatchStatusAction(manifest.trip_id, nextStatus);
      if (!res.success) {
        setStatusMessage(res.error || "Error al actualizar estado");
      } else {
        setManifest((prev) => ({ ...prev, status: nextStatus }));
        setStatusMessage(`Estado del viaje actualizado a '${nextStatus}'.`);
      }
    } catch {
      setStatusMessage("Error de conexión al actualizar el estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const departureDate = new Date(manifest.departure_time).toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const departureHour = new Date(manifest.departure_time).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programado</Badge>;
      case "boarding":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">En Andén (Embarque)</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-indigo-600 text-white">En Tránsito / Ruta</Badge>;
      case "completed":
        return <Badge variant="success" className="bg-emerald-600 text-white">Viaje Concluido</Badge>;
      default:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Barra de Control de Despacho & Impresión (Oculto en impresión) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border rounded-2xl shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-brand-primary">Control de Despacho del Viaje</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">Estado Actual:</span>
              {getStatusBadge(manifest.status)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {manifest.status === "scheduled" && (
            <Button
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("boarding")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 rounded-xl shadow-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              Llamar a Embarque
            </Button>
          )}

          {manifest.status === "boarding" && (
            <Button
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("in_progress")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 rounded-xl shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Despachar Unidad (En Ruta)
            </Button>
          )}

          {manifest.status === "in_progress" && (
            <Button
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("completed")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 rounded-xl shadow-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar Viaje Concluido
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5 rounded-xl border-slate-300"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir Manifiesto
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2 print:hidden">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* DOCUMENTO OFICIAL: MANIFIESTO DE PASAJEROS (Formato imprimible) */}
      <Card className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Cabecera Oficial */}
        <div className="bg-brand-primary text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80 block">
                Agencia Nacional de Tránsito · Ecuador
              </span>
              <h2 className="text-2xl font-black tracking-tight">MANIFIESTO OFICIAL DE PASAJEROS</h2>
              <p className="text-sm font-semibold opacity-90 mt-1">
                {manifest.cooperative_name} · Operación Interparroquial
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono opacity-80 block">VIAJE ID</span>
              <span className="text-sm font-mono font-bold">{manifest.trip_id.slice(0, 8).toUpperCase()}</span>
              <div className="mt-1 print:hidden">{getStatusBadge(manifest.status)}</div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Ficha Técnica del Despacho */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border text-xs print:bg-white print:border-black">
            <div>
              <span className="text-muted-foreground uppercase font-bold text-[10px] block">Ruta & Tramo</span>
              <strong className="text-sm text-brand-primary">{manifest.route_name}</strong>
              <span className="block text-slate-600">{manifest.origin_name} → {manifest.destination_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-bold text-[10px] block">Salida</span>
              <strong className="text-sm text-slate-800">{departureHour}</strong>
              <span className="block text-slate-600">{departureDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-bold text-[10px] block">Unidad / Bus</span>
              <strong className="text-sm text-slate-800">{manifest.unit_number}</strong>
              <span className="block text-slate-600">Placa: {manifest.plate}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-bold text-[10px] block">Conductor Responsable</span>
              <strong className="text-sm text-slate-800">{manifest.driver_name}</strong>
              <span className="block text-slate-600">Licencia: {manifest.driver_license}</span>
            </div>
          </div>

          {/* Resumen de Ocupación */}
          <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-100 rounded-xl border print:bg-white print:border-black">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Capacidad</span>
              <span className="text-lg font-black text-slate-800">{manifest.total_capacity}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Vendidos</span>
              <span className="text-lg font-black text-brand-primary">{manifest.sold_count}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">A Bordo</span>
              <span className="text-lg font-black text-emerald-600">{manifest.boarded_count}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Vacíos</span>
              <span className="text-lg font-black text-slate-500">{manifest.empty_count}</span>
            </div>
          </div>

          {/* Tabla de Pasajeros */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-brand-primary flex items-center justify-between">
              <span>Nómina de Pasajeros Registrados ({manifest.passengers.length})</span>
              <span className="text-xs text-muted-foreground font-normal">
                Ordenado por número de asiento
              </span>
            </h4>

            {manifest.passengers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed text-xs text-muted-foreground">
                No hay boletos emitidos para este viaje aún.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-xl print:border-black">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b print:bg-white print:border-black">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Asiento</th>
                      <th className="py-2.5 px-3">Nombre del Pasajero</th>
                      <th className="py-2.5 px-3">Cédula / Identificación</th>
                      <th className="py-2.5 px-3">Destino</th>
                      <th className="py-2.5 px-3 text-center">Estado Abordaje</th>
                      <th className="py-2.5 px-3 text-right">Hora Abordaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-black">
                    {manifest.passengers.map((p) => {
                      const isBoarded = p.status === "used";
                      return (
                        <tr key={p.ticket_id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center font-bold font-mono text-brand-primary">
                            {p.seat_number}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {p.passenger_name}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {p.id_card || "N/A"}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {p.destination_name}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isBoarded ? (
                              <Badge variant="success" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">
                                A Bordo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                                Pendiente
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">
                            {p.boarded_at
                              ? new Date(p.boarded_at).toLocaleTimeString("es-EC", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Firmas de Responsabilidad (Para versión impresa) */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-center text-xs">
            <div className="border-t border-black pt-2">
              <span className="font-bold block">{manifest.driver_name}</span>
              <span className="text-muted-foreground">Firma del Conductor Responsable</span>
            </div>
            <div className="border-t border-black pt-2">
              <span className="font-bold block">Inspector de Despacho en Andén</span>
              <span className="text-muted-foreground">Firma y Sello de Autorización</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
