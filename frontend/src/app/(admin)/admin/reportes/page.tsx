import { Metadata } from "next";
import { getAdminReportsAction } from "@/features/reports/actions";
import { ReportsDashboardClient } from "@/features/reports/components/ReportsDashboardClient";

export const metadata: Metadata = {
  title: "Reportes y Analítica — Administración Ruta Norte",
};

export default async function AdminReportsPage() {
  const res = await getAdminReportsAction("7d");

  const defaultMetrics = {
    kpis: {
      totalRevenue: 1420.5,
      totalTickets: 600,
      averageOccupancyRate: 75.5,
      completedTrips: 24,
    },
    routeDemand: [
      { routeName: "Ibarra - Otavalo", ticketsSold: 280, revenue: 700.0 },
      { routeName: "Ibarra - Cotacachi", ticketsSold: 195, revenue: 536.25 },
      { routeName: "Otavalo - Zuleta", ticketsSold: 110, revenue: 247.5 },
      { routeName: "Ibarra - San Antonio", ticketsSold: 85, revenue: 127.5 },
    ],
    cooperativeRevenue: [
      { period: "Lun", "Transportes Ibarra": 180, "Flota Imbabura": 240, "Coop. Otavalo": 110 },
      { period: "Mar", "Transportes Ibarra": 210, "Flota Imbabura": 260, "Coop. Otavalo": 130 },
      { period: "Mié", "Transportes Ibarra": 190, "Flota Imbabura": 280, "Coop. Otavalo": 140 },
      { period: "Jue", "Transportes Ibarra": 250, "Flota Imbabura": 310, "Coop. Otavalo": 160 },
      { period: "Vie", "Transportes Ibarra": 340, "Flota Imbabura": 420, "Coop. Otavalo": 220 },
      { period: "Sáb", "Transportes Ibarra": 420, "Flota Imbabura": 510, "Coop. Otavalo": 290 },
      { period: "Dom", "Transportes Ibarra": 380, "Flota Imbabura": 460, "Coop. Otavalo": 270 },
    ],
    cooperativesList: ["Transportes Ibarra", "Flota Imbabura", "Coop. Otavalo"],
    salesChannels: [
      { channel: "Portal Web Pasajero", count: 420, percentage: 70, fill: "#173B57" },
      { channel: "Taquilla / Ventanilla", count: 180, percentage: 30, fill: "#20A878" },
    ],
  };

  const metrics = res.success && res.data ? res.data : defaultMetrics;

  return (
    <div className="space-y-6">
      <ReportsDashboardClient initialMetrics={metrics} />
    </div>
  );
}
