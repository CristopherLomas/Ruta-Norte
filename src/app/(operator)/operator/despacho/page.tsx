import { Metadata } from "next";
import { getTripsAction } from "@/features/trips/actions";
import { DispatchClient } from "./DispatchClient";

export const metadata: Metadata = {
  title: "Despacho en Andén — Operaciones Ruta Norte",
};

export default async function DespachoPage() {
  const res = await getTripsAction();
  const trips = res.success ? res.data : [];

  return <DispatchClient initialTrips={trips} />;
}
