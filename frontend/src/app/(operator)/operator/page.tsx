import { Metadata } from "next";
import { Route, Bus, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Operaciones y Flota — Ruta Norte",
};

export default function OperatorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Gestión Operativa de Rutas y Salidas
          </h1>
          <p className="text-sm text-muted-foreground">
            Programación de viajes, asignación de unidades, conductores y tarifas interparroquiales.
          </p>
        </div>
        <Badge variant="default" className="self-start sm:self-auto bg-brand-primary">
          Rol: Operador de Transporte
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Programación de Viajes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Salidas Activas</div>
            <p className="text-xs text-muted-foreground mt-1">
              Viajes programados en terminales de Ibarra, Otavalo, Cotacachi y Zuleta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unidades y Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Flota Registrada</div>
            <p className="text-xs text-muted-foreground mt-1">
              Capacidades y configuración visual de asientos en formato JSONB.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidencias en Ruta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">Gestión Operativa</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registro de demoras, desperfectos mecánicos o bloqueos de vía.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
