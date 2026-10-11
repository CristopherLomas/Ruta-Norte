import Link from "next/link";
import { Bus } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow">
            <Bus className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-primary">
            Ruta Norte
          </span>
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">
          Sistema de Transporte Interparroquial del Norte
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-brand-surface py-8 px-6 shadow-md rounded-xl sm:px-10 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
