import Link from "next/link";
import { Ticket as TicketIcon, Calendar, ArrowRight, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyTicketsAction } from "@/features/tickets/actions";

export default async function PassengerTicketsPage() {
  const res = await getMyTicketsAction();
  const tickets = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-primary">Mis Boletos Emitidos</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Consulta y descarga tus boletos digitales con código QR para el abordaje en andén.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs gap-1.5 shadow-sm">
          <Link href="/">
            <Bus className="h-4 w-4" />
            Comprar Nuevo Boleto
          </Link>
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-10 text-center bg-slate-50 border-dashed rounded-2xl">
          <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Aún no tienes boletos comprados</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Explora las rutas activas de Imbabura y compra tus pasajes interparroquiales en línea.
          </p>
          <Button asChild size="sm" className="mt-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl">
            <Link href="/">Buscar Viajes</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const departureHour = new Date(ticket.departure_time).toLocaleTimeString("es-EC", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const departureDate = new Date(ticket.departure_time).toLocaleDateString("es-EC", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            const isUsed = ticket.status === "used";

            return (
              <Card
                key={ticket.id}
                className="bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="bg-brand-primary text-white p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-brand-light/80 font-mono block">
                        {ticket.cooperative_name}
                      </span>
                      <h4 className="font-bold text-sm leading-tight">
                        {ticket.origin_name} → {ticket.destination_name}
                      </h4>
                    </div>
                    <Badge
                      variant={isUsed ? "secondary" : "success"}
                      className="text-[10px] font-mono"
                    >
                      {isUsed ? "UTILIZADO" : "VÁLIDO"}
                    </Badge>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-dashed">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Fecha & Hora</span>
                        <span className="font-bold">{departureDate} · {departureHour}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block text-[10px]">Asiento</span>
                        <span className="font-black text-brand-primary text-base font-mono">
                          {ticket.seat_number}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>Código: <strong className="font-mono text-slate-800">{ticket.qr_code}</strong></span>
                      <span>Tarifa: <strong className="text-emerald-700">${ticket.fare_price.toFixed(2)}</strong></span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-3 bg-slate-50 border-t flex justify-end">
                  <Button variant="outline" size="sm" asChild className="w-full text-xs gap-1.5 font-bold rounded-xl">
                    <Link href={`/passenger/boletos/${ticket.id}`}>
                      <span>Ver Boleto y QR</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
