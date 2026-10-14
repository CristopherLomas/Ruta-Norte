import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getTicketByIdAction } from "@/features/tickets/actions";
import { TicketCard } from "@/components/shared/TicketCard";

interface PassengerTicketViewPageProps {
  params: {
    id: string;
  };
}

export default async function PassengerTicketViewPage({ params }: PassengerTicketViewPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/passenger/boletos/${params.id}`);
  }

  const res = await getTicketByIdAction(params.id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link href="/passenger/boletos">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis boletos
          </Link>
        </Button>
      </div>

      <TicketCard ticket={res.data} showPrintButton={true} />
    </div>
  );
}
