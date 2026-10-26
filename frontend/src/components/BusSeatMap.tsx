"use client";

import React from "react";
import { Check, X, ShieldAlert } from "lucide-react";

export interface BusSeatMapProps {
  occupiedSeats: number[];
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  maxSeats?: number;
}

export function BusSeatMap({
  occupiedSeats = [],
  selectedSeats = [],
  onToggleSeat,
  maxSeats = 6,
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
    <div className="w-full max-w-xl mx-auto bg-slate-100/90 rounded-3xl p-6 sm:p-8 border-4 border-slate-300 shadow-2xl">
      {/* Frente del Autobús / Cabina del Conductor */}
      <div className="bg-slate-800 text-white rounded-2xl p-4 mb-8 shadow-inner flex items-center justify-between border-2 border-slate-700">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🚌</span>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              PARTE DELANTERA
            </span>
            <span className="text-lg font-black text-amber-400">
              CABINA DEL CHOFER
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-600">
          <span className="text-xl">💺</span>
          <span className="text-sm font-bold text-slate-200">Volante</span>
        </div>
      </div>

      {/* Leyenda de Colores */}
      <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-3 mb-6 border border-slate-200 shadow-sm text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-emerald-500 shadow-sm"></div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">Libre</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-blue-600 shadow-sm"></div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">Elegido</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-slate-300 shadow-sm"></div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">Ocupado</span>
        </div>
      </div>

      {/* Matriz de Asientos (10 filas) */}
      <div className="space-y-3.5">
        {rows.map((row) => (
          <div
            key={row.rowNumber}
            className="flex items-center justify-between bg-white/70 hover:bg-white p-2 rounded-2xl transition-colors border border-slate-200/60"
          >
            {/* Lado Izquierdo (2 asientos) */}
            <div className="flex space-x-2.5">
              {row.leftSeats.map((seatNum) => {
                const occupied = isOccupied(seatNum);
                const selected = isSelected(seatNum);

                return (
                  <button
                    key={seatNum}
                    type="button"
                    disabled={occupied}
                    onClick={() => onToggleSeat(seatNum)}
                    className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl flex flex-col items-center justify-center transition-all duration-200 shadow-md ${
                      occupied
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : selected
                        ? "bg-blue-600 text-white ring-4 ring-blue-300 scale-105 shadow-blue-500/40"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-103 shadow-emerald-500/30"
                    }`}
                  >
                    <span>{seatNum}</span>
                    <span className="text-[10px] font-semibold opacity-80 uppercase tracking-tighter">
                      {occupied ? "Ocupado" : selected ? "Elegido" : "Libre"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pasillo Central */}
            <div className="flex flex-col items-center justify-center px-2 py-1 text-slate-400 font-bold text-xs select-none">
              <span className="text-sm">🚶</span>
              <span className="text-[9px] tracking-widest text-slate-400">FILA {row.rowNumber}</span>
            </div>

            {/* Lado Derecho (2 asientos) */}
            <div className="flex space-x-2.5">
              {row.rightSeats.map((seatNum) => {
                const occupied = isOccupied(seatNum);
                const selected = isSelected(seatNum);

                return (
                  <button
                    key={seatNum}
                    type="button"
                    disabled={occupied}
                    onClick={() => onToggleSeat(seatNum)}
                    className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl flex flex-col items-center justify-center transition-all duration-200 shadow-md ${
                      occupied
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : selected
                        ? "bg-blue-600 text-white ring-4 ring-blue-300 scale-105 shadow-blue-500/40"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-103 shadow-emerald-500/30"
                    }`}
                  >
                    <span>{seatNum}</span>
                    <span className="text-[10px] font-semibold opacity-80 uppercase tracking-tighter">
                      {occupied ? "Ocupado" : selected ? "Elegido" : "Libre"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Parte Trasera del Bus */}
      <div className="mt-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-200/80 py-2 rounded-xl">
        Parte Trasera del Autobús
      </div>
    </div>
  );
}

export default BusSeatMap;
