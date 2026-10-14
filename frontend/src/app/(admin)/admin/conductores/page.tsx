import { Metadata } from "next";
import { getDriversAction } from "@/features/drivers/actions";
import { DriversClient } from "./DriversClient";

export const metadata: Metadata = {
  title: "Conductores — Administración Ruta Norte",
};

export default async function ConductoresPage() {
  const res = await getDriversAction();
  const drivers = res.success ? res.data : [];

  return <DriversClient initialDrivers={drivers} />;
}
