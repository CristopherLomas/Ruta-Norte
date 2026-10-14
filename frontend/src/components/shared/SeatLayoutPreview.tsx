"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SeatLayoutPreviewProps {
  rows: number;
  columns: number;
  className?: string;
}

export function SeatLayoutPreview({
  rows = 10,
  columns = 4,
  className,
}: SeatLayoutPreviewProps) {
  // Matriz de asientos: para 4 columnas, layout estándar es 2 izquierda - pasillo - 2 derecha: A, B | C, D
  const columnLabels = columns === 4 ? ["A", "B", "_", "C", "D"] : ["A", "B", "_", "C"];

  return (
    <div className={cn("p-4 bg-brand-light rounded-xl border border-border inline-block", className)}>
      <div className="text-center mb-3">
        <Badge variant="outline" className="text-xs bg-white">
          Frente del Bus / Conductor
        </Badge>
        <div className="w-12 h-1 bg-brand-primary/30 mx-auto mt-1 rounded-full" />
      </div>

      <div className="space-y-1.5">
        {Array.from({ length: rows }).map((_, r) => {
          const rowNum = r + 1;
          const isFirstRow = rowNum === 1;

          return (
            <div key={`row-${rowNum}`} className="flex items-center gap-1.5 justify-center">
              <span className="text-[10px] text-muted-foreground w-4 text-right font-mono">
                {rowNum}
              </span>

              {columnLabels.map((col, colIndex) => {
                if (col === "_") {
                  return (
                    <div
                      key={`aisle-${colIndex}`}
                      className="w-4 h-7 flex items-center justify-center text-[9px] text-muted-foreground/40 font-mono"
                    >
                      |
                    </div>
                  );
                }

                const seatCode = `${rowNum}${col}`;
                const isAccessibility = isFirstRow && (col === "A" || col === "B");

                return (
                  <div
                    key={seatCode}
                    className={cn(
                      "w-7 h-7 rounded text-[10px] font-semibold flex items-center justify-center border shadow-xs transition-colors",
                      isAccessibility
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-white border-border text-brand-primary"
                    )}
                    title={isAccessibility ? `Asiento Preferencial ${seatCode}` : `Asiento Estándar ${seatCode}`}
                  >
                    {col}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border" />
          <span>Estándar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span>Preferencial</span>
        </div>
        <div className="font-semibold text-brand-primary">
          Total: {rows * (columns === 4 ? 4 : 3)} asientos
        </div>
      </div>
    </div>
  );
}
