import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getTicketByIdAction } from "@/features/tickets/actions";
import { TicketCard } from "@/components/shared/TicketCard";

interface TicketPageProps {
  params: {
    id: string;
  };
}

export default async function PublicTicketPage({ params }: TicketPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/boletos/${params.id}`);
  }

  const res = await getTicketByIdAction(params.id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:bg-white print:py-0">
      <div className="max-w-md mx-auto mb-4 print:hidden flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground">
          <Link href="/passenger/boletos">
            <ArrowLeft className="h-4 w-4" />
            Mis Boletos
          </Link>
        </Button>
        <span className="text-xs font-semibold text-brand-primary">Boleto Digital Oficial</span>
      </div>

      <TicketCard ticket={res.data} showPrintButton={true} />
    </div>
  );
}
