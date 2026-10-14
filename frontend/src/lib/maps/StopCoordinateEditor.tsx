"use client";

import * as React from "react";
import { MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stop } from "@/types";
import { updateStopCoordinatesAction } from "./actions";
import { InteractiveMap } from "./InteractiveMap";

interface StopCoordinateEditorProps {
  stops: Stop[];
  onUpdated?: (updatedStop: Stop) => void;
}

export function StopCoordinateEditor({ stops, onUpdated }: StopCoordinateEditorProps) {
  const [selectedStopId, setSelectedStopId] = React.useState<string>(stops[0]?.id || "");
  const currentStop = stops.find((s) => s.id === selectedStopId);

  const [lat, setLat] = React.useState<string>(
    currentStop?.latitude ? String(currentStop.latitude) : "0.8125"
  );
  const [lng, setLng] = React.useState<string>(
    currentStop?.longitude ? String(currentStop.longitude) : "-77.7180"
  );
  const [address, setAddress] = React.useState<string>(currentStop?.address || "");

  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (currentStop) {
      setLat(currentStop.latitude ? String(currentStop.latitude) : "");
      setLng(currentStop.longitude ? String(currentStop.longitude) : "");
      setAddress(currentStop.address || "");
      setMessage(null);
    }
  }, [selectedStopId, currentStop]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setMessage({ type: "error", text: "Debe ingresar valores numéricos válidos para latitud y longitud." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const res = await updateStopCoordinatesAction({
      stopId: selectedStopId,
      latitude: latNum,
      longitude: lngNum,
      address: address.trim() || undefined,
    });

    setIsLoading(false);

    if (!res.success) {
      setMessage({ type: "error", text: res.error || "No se pudo actualizar la coordenada." });
    } else {
      setMessage({ type: "success", text: "Coordenadas guardadas correctamente en la base de datos." });
      if (currentStop && onUpdated) {
        onUpdated({
          ...currentStop,
          latitude: latNum,
          longitude: lngNum,
          address: address.trim() || currentStop.address,
        });
      }
    }
  };

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b">
        <MapPin className="h-5 w-5 text-brand-secondary" />
        <h3 className="font-bold text-sm text-brand-primary">
          Administración de Coordenadas Geográficas de Paradas
        </h3>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="stop-select">Seleccione Parada</Label>
            <select
              id="stop-select"
              className="w-full h-10 px-3 text-sm bg-slate-50 border rounded-lg focus:ring-1 focus:ring-brand-primary"
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {!s.latitude || !s.longitude ? "(⚠️ Requiere coordenadas)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lat">Latitud (ej: 0.8125)</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="0.8125"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng">Longitud (ej: -77.7180)</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-77.7180"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección de Referencia</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Panamericana y ..."
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary text-white rounded-lg gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Guardar Coordenadas Oficiales
          </Button>

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={message.type === "success" ? "bg-emerald-50 text-emerald-900 border-emerald-200" : ""}
            >
              {message.type === "error" ? <AlertCircle className="h-4 w-4 text-red-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
              <AlertDescription className="text-xs">{message.text}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Previsualización en Mapa */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Previsualización de Posición</Label>
          {hasValidCoords ? (
            <InteractiveMap
              waypoints={[
                {
                  id: selectedStopId,
                  name: currentStop?.name || "Parada seleccionada",
                  sequenceOrder: 1,
                  latitude: parsedLat,
                  longitude: parsedLng,
                  isOrigin: true,
                },
              ]}
              height="240px"
              zoom={13}
            />
          ) : (
            <div className="h-[240px] bg-slate-50 border border-dashed rounded-xl flex items-center justify-center text-xs text-muted-foreground text-center p-4">
              Ingrese latitud y longitud válidas para previsualizar la parada en el mapa.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
