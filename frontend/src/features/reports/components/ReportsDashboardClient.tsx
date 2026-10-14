"use client";

import * as React from "react";
import {
  DollarSign,
  Ticket,
  Percent,
  CheckCircle2,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardReportMetrics } from "@/features/reports/actions";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportsDashboardClientProps {
  initialMetrics: DashboardReportMetrics;
}

export function ReportsDashboardClient({ initialMetrics }: ReportsDashboardClientProps) {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "all">("7d");
  const [selectedCoop, setSelectedCoop] = React.useState<string>("all");

  const { kpis, routeDemand, cooperativeRevenue, cooperativesList, salesChannels } = initialMetrics;

  return (
    <div className="space-y-8">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Reportes Operativos y Analítica Ejecutiva
          </h1>
          <p className="text-sm text-muted-foreground">
            Métricas de ingresos simulados, demanda interparroquial y tasas de ocupación de flota.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Rango de Fechas */}
          <div className="flex items-center bg-white border rounded-xl p-1 shadow-xs text-xs">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === "7d" ? "bg-brand-primary text-white" : "text-muted-foreground hover:text-brand-primary"
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === "30d" ? "bg-brand-primary text-white" : "text-muted-foreground hover:text-brand-primary"
              }`}
            >
              Mes Actual
            </button>
          </div>

          {/* Selector de Cooperativa */}
          <div className="flex items-center gap-1.5 bg-white border rounded-xl px-3 py-1.5 shadow-xs text-xs">
            <Building2 className="h-3.5 w-3.5 text-brand-secondary" />
            <select
              value={selectedCoop}
              onChange={(e) => setSelectedCoop(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-medium focus:outline-none"
            >
              <option value="all">Todas las Cooperativas</option>
              {cooperativesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos Totales */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ingresos Totales (Simulados)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-primary">
              ${kpis.totalRevenue.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              +14.2% respecto al periodo anterior
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Boletos Emitidos */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Boletos Emitidos
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-primary">
              {kpis.totalTickets.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Validación con token opaco SHA-256
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Tasa de Ocupación */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ocupación Promedio
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-secondary">
              {kpis.averageOccupancyRate}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sobre capacidad total de flota activa
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Viajes Completados */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Viajes Completados
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {kpis.completedTrips}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Despacho sin incidencias críticas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Gráficos con Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Demanda por Ruta Interparroquial (BarChart) */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base text-brand-primary">Demanda por Ruta</CardTitle>
                <CardDescription className="text-xs">
                  Cantidad de boletos vendidos por tramo interparroquial
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeDemand} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="routeName" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                    formatter={(val) => [`${val} boletos`, "Boletos Vendidos"]}
                  />
                  <Bar dataKey="ticketsSold" fill="#173B57" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Ingresos Acumulados por Cooperativa (AreaChart) */}
        <Card className="bg-white border rounded-2xl shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-secondary" />
              <div>
                <CardTitle className="text-base text-brand-primary">Ingresos Semanales por Cooperativa</CardTitle>
                <CardDescription className="text-xs">
                  Recaudación acumulada ($ USD) por día de la semana
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cooperativeRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                    formatter={(val) => [`$${val} USD`, "Ingresos"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="Transportes Ibarra" stackId="1" stroke="#173B57" fill="#173B57" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Flota Imbabura" stackId="1" stroke="#20A878" fill="#20A878" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Coop. Otavalo" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 3: Canales de Venta (PieChart / Donut) */}
        <Card className="bg-white border rounded-2xl shadow-xs lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base text-brand-primary">Distribución de Canales de Venta</CardTitle>
                <CardDescription className="text-xs">
                  Porcentaje de boletos emitidos vía Web Pasajero vs. Taquilla/Ventanilla
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesChannels}
                      dataKey="count"
                      nameKey="channel"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {salesChannels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                      formatter={(val, name, item) => [`${val} boletos (${item.payload.percentage}%)`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 max-w-sm w-full">
                {salesChannels.map((ch) => (
                  <div key={ch.channel} className="p-4 rounded-xl border bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ch.fill }} />
                      <div>
                        <strong className="text-xs text-slate-800 block">{ch.channel}</strong>
                        <span className="text-[11px] text-muted-foreground">{ch.count} boletos emitidos</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono font-bold text-sm bg-white">
                      {ch.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
