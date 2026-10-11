import Link from "next/link";
import { Bus, ShieldCheck, Database, Compass, QrCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header institucional */}
      <header className="border-b bg-brand-surface sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-primary">Ruta Norte</span>
              <span className="block text-xs text-muted-foreground">Transporte Interparroquial del Norte</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success" className="hidden sm:inline-flex gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Fase 1: Infraestructura Activa
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-light to-white py-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            Norte de Ecuador · Ibarra, Otavalo, Cotacachi, San Antonio, Zuleta
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-primary sm:text-5xl">
            Gestión Integral de Transporte y Venta de Boletos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Plataforma web con alta seguridad transaccional, control de concurrencia en asientos,
            emisión de boletos con código QR y validación de embarque.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2">
              <Compass className="h-4 w-4" />
              Explorar Rutas
            </Button>
            <Button size="lg" variant="secondary" className="bg-brand-secondary hover:bg-brand-secondary/90 text-white gap-2">
              <QrCode className="h-4 w-4" />
              Validar Boleto
            </Button>
          </div>
        </div>
      </section>

      {/* Grid de Estado de Módulos (Fase 1) */}
      <section className="container mx-auto px-4 py-12 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-brand-primary">Estado de la Arquitectura — Fase 1</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Componentes de infraestructura técnica y esquema de base de datos verificados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next.js & TypeScript</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-primary">App Router</div>
              <p className="text-xs text-muted-foreground mt-1">
                TypeScript estricto, Tailwind CSS y componentes shadcn/ui integrados.
              </p>
              <Badge variant="outline" className="mt-3 text-emerald-600 border-emerald-200">
                100% Configurado
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">PostgreSQL & RLS</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-secondary">18 Tablas</div>
              <p className="text-xs text-muted-foreground mt-1">
                Políticas RLS en todas las tablas, funciones transaccionales y triggers.
              </p>
              <Badge variant="outline" className="mt-3 text-emerald-600 border-emerald-200">
                Migraciones Listas
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Seguridad & Testing</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-primary">Vitest & Zod</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pruebas de concurrencia, anti-doble venta, expiración y validación de QR.
              </p>
              <Badge variant="outline" className="mt-3 text-emerald-600 border-emerald-200">
                Tests Listos
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-brand-light py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© 2026 Ruta Norte — Proyecto Académico de Ingeniería en Computación.</p>
          <p className="mt-1">
            Los pagos procesados en esta plataforma son estrictamente simulados para fines demostrativos.
          </p>
        </div>
      </footer>
    </main>
  );
}
