import Link from "next/link";
import { Bus, ShieldCheck, Database, QrCode, Ticket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStopsAction } from "@/features/routes/actions";
import { TripSearchClient } from "@/features/trips/components/TripSearchClient";

export default async function HomePage() {
  const stopsRes = await getStopsAction();
  const stops = stopsRes.success && stopsRes.data ? stopsRes.data : [];

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header institucional */}
      <header className="border-b bg-brand-surface sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-primary">Ruta Norte</span>
              <span className="block text-xs text-muted-foreground">Transporte Interparroquial del Norte</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/passenger/boletos" className="gap-1.5 text-xs">
                <Ticket className="h-3.5 w-3.5" />
                Mis Boletos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-light via-white to-slate-50/50 pt-12 pb-8 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-3 bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30">
            Norte de Ecuador · Tulcán, San Gabriel, El Ángel, Mira, Huaca, Bolívar
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-primary">
            Viaja Seguro por las Parroquias del Norte
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Consulta salidas en tiempo real, elige tu asiento en el mapa interactivo y obtén tu boleto digital con código QR seguro al instante.
          </p>
        </div>
      </section>

      {/* Buscador de Viajes */}
      <section className="container mx-auto px-4 -mt-6 pb-16 flex-1">
        <TripSearchClient stops={stops} />
      </section>

      {/* Footer informativo */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Sistema Ruta Norte · Alta concurrencia y seguridad transaccional</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">Acceso Operativo</Link>
            <span>·</span>
            <span>Ecuador 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
