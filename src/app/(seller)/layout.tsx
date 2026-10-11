import { requireRole } from "@/lib/auth/guards";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireRole(["admin", "seller"]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <DashboardHeader
        userEmail={user.email || "vendedor@rutanorte.ec"}
        userRole={role}
        moduleTitle="Taquilla y Ventas"
      />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}
