import { Metadata } from "next";
import { getIncidentsAction } from "@/features/incidents/actions";
import { getTripsAction } from "@/features/trips/actions";
import { IncidentsClient } from "./IncidentsClient";

export const metadata: Metadata = {
  title: "Incidencias Operativas — Operaciones Ruta Norte",
};

export default async function IncidenciasPage() {
  const [incidentsRes, tripsRes] = await Promise.all([
    getIncidentsAction(),
    getTripsAction(),
  ]);

  const incidents = incidentsRes.success ? incidentsRes.data : [];
  const trips = tripsRes.success ? tripsRes.data : [];

  return <IncidentsClient initialIncidents={incidents} trips={trips} />;
}
