import { Metadata } from "next";
import { Ticket, Search, Clock, Compass } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mi Portal — Ruta Norte",
};

export default function PassengerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Mis Viajes y Boletos
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulte sus reservas activas, historial de viajes y códigos QR de embarque.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2">
          <Link href="/">
            <Search className="h-4 w-4" />
            Buscar Nuevo Viaje
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boletos Emitidos</CardTitle>
            <Ticket className="h-4 w-4 text-brand-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">QR Listo</div>
            <p className="text-xs text-muted-foreground mt-1">
              Presente su código QR digital al inspector al momento de abordar.
            </p>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-brand-secondary mt-3">
              <Link href="/passenger/boletos">Ver mis boletos →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Tiempo Límite</div>
            <p className="text-xs text-muted-foreground mt-1">
              Las reservas temporales expiran automáticamente en 10 minutos si no se confirman.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rutas Disponibles</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Imbabura</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conexión directa entre Ibarra, Otavalo, Cotacachi, San Antonio y Zuleta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
