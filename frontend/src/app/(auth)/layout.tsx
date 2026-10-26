import Link from "next/link";
import { Bus } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bus className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                RUTA NORTE
              </span>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                2.0
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Carchi & Imbabura · Transporte Interparroquial
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-3xl sm:px-8 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
}
