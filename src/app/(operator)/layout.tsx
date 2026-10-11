import { requireRole } from "@/lib/auth/guards";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireRole(["admin", "operator"]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <DashboardHeader
        userEmail={user.email || "operador@rutanorte.ec"}
        userRole={role}
        moduleTitle="Operaciones y Flota"
      />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}
