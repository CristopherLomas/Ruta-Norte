"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusSeat } from "@/types";

export interface SeatWithStatus extends BusSeat {
  status: "free" | "reserved" | "sold";
}

interface SeatMapSelectorProps {
  rows: number;
  columns: number;
  seats: SeatWithStatus[];
  selectedSeatIds: string[];
  maxSeats?: number;
  baseFare: number;
  onSeatToggle: (seat: SeatWithStatus) => void;
  className?: string;
}

export function SeatMapSelector({
  rows = 10,
  columns = 4,
  seats,
  selectedSeatIds,
  maxSeats = 4,
  baseFare,
  onSeatToggle,
  className,
}: SeatMapSelectorProps) {
  const columnLabels = columns === 4 ? ["A", "B", "_", "C", "D"] : ["A", "B", "_", "C"];

  // Indexar asientos físicos por número de asiento (ej: "1A", "2B")
  const seatMap = React.useMemo(() => {
    const map = new Map<string, SeatWithStatus>();
    for (const s of seats) {
      map.set(s.seat_number, s);
    }
    return map;
  }, [seats]);

  const selectedSeatsList = React.useMemo(() => {
    return seats.filter((s) => selectedSeatIds.includes(s.id));
  }, [seats, selectedSeatIds]);

  const totalAmount = selectedSeatsList.length * baseFare;

  return (
    <div className={cn("flex flex-col lg:flex-row gap-6 items-start", className)}>
      {/* 1. Mapa interactivo del autobús */}
      <div className="p-6 bg-brand-light/70 rounded-2xl border border-border shadow-sm w-full max-w-md mx-auto">
        {/* Cabina del Conductor */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              BUS
            </div>
            <div>
              <span className="text-xs font-semibold text-brand-primary block">Frente del Bus</span>
              <span className="text-[10px] text-muted-foreground">Volante / Cabina</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] bg-white font-mono">
            {selectedSeatIds.length} / {maxSeats} seleccionados
          </Badge>
        </div>

        {/* Matriz de asientos */}
        <div className="space-y-2 py-2">
          {Array.from({ length: rows }).map((_, r) => {
            const rowNum = r + 1;

            return (
              <div key={`row-${rowNum}`} className="flex items-center gap-2 justify-center">
                {/* Indicador de fila */}
                <span className="text-xs text-muted-foreground w-5 text-right font-mono font-medium">
                  {rowNum}
                </span>

                {columnLabels.map((col, colIndex) => {
                  if (col === "_") {
                    return (
                      <div
                        key={`aisle-${colIndex}`}
                        className="w-6 h-9 flex items-center justify-center text-[10px] text-muted-foreground/30 font-mono select-none"
                      >
                        ·
                      </div>
                    );
                  }

                  const seatNumber = `${rowNum}${col}`;
                  const seatData = seatMap.get(seatNumber);

                  // Si el asiento no existe en la base de datos
                  if (!seatData) {
                    return <div key={`empty-${seatNumber}`} className="w-9 h-9" />;
                  }

                  const isSelected = selectedSeatIds.includes(seatData.id);
                  const isSold = seatData.status === "sold";
                  const isReserved = seatData.status === "reserved";
                  const isAvailable = seatData.status === "free";
                  const isAccessibility = seatData.seat_type === "accessibility";

                  let seatStyle = "bg-white border-brand-secondary/60 text-brand-secondary hover:border-brand-secondary hover:bg-emerald-50";

                  if (isSold) {
                    seatStyle = "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-70";
                  } else if (isReserved) {
                    seatStyle = "bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed opacity-90";
                  } else if (isSelected) {
                    seatStyle = "bg-brand-primary border-brand-primary text-white shadow-md scale-105";
                  } else if (isAccessibility) {
                    seatStyle = "bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100";
                  }

                  return (
                    <button
                      key={seatData.id}
                      type="button"
                      disabled={isSold || isReserved}
                      onClick={() => onSeatToggle(seatData)}
                      title={
                        isSold
                          ? `Asiento ${seatNumber} (Vendido)`
                          : isReserved
                          ? `Asiento ${seatNumber} (Reservado temporalmente)`
                          : isSelected
                          ? `Asiento ${seatNumber} (Seleccionado)`
                          : isAccessibility
                          ? `Asiento ${seatNumber} (Preferencial/Accesibilidad)`
                          : `Asiento ${seatNumber} (Disponible)`
                      }
                      className={cn(
                        "w-9 h-9 rounded-lg text-xs font-bold flex flex-col items-center justify-center border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/40",
                        seatStyle
                      )}
                    >
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Leyenda de Estados */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-brand-secondary/60 bg-white" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-brand-primary border border-brand-primary" />
            <span className="font-semibold text-brand-primary">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
            <span>Reservado (10m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
            <span>Ocupado / Vendido</span>
          </div>
        </div>
      </div>

      {/* 2. Panel lateral de resumen de compra */}
      <div className="w-full lg:w-80 bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
        <h3 className="font-bold text-brand-primary text-base flex items-center justify-between">
          <span>Resumen de Asientos</span>
          <Badge variant="outline" className="text-xs">
            {selectedSeatsList.length} seleccionado(s)
          </Badge>
        </h3>

        {selectedSeatsList.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs bg-slate-50 rounded-xl border border-dashed p-4">
            Haz clic en los asientos disponibles en verde para seleccionarlos. Puedes reservar hasta {maxSeats} asientos.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {selectedSeatsList.map((s) => (
                <Badge
                  key={s.id}
                  variant="secondary"
                  className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-xs px-2.5 py-1"
                >
                  Asiento {s.seat_number} · ${baseFare.toFixed(2)}
                </Badge>
              ))}
            </div>

            <div className="pt-3 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tarifa por asiento:</span>
                <span>${baseFare.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Cantidad:</span>
                <span>{selectedSeatsList.length}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-brand-primary pt-2 border-t border-border/80">
                <span>Total a Pagar:</span>
                <span className="text-brand-secondary text-base">${totalAmount.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight">
          <strong>Aviso:</strong> Al continuar se aplicará un bloqueo temporal de <strong>10 minutos</strong> para completar el pago.
        </div>
      </div>
    </div>
  );
}
