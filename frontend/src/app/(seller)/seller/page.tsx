import { Metadata } from "next";
import { Ticket, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Taquilla y Ventas — Ruta Norte",
};

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Punto de Venta y Emisión de Boletos
          </h1>
          <p className="text-sm text-muted-foreground">
            Venta presencial en ventanilla, cobro simulado y emisión inmediata con código QR.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto bg-brand-secondary text-white">
          Rol: Vendedor de Taquilla
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Venta Inmediata</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Emisión Rápida</div>
            <p className="text-xs text-muted-foreground mt-1">
              Selección de asientos en tiempo real con bloqueo atómico anti-colisión.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobro Simulado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-secondary">Efectivo / Tarjeta</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registro del pago de prueba y generación del comprobante fiscal académico.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boletos Emitidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">QR Único</div>
            <p className="text-xs text-muted-foreground mt-1">
              Token criptográfico listo para entrega e impresión al usuario.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
