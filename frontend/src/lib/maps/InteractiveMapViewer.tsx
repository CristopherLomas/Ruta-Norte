"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RouteStopWaypoint, RouteGeometry } from "./types";

interface AutoFitBoundsProps {
  waypoints: RouteStopWaypoint[];
  geometryCoordinates?: [number, number][]; // [lon, lat]
}

/**
 * Componente interno de React Leaflet para reencuadrar el mapa automáticamente.
 */
function AutoFitBounds({ waypoints, geometryCoordinates }: AutoFitBoundsProps) {
  const map = useMap();

  React.useEffect(() => {
    const latLngs: L.LatLngExpression[] = [];

    if (geometryCoordinates && geometryCoordinates.length > 0) {
      geometryCoordinates.forEach(([lon, lat]) => {
        latLngs.push([lat, lon]);
      });
    } else {
      waypoints.forEach((w) => {
        if (typeof w.latitude === "number" && typeof w.longitude === "number") {
          latLngs.push([w.latitude, w.longitude]);
        }
      });
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, waypoints, geometryCoordinates]);

  return null;
}

/**
 * Creador de iconos personalizados con colores de Ruta Norte.
 */
function createCustomIcon(label: string, type: "origin" | "destination" | "intermediate") {
  let bgColor = "#20A878"; // Verde movilidad (origen)
  let ringColor = "#16825c";
  let textColor = "#FFFFFF";

  if (type === "destination") {
    bgColor = "#173B57"; // Azul petróleo (destino)
    ringColor = "#0f2638";
  } else if (type === "intermediate") {
    bgColor = "#F59E0B"; // Ámbar / naranja para intermedias
    ringColor = "#d97706";
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      border: 2px solid ${ringColor};
      color: ${textColor};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      cursor: pointer;
    ">
      ${label}
    </div>
  `;

  return L.divIcon({
    html,
    className: "ruta-norte-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export interface InteractiveMapViewerProps {
  waypoints: RouteStopWaypoint[];
  geometry?: RouteGeometry | null;
  height?: string;
  zoom?: number;
  center?: [number, number];
  onStopClick?: (stop: RouteStopWaypoint) => void;
  interactive?: boolean;
}

export default function InteractiveMapViewer({
  waypoints,
  geometry,
  height = "420px",
  zoom = 10,
  center = [0.65, -77.75], // Centro aprox. de la provincia de Carchi
  interactive = true,
}: InteractiveMapViewerProps) {
  // Convertir GeoJSON [lon, lat] a [lat, lon] de Leaflet para polilínea
  const polylinePositions = React.useMemo<[number, number][]>(() => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  }, [geometry]);

  // Si no hay coordenadas en los waypoints
  const validWaypoints = waypoints.filter(
    (w) => typeof w.latitude === "number" && typeof w.longitude === "number" && !isNaN(w.latitude) && !isNaN(w.longitude)
  );

  const initialCenter: [number, number] =
    validWaypoints.length > 0
      ? [validWaypoints[0].latitude, validWaypoints[0].longitude]
      : center;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0" style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Polilínea de carretera real */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#173B57", // Azul petróleo institucional
              weight: 5,
              opacity: 0.85,
              lineJoin: "round",
            }}
          />
        )}

        {/* Marcadores de paradas */}
        {validWaypoints.map((wp, index) => {
          let type: "origin" | "destination" | "intermediate" = "intermediate";
          let label = `${index}`;

          if (wp.isOrigin || index === 0) {
            type = "origin";
            label = "A";
          } else if (wp.isDestination || index === validWaypoints.length - 1) {
            type = "destination";
            label = "B";
          }

          const icon = createCustomIcon(label, type);

          return (
            <Marker key={wp.id} position={[wp.latitude, wp.longitude]} icon={icon}>
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{wp.name}</div>
                  <div className="text-slate-500">
                    {type === "origin"
                      ? "Punto de Partida (Origen)"
                      : type === "destination"
                      ? "Punto de Llegada (Destino)"
                      : `Parada Intermedia #${wp.sequenceOrder}`}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Lat: {wp.latitude.toFixed(4)}, Lon: {wp.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Reencuadre automático */}
        <AutoFitBounds
          waypoints={validWaypoints}
          geometryCoordinates={geometry?.coordinates}
        />
      </MapContainer>
    </div>
  );
}
