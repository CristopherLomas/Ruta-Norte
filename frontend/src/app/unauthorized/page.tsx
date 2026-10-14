import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-brand-surface max-w-md w-full p-8 rounded-xl shadow-md border border-border text-center space-y-4">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold text-brand-primary">Acceso No Autorizado</h1>

        <p className="text-sm text-muted-foreground">
          Su cuenta no cuenta con los permisos necesarios para acceder a este módulo. Si considera que esto es un error, por favor contacte al administrador del sistema.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Regresar al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
