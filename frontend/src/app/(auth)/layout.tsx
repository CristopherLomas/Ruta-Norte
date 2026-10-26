import Link from "next/link";
import { Bus } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Bus className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Ruta Norte
          </span>
        </Link>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Carchi & Imbabura · Kiosco de Transporte
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
}
