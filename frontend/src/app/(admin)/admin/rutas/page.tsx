import { Metadata } from "next";
import { getRoutesAction, getStopsAction } from "@/features/routes/actions";
import { RoutesClient } from "./RoutesClient";

export const metadata: Metadata = {
  title: "Rutas y Paradas — Administración Ruta Norte",
};

export default async function RutasPage() {
  const [routesRes, stopsRes] = await Promise.all([
    getRoutesAction(),
    getStopsAction(),
  ]);

  const routes = routesRes.success ? routesRes.data : [];
  const stops = stopsRes.success ? stopsRes.data : [];

  return <RoutesClient initialRoutes={routes} stops={stops} />;
}
