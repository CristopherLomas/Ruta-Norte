"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { InteractiveMapViewerProps } from "./InteractiveMapViewer";

const DynamicMap = dynamic(() => import("./InteractiveMapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 border text-muted-foreground animate-pulse">
      <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
      <span className="text-xs font-medium">Cargando visor cartográfico interactivo...</span>
    </div>
  ),
});

export function InteractiveMap(props: InteractiveMapViewerProps) {
  return <DynamicMap {...props} />;
}
