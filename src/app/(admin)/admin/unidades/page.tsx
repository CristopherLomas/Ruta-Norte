import { Metadata } from "next";
import { getBusesAction } from "@/features/buses/actions";
import { getCooperativesAction } from "@/features/cooperatives/actions";
import { BusesClient } from "./BusesClient";

export const metadata: Metadata = {
  title: "Unidades y Buses — Administración Ruta Norte",
};

export default async function UnidadesPage() {
  const [busesRes, coopsRes] = await Promise.all([
    getBusesAction(),
    getCooperativesAction(),
  ]);

  const buses = busesRes.success ? busesRes.data : [];
  const cooperatives = coopsRes.success ? coopsRes.data : [];

  return <BusesClient initialBuses={buses} cooperatives={cooperatives} />;
}
