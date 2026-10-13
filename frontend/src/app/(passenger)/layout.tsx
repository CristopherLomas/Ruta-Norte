import { requireAuth } from "@/lib/auth/guards";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default async function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireAuth();

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <DashboardHeader
        userEmail={user.email || "pasajero@rutanorte.ec"}
        userRole={role}
        moduleTitle="Portal del Pasajero"
      />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}
