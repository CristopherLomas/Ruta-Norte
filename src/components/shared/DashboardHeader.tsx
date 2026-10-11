import Link from "next/link";
import { Bus, User } from "lucide-react";
import { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

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

export function DashboardHeader({
  userEmail,
  userRole,
  moduleTitle,
}: DashboardHeaderProps) {
  const roleInfo = ROLE_LABELS[userRole] || { label: userRole, variant: "outline" };

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
    </header>
  );
}
