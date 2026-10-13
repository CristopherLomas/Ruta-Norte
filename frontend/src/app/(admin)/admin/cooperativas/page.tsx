import { Metadata } from "next";
import { getCooperativesAction } from "@/features/cooperatives/actions";
import { CooperativesClient } from "./CooperativesClient";

export const metadata: Metadata = {
  title: "Cooperativas — Administración Ruta Norte",
};

export default async function CooperativasPage() {
  const res = await getCooperativesAction();
  const cooperatives = res.success ? res.data : [];

  return <CooperativesClient initialCooperatives={cooperatives} />;
}
