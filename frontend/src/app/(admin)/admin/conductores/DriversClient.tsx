"use client";

import * as React from "react";
import { Plus, Users, Search, UserCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Driver, DriverStatus } from "@/types";
import { createDriverAction, updateDriverStatusAction } from "@/features/drivers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DriversClientProps {
  initialDrivers: Driver[];
}

export function DriversClient({ initialDrivers }: DriversClientProps) {
  const [drivers, setDrivers] = React.useState<Driver[]>(initialDrivers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Formulario
  const [idCard, setIdCard] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [licenseCategory, setLicenseCategory] = React.useState<"Tipo C" | "Tipo D" | "Tipo E">("Tipo D");
  const [licenseExpiry, setLicenseExpiry] = React.useState("2028-12-31");

  const filteredDrivers = drivers.filter(
    (d) =>
      (d.full_name && d.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.id_card && d.id_card.includes(searchTerm)) ||
      d.license_number.includes(searchTerm)
  );

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await createDriverAction({
      idCard,
      fullName,
      phone: phone || undefined,
      licenseNumber: licenseNumber || idCard,
      licenseCategory,
      licenseExpiry,
      status: "active",
      isAvailable: true,
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setDrivers((prev) => [res.data, ...prev]);
    setIdCard("");
    setFullName("");
    setPhone("");
    setLicenseNumber("");
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleChangeStatus = async (id: string, newStatus: DriverStatus) => {
    const res = await updateDriverStatusAction(id, newStatus);
    if (res.success) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus, is_available: newStatus === "active" } : d))
      );
    }
  };

  const getStatusBadge = (status?: DriverStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Disponible / Activo</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspendido</Badge>;
      case "inactive":
      default:
        return <Badge variant="outline">Inactivo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Conductores y Operadores de Ruta
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de choferes profesionales, control de licencias vigentes y estado de disponibilidad.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Nuevo Conductor"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">Registrar Nuevo Conductor</CardTitle>
            <CardDescription className="text-xs">
              Ingrese la cédula de 10 dígitos y categoría de licencia profesional (Tipo D recomendada para transporte colectivo).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDriver} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="driver-id">Cédula de Identidad (10 dígitos)</Label>
                  <Input
                    id="driver-id"
                    placeholder="1003456789"
                    maxLength={10}
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">Validación con algoritmo oficial del Registro Civil</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver-name">Nombres y Apellidos Completos</Label>
                  <Input
                    id="driver-name"
                    placeholder="Segundo Patricio Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver-phone">Teléfono Celular (Ecuador)</Label>
                  <Input
                    id="driver-phone"
                    placeholder="0998765432"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver-license">Número de Licencia</Label>
                  <Input
                    id="driver-license"
                    placeholder="LIC-1003456"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver-category">Categoría de Licencia</Label>
                  <select
                    id="driver-category"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as "Tipo C" | "Tipo D" | "Tipo E")}
                  >
                    <option value="Tipo D">Tipo D (Transporte de Pasajeros e Interprovincial)</option>
                    <option value="Tipo E">Tipo E (Camiones Pesados y Articulados)</option>
                    <option value="Tipo C">Tipo C (Taxis y Camionetas)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver-expiry">Fecha de Caducidad de Licencia</Label>
                  <Input
                    id="driver-expiry"
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Conductor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Barra de búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conductor por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla de Conductores */}
      <div className="rounded-xl border bg-brand-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-light text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Conductor</th>
                <th className="px-6 py-3">Cédula</th>
                <th className="px-6 py-3">Licencia / Categoría</th>
                <th className="px-6 py-3">Vencimiento</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron conductores registrados.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-primary flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {driver.full_name || driver.profile?.full_name || "Conductor Registrado"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{driver.id_card || "—"}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-mono font-medium">{driver.license_number}</span> ({driver.license_category})
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {driver.license_expiry}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        {driver.status !== "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(driver.id, "active")}
                            className="text-xs h-7 text-emerald-600"
                          >
                            Activar
                          </Button>
                        )}
                        {driver.status !== "suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(driver.id, "suspended")}
                            className="text-xs h-7 text-red-600"
                          >
                            Suspender
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
