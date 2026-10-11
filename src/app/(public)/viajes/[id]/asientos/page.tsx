import { notFound } from "next/navigation";
import { getTripDetailsAction } from "@/features/trips/actions/search";
import { SelectSeatsClient } from "./SelectSeatsClient";

interface TripSeatsPageProps {
  params: {
    id: string;
  };
}

export default async function TripSeatsPage({ params }: TripSeatsPageProps) {
  const res = await getTripDetailsAction(params.id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <SelectSeatsClient trip={res.data} />
    </div>
  );
}
