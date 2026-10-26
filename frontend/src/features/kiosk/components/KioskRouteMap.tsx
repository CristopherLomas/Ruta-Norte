"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2, Compass } from "lucide-react";
import type { KioskRouteMapViewerProps } from "./KioskRouteMapViewer";

const DynamicKioskRouteMap = dynamic(
  () => import("./KioskRouteMapViewer").then((mod) => mod.KioskRouteMapViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[220px] bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 text-slate-500 animate-pulse">
        <Compass className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Cargando cartografía vial OpenStreetMap...
        </span>
      </div>
    ),
  }
);

export function KioskRouteMap(props: KioskRouteMapViewerProps) {
  return <DynamicKioskRouteMap {...props} />;
}

export default KioskRouteMap;
