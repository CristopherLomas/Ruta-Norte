import { notFound } from "next/navigation";
import { getTripManifestAction } from "@/features/trips/actions/manifest";
import { ManifestViewClient } from "@/features/trips/components/ManifestViewClient";

interface ManifestPageProps {
  params: {
    id: string;
  };
}

export default async function ManifestPage({ params }: ManifestPageProps) {
  const res = await getTripManifestAction(params.id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ManifestViewClient initialManifest={res.data} />
    </div>
  );
}
