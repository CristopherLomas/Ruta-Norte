"use client";

import * as React from "react";
import { Plus, Building2, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Cooperative } from "@/types";
import { createCooperativeAction, toggleCooperativeStatusAction } from "@/features/cooperatives/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CooperativesClientProps {
  initialCooperatives: Cooperative[];
}

export function CooperativesClient({ initialCooperatives }: CooperativesClientProps) {
  const [cooperatives, setCooperatives] = React.useState<Cooperative[]>(initialCooperatives);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Campos de formulario
  const [name, setName] = React.useState("");
  const [ruc, setRuc] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  const filteredCooperatives = cooperatives.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ruc.includes(searchTerm)
  );

  const handleCreateCooperative = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await createCooperativeAction({
      name,
      ruc,
      phone: phone || undefined,
      address: address || undefined,
      isActive: true,
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setCooperatives((prev) => [...prev, res.data]);
    setName("");
    setRuc("");
    setPhone("");
    setAddress("");
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const res = await toggleCooperativeStatusAction(id, newStatus);
    if (res.success) {
      setCooperatives((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Cooperativas de Transporte
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de empresas prestadoras de servicio interparroquial en Imbabura y Pichincha.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Nueva Cooperativa"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">Registrar Nueva Cooperativa</CardTitle>
            <CardDescription className="text-xs">
              Ingrese la razón social y RUC legal de 13 dígitos registrado en el SRI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCooperative} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="coop-name">Nombre / Razón Social</Label>
                  <Input
                    id="coop-name"
                    placeholder="Cooperativa Transportes Otavalo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coop-ruc">Número de RUC (13 dígitos)</Label>
                  <Input
                    id="coop-ruc"
                    placeholder="1091723456001"
                    maxLength={13}
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coop-phone">Teléfono de Contacto</Label>
                  <Input
                    id="coop-phone"
                    placeholder="062920123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coop-address">Dirección de Terminal</Label>
                  <Input
                    id="coop-address"
                    placeholder="Av. Atahualpa y Panamericana Norte"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cooperativa
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
          placeholder="Buscar por nombre o RUC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla Operativa */}
      <div className="rounded-xl border bg-brand-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-light text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Cooperativa</th>
                <th className="px-6 py-3">RUC</th>
                <th className="px-6 py-3">Teléfono / Dirección</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCooperatives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron cooperativas registradas.
                  </td>
                </tr>
              ) : (
                filteredCooperatives.map((coop) => (
                  <tr key={coop.id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-primary flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {coop.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{coop.ruc}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {coop.phone || "Sin teléfono"} · {coop.address || "Sin dirección"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={coop.is_active ? "success" : "destructive"}>
                        {coop.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={coop.is_active ? "outline" : "default"}
                        onClick={() => handleToggleStatus(coop.id, coop.is_active)}
                        className="text-xs h-8"
                      >
                        {coop.is_active ? "Desactivar" : "Activar"}
                      </Button>
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
