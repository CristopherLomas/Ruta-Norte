import { Metadata } from "next";
import { QrScannerClient } from "@/features/inspector/components/QrScannerClient";

export const metadata: Metadata = {
  title: "Escanear Boletos — Inspector Ruta Norte",
};

export default function InspectorScanPage() {
  return (
    <div className="space-y-6">
      <QrScannerClient />
    </div>
  );
}
