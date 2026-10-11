"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, User, Building2, Car, Route, Users, Calendar, AlertTriangle, Gauge } from "lucide-react";
import { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  userEmail: string;
  userRole: UserRole;
  moduleTitle: string;
}

const ROLE_LABELS: Record<UserRole, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
  admin: { label: "Administrador", variant: "destructive" },
  operator: { label: "Operador de Flota", variant: "default" },
  seller: { label: "Vendedor / Taquilla", variant: "secondary" },
  inspector: { label: "Inspector de Embarque", variant: "success" },
  passenger: { label: "Pasajero", variant: "outline" },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Inicio", icon: Gauge },
  { href: "/admin/cooperativas", label: "Cooperativas", icon: Building2 },
  { href: "/admin/unidades", label: "Unidades / Buses", icon: Car },
  { href: "/admin/rutas", label: "Rutas y Paradas", icon: Route },
  { href: "/admin/conductores", label: "Conductores", icon: Users },
];

const OPERATOR_NAV = [
  { href: "/operator", label: "Panel", icon: Gauge },
  { href: "/operator/viajes", label: "Programar Viajes", icon: Calendar },
  { href: "/operator/despacho", label: "Despacho en Vivo", icon: Bus },
  { href: "/operator/incidencias", label: "Incidencias", icon: AlertTriangle },
];

const PASSENGER_NAV = [
  { href: "/passenger", label: "Inicio", icon: Gauge },
  { href: "/passenger/boletos", label: "Mis Boletos", icon: Bus },
];

export function DashboardHeader({
  userEmail,
  userRole,
  moduleTitle,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const roleInfo = ROLE_LABELS[userRole] || { label: userRole, variant: "outline" };

  const navLinks =
    userRole === "admin"
      ? ADMIN_NAV
      : userRole === "operator"
      ? OPERATOR_NAV
      : userRole === "passenger"
      ? PASSENGER_NAV
      : [];

  return (
    <header className="border-b bg-brand-surface sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Bus className="h-5 w-5" />
            </div>
            <span className="font-bold text-brand-primary text-lg tracking-tight hidden sm:inline">
              Ruta Norte
            </span>
          </Link>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-foreground">{moduleTitle}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-right hidden md:flex">
            <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand-primary border">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left text-xs">
              <p className="font-medium text-foreground truncate max-w-[150px]">{userEmail}</p>
              <Badge variant={roleInfo.variant} className="text-[10px] px-1.5 py-0 h-4">
                {roleInfo.label}
              </Badge>
            </div>
          </div>

          <LogoutButton variant="outline" />
        </div>
      </div>

      {navLinks.length > 0 && (
        <div className="bg-brand-light border-t border-border px-4 overflow-x-auto">
          <nav className="container mx-auto flex space-x-1 sm:space-x-4 py-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-muted-foreground hover:bg-white hover:text-brand-primary"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
