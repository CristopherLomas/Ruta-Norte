import { Metadata } from "next";
import { Users, Route, Bus, DollarSign, ShieldCheck, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Administración General — Ruta Norte",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Administración General del Sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Control de usuarios, roles privilegiados, auditoría de seguridad y configuración global.
          </p>
        </div>
        <Badge variant="destructive" className="self-start sm:self-auto">
          Acceso Nivel Super-Admin
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios y Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Control RBAC</div>
            <p className="text-xs text-muted-foreground mt-1">
              Asignación segura de roles privilegiados exclusivamente desde servidor.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auditoría del Sistema</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Bitácora Inmutable</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registro automático de inserciones, cancelaciones y cambios sensibles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seguridad de Datos</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">RLS Activo</div>
            <p className="text-xs text-muted-foreground mt-1">
              18 tablas con políticas restrictivas y protección contra escalada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
