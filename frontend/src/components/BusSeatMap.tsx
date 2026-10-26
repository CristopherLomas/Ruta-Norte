"use client";

import React from "react";
import { Check, X, ShieldAlert } from "lucide-react";

export interface BusSeatMapProps {
  occupiedSeats: number[];
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  maxSeats?: number;
  compact?: boolean;
}

export function BusSeatMap({
  occupiedSeats = [],
  selectedSeats = [],
  onToggleSeat,
  maxSeats = 6,
  compact = false,
}: BusSeatMapProps) {
  // 10 filas de 4 asientos = 40 asientos
  // Fila 1: [1, 2, 3, 4]
  // Fila 2: [5, 6, 7, 8] ...
  const rows = Array.from({ length: 10 }, (_, r) => {
    const base = r * 4;
    return {
      rowNumber: r + 1,
      leftSeats: [base + 1, base + 2],
      rightSeats: [base + 3, base + 4],
    };
  });

  const isOccupied = (seatNum: number) => occupiedSeats.includes(seatNum);
  const isSelected = (seatNum: number) => selectedSeats.includes(seatNum);

  return (
    <div
      className={`w-full max-w-lg mx-auto bg-slate-100/95 rounded-3xl border-3 border-slate-300 shadow-xl ${
        compact ? "p-3 sm:p-4 max-h-[calc(100vh-210px)] overflow-y-auto" : "p-6 sm:p-8"
      }`}
    >
      {/* Frente del Autobús / Cabina del Conductor */}
      <div
        className={`bg-slate-800 text-white rounded-2xl shadow-inner flex items-center justify-between border-2 border-slate-700 ${
          compact ? "p-2.5 mb-2.5" : "p-4 mb-6"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <span className={compact ? "text-2xl" : "text-3xl"}>🚌</span>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              PARTE DELANTERA
            </span>
            <span className={`font-black text-amber-400 ${compact ? "text-sm" : "text-lg"}`}>
              CABINA DEL CHOFER
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-700/80 px-2.5 py-1 rounded-xl border border-slate-600">
          <span className="text-base">💺</span>
          <span className="text-xs font-bold text-slate-200">Volante</span>
        </div>
      </div>

      {/* Leyenda de Colores */}
      <div
        className={`grid grid-cols-3 gap-2 bg-white rounded-xl border border-slate-200 shadow-xs text-center ${
          compact ? "p-1.5 mb-2.5 text-xs" : "p-3 mb-4 text-sm"
        }`}
      >
        <div className="flex items-center justify-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-xs"></div>
          <span className="font-bold text-slate-700 text-xs">Libre</span>
        </div>
        <div className="flex items-center justify-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-600 shadow-xs"></div>
          <span className="font-bold text-slate-700 text-xs">Elegido</span>
        </div>
        <div className="flex items-center justify-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-300 shadow-xs"></div>
          <span className="font-bold text-slate-700 text-xs">Ocupado</span>
        </div>
      </div>

      {/* Matriz de Asientos (10 filas) */}
      <div className={compact ? "space-y-1.5" : "space-y-3"}>
        {rows.map((row) => (
          <div
            key={row.rowNumber}
            className={`flex items-center justify-between bg-white/80 hover:bg-white rounded-xl transition-colors border border-slate-200/70 ${
              compact ? "p-1" : "p-2"
            }`}
          >
            {/* Lado Izquierdo (2 asientos) */}
            <div className="flex space-x-1.5">
              {row.leftSeats.map((seatNum) => {
                const occupied = isOccupied(seatNum);
                const selected = isSelected(seatNum);

                return (
                  <button
                    key={seatNum}
                    type="button"
                    disabled={occupied}
                    onClick={() => onToggleSeat(seatNum)}
                    className={`rounded-xl font-black flex flex-col items-center justify-center transition-all duration-150 shadow-xs ${
                      compact
                        ? "w-10 h-10 text-sm"
                        : "w-13 h-13 sm:w-15 sm:h-15 text-lg"
                    } ${
                      occupied
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : selected
                        ? "bg-blue-600 text-white ring-3 ring-blue-300 scale-105 shadow-blue-500/30"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-102 shadow-emerald-500/20"
                    }`}
                  >
                    <span>{seatNum}</span>
                    {!compact && (
                      <span className="text-[9px] font-semibold opacity-80 uppercase tracking-tighter">
                        {occupied ? "Ocupado" : selected ? "Elegido" : "Libre"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pasillo Central */}
            <div className="flex flex-col items-center justify-center px-1 text-slate-400 font-bold select-none">
              <span className="text-xs">🚶</span>
              <span className="text-[8px] tracking-wider text-slate-400">F{row.rowNumber}</span>
            </div>

            {/* Lado Derecho (2 asientos) */}
            <div className="flex space-x-1.5">
              {row.rightSeats.map((seatNum) => {
                const occupied = isOccupied(seatNum);
                const selected = isSelected(seatNum);

                return (
                  <button
                    key={seatNum}
                    type="button"
                    disabled={occupied}
                    onClick={() => onToggleSeat(seatNum)}
                    className={`rounded-xl font-black flex flex-col items-center justify-center transition-all duration-150 shadow-xs ${
                      compact
                        ? "w-10 h-10 text-sm"
                        : "w-13 h-13 sm:w-15 sm:h-15 text-lg"
                    } ${
                      occupied
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : selected
                        ? "bg-blue-600 text-white ring-3 ring-blue-300 scale-105 shadow-blue-500/30"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-102 shadow-emerald-500/20"
                    }`}
                  >
                    <span>{seatNum}</span>
                    {!compact && (
                      <span className="text-[9px] font-semibold opacity-80 uppercase tracking-tighter">
                        {occupied ? "Ocupado" : selected ? "Elegido" : "Libre"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Parte Trasera del Bus */}
      <div className="mt-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/70 py-1.5 rounded-lg">
        Parte Trasera del Autobús
      </div>
    </div>
  );
}

export default BusSeatMap;
