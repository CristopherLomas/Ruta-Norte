import { Metadata } from "next";
import { getTripsAction } from "@/features/trips/actions";
import { getRoutesAction } from "@/features/routes/actions";
import { getBusesAction } from "@/features/buses/actions";
import { getDriversAction } from "@/features/drivers/actions";
import { TripsClient } from "./TripsClient";

export const metadata: Metadata = {
  title: "Programación de Viajes — Operaciones Ruta Norte",
};

export default async function ViajesPage() {
  const [tripsRes, routesRes, busesRes, driversRes] = await Promise.all([
    getTripsAction(),
    getRoutesAction(),
    getBusesAction(),
    getDriversAction(),
  ]);

  const trips = tripsRes.success ? tripsRes.data : [];
  const routes = routesRes.success ? routesRes.data : [];
  const buses = busesRes.success ? busesRes.data : [];
  const drivers = driversRes.success ? driversRes.data : [];

  return (
    <TripsClient
      initialTrips={trips}
      routes={routes}
      buses={buses}
      drivers={drivers}
    />
  );
}
