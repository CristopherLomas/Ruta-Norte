"use client";

import * as React from "react";
import { Plus, Bus as BusIcon, Search, Wrench, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Bus, Cooperative, BusStatus } from "@/types";
import { createBusAction, updateBusStatusAction } from "@/features/buses/actions";
import { SeatLayoutPreview } from "@/components/shared/SeatLayoutPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BusesClientProps {
  initialBuses: Bus[];
  cooperatives: Cooperative[];
}

export function BusesClient({ initialBuses, cooperatives }: BusesClientProps) {
  const [buses, setBuses] = React.useState<Bus[]>(initialBuses);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Formulario
  const [cooperativeId, setCooperativeId] = React.useState(cooperatives[0]?.id || "");
  const [plate, setPlate] = React.useState("");
  const [unitNumber, setUnitNumber] = React.useState("");
  const [model, setModel] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [year, setYear] = React.useState(2023);
  const [rows, setRows] = React.useState(10);
  const [columns, setColumns] = React.useState(4);

  const filteredBuses = buses.filter(
    (b) =>
      b.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.unit_number && b.unit_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const calculatedSeats = rows * (columns === 4 ? 4 : 3);

    const res = await createBusAction({
      cooperativeId: cooperativeId || null,
      plate,
      unitNumber,
      model: model || undefined,
      brand: brand || undefined,
      year: Number(year),
      totalSeats: calculatedSeats,
      rows: Number(rows),
      columns: Number(columns),
      status: "active",
      isActive: true,
    });

    if (!res.success) {
      setFormError(res.error);
      setIsLoading(false);
      return;
    }

    setBuses((prev) => [...prev, res.data]);
    setPlate("");
    setUnitNumber("");
    setModel("");
    setBrand("");
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleChangeStatus = async (busId: string, newStatus: BusStatus) => {
    const res = await updateBusStatusAction(busId, newStatus);
    if (res.success) {
      setBuses((prev) =>
        prev.map((b) => (b.id === busId ? { ...b, status: newStatus, is_active: newStatus === "active" } : b))
      );
    }
  };

  const getStatusBadge = (status?: BusStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Activa / En Servicio</Badge>;
      case "maintenance":
        return <Badge variant="default" className="bg-amber-600 text-white">En Mantenimiento</Badge>;
      case "inactive":
      default:
        return <Badge variant="destructive">Fuera de Servicio</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Gestión de Unidades y Buses
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de flota, número de disco, layout de asientos y control de mantenimiento.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Cerrar Formulario" : "Nueva Unidad"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">Registrar Nueva Unidad de Transporte</CardTitle>
            <CardDescription className="text-xs">
              Configure la placa oficial, número de disco y la distribución física de asientos (ADR-003).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBus} className="space-y-6">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="coop-select">Cooperativa Vinculada</Label>
                    <select
                      id="coop-select"
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={cooperativeId}
                      onChange={(e) => setCooperativeId(e.target.value)}
                    >
                      <option value="">Seleccione cooperativa (opcional)</option>
                      {cooperatives.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bus-plate">Placa Oficial (Ecuador)</Label>
                      <Input
                        id="bus-plate"
                        placeholder="IAA-1234"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bus-disk">Número de Disco</Label>
                      <Input
                        id="bus-disk"
                        placeholder="Disco 24"
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bus-brand">Marca</Label>
                      <Input
                        id="bus-brand"
                        placeholder="Mercedes-Benz"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bus-model">Modelo</Label>
                      <Input
                        id="bus-model"
                        placeholder="OF 1721"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bus-year">Año</Label>
                      <Input
                        id="bus-year"
                        type="number"
                        min={1990}
                        max={2030}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Configuración de distribución de asientos */}
                  <div className="p-4 bg-brand-light rounded-lg border border-border space-y-3">
                    <h4 className="text-xs font-semibold text-brand-primary">Configuración de Layout de Asientos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="bus-rows">Filas de Asientos: {rows}</Label>
                        <input
                          id="bus-rows"
                          type="range"
                          min="5"
                          max="13"
                          value={rows}
                          onChange={(e) => setRows(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bus-cols">Distribución de Columnas</Label>
                        <select
                          id="bus-cols"
                          className="w-full h-8 rounded border text-xs px-2 bg-white"
                          value={columns}
                          onChange={(e) => setColumns(Number(e.target.value))}
                        >
                          <option value={4}>4 Asientos (2 Izq + Pasillo + 2 Der)</option>
                          <option value={3}>3 Asientos (2 Izq + Pasillo + 1 Der)</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Capacidad total calculada: <span className="font-bold text-brand-primary">{rows * (columns === 4 ? 4 : 3)} asientos</span>.
                      Se generarán automáticamente registros relacionales en la tabla de asientos.
                    </p>
                  </div>
                </div>

                {/* Previsualización visual del bus */}
                <div className="flex flex-col items-center justify-center border-l lg:pl-8">
                  <span className="text-xs font-medium text-muted-foreground mb-2">Previsualización del Mapa de Asientos</span>
                  <SeatLayoutPreview rows={rows} columns={columns} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary text-white">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Unidad y Generar Asientos
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
          placeholder="Buscar por placa o número de disco..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla de Buses */}
      <div className="rounded-xl border bg-brand-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-light text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Unidad / Disco</th>
                <th className="px-6 py-3">Placa</th>
                <th className="px-6 py-3">Marca / Modelo</th>
                <th className="px-6 py-3 text-center">Capacidad</th>
                <th className="px-6 py-3 text-center">Estado Operativo</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron unidades registradas.
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-primary flex items-center gap-2">
                      <BusIcon className="h-4 w-4 text-muted-foreground" />
                      {bus.unit_number || "Sin disco asignado"}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-xs">{bus.plate}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {bus.brand || "—"} {bus.model || ""} ({bus.year || "S/A"})
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-xs">
                      {bus.total_seats} asientos
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(bus.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        {bus.status !== "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(bus.id, "active")}
                            className="text-xs h-7 text-emerald-600 hover:text-emerald-700"
                          >
                            Activar
                          </Button>
                        )}
                        {bus.status !== "maintenance" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(bus.id, "maintenance")}
                            className="text-xs h-7 text-amber-600 hover:text-amber-700"
                          >
                            Mantenimiento
                          </Button>
                        )}
                        {bus.status !== "inactive" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(bus.id, "inactive")}
                            className="text-xs h-7 text-red-600 hover:text-red-700"
                          >
                            Baja
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
