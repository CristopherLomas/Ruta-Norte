import Link from "next/link";
import { Bus } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <Bus className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Ruta Norte
          </span>
        </Link>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Transporte Interparroquial · Carchi e Imbabura
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl sm:px-8 border border-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
