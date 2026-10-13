import { Metadata } from "next";
import Link from "next/link";
import { QrCode, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrScannerClient } from "@/features/inspector/components/QrScannerClient";

export const metadata: Metadata = {
  title: "Validación de Embarque — Ruta Norte",
};

export default function InspectorDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabecera del Inspector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Validación de Boletos y Control de Embarque
          </h1>
          <p className="text-sm text-muted-foreground">
            Escaneo de códigos QR, verificación de estado en tiempo real y prevención de doble uso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="bg-emerald-600 text-white">
            Inspector de Ruta Activo
          </Badge>
          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl gap-1.5 text-xs font-bold">
            <Link href="/inspector/escanear">
              <QrCode className="h-3.5 w-3.5" />
              Abrir Escáner Dedicado
            </Link>
          </Button>
        </div>
      </div>

      {/* Componente Escáner QR Principal */}
      <QrScannerClient />

      {/* Métricas y Garantías de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="bg-white border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escaneo QR en Servidor</CardTitle>
            <QrCode className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Verificación Atómica</div>
            <p className="text-xs text-muted-foreground mt-1">
              Validación en PostgreSQL que bloquea el boleto e impide su re-utilización.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manifiesto en Vivo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Control de Andén</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registro inmediato del inspector y marca de tiempo exacta del abordaje.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anti Doble Embarque</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Garantía SQL</div>
            <p className="text-xs text-muted-foreground mt-1">
              Alerta inmediata con fecha y hora si un boleto fue escaneado previamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
