import { Metadata } from "next";
import { QrCode, CheckCircle2, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Validación de Embarque — Ruta Norte",
};

export default function InspectorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Validación de Boletos y Control de Embarque
          </h1>
          <p className="text-sm text-muted-foreground">
            Escaneo de códigos QR, verificación de estado en tiempo real y prevención de doble uso.
          </p>
        </div>
        <Badge variant="success" className="self-start sm:self-auto bg-emerald-600 text-white">
          Rol: Inspector de Ruta
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escaneo QR en Servidor</CardTitle>
            <QrCode className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Verificación 1-Click</div>
            <p className="text-xs text-muted-foreground mt-1">
              Validación atómica que bloquea el boleto e impide su re-utilización.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manifiesto de Pasajeros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Lista Oficial</div>
            <p className="text-xs text-muted-foreground mt-1">
              Control de pasajeros confirmados por unidad y tramo del recorrido.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anti Doble Embarque</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Garantía SQL</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rechazo inmediato con marca de fecha y hora ante boletos previamente utilizados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
