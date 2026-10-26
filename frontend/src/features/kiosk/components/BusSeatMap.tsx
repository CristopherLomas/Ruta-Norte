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
  // 10 Columnas de 4 asientos = 40 asientos en horizontal
  // Fila Superior (Ventana Izq): Asientos 1, 5, 9, 13, 17, 21, 25, 29, 33, 37
  // Fila Pasillo Arriba: Asientos 2, 6, 10, 14, 18, 22, 26, 30, 34, 38
  // --- PASILLO CENTRAL HORIZONTAL ---
  // Fila Pasillo Abajo: Asientos 3, 7, 11, 15, 19, 23, 27, 31, 35, 39
  // Fila Inferior (Ventana Der): Asientos 4, 8, 12, 16, 20, 24, 28, 32, 36, 40
  const columns = Array.from({ length: 10 }, (_, c) => {
    const base = c * 4;
    return {
      columnNumber: c + 1,
      seatTopWindow: base + 1,
      seatTopAisle: base + 2,
      seatBottomAisle: base + 3,
      seatBottomWindow: base + 4,
    };
  });

  const isOccupied = (seatNum: number) => occupiedSeats.includes(seatNum);
  const isSelected = (seatNum: number) => selectedSeats.includes(seatNum);

  const renderSeatButton = (seatNum: number) => {
    const occupied = isOccupied(seatNum);
    const selected = isSelected(seatNum);

    return (
      <button
        key={seatNum}
        type="button"
        disabled={occupied}
        onClick={() => onToggleSeat(seatNum)}
        title={`Asiento ${seatNum}${occupied ? " (Ocupado)" : selected ? " (Elegido)" : " (Libre)"}`}
        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all duration-150 shadow-xs cursor-pointer select-none ${
          occupied
            ? "bg-slate-200 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-600"
            : selected
            ? "bg-blue-600 text-white ring-2 sm:ring-3 ring-blue-300 dark:ring-blue-500 scale-105 shadow-md shadow-blue-500/30"
            : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-xs shadow-emerald-500/20 active:scale-95"
        }`}
      >
        <span>{seatNum}</span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Barra de Título y Leyenda de Asientos */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-base">🚌</span>
          <span className="font-black text-slate-800 dark:text-slate-200 tracking-tight">
            Plano Horizontal del Bus (40 Asientos)
          </span>
          <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
            · Elige hasta {maxSeats} asientos
          </span>
        </div>

        {/* Leyenda de Estados */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500 shadow-xs"></div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Libre</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-blue-600 shadow-xs"></div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Elegido</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-600 shadow-xs"></div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Ocupado</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DEL BUS EN HORIZONTAL (CERO SCROLL VERTICAL) */}
      <div className="w-full overflow-x-auto pb-1 flex justify-center">
        <div className="inline-flex items-stretch bg-slate-100/95 dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-slate-300 dark:border-slate-700 p-2 sm:p-3 shadow-xl transition-colors min-w-[560px] sm:min-w-[620px]">
          
          {/* 1. CABINA DEL CHOFER (FRENTE IZQUIERDA) */}
          <div className="w-16 sm:w-20 shrink-0 bg-slate-800 dark:bg-slate-950 text-white rounded-xl sm:rounded-2xl p-2 flex flex-col justify-between items-center border-2 border-slate-700 dark:border-slate-800 mr-2 sm:mr-3 shadow-inner">
            <div className="text-center">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">
                DELANTERA
              </span>
              <span className="text-base sm:text-lg">🪟</span>
            </div>

            <div className="flex flex-col items-center bg-slate-700/80 dark:bg-slate-900 px-1.5 py-1 rounded-xl border border-slate-600 dark:border-slate-700">
              <span className="text-sm sm:text-base">💺</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-200">Volante</span>
            </div>

            <div className="text-center">
              <span className="text-[8px] font-bold text-slate-400 block">PUERTA</span>
              <span className="text-[9px] text-emerald-400 font-extrabold">SUBIDA ➔</span>
            </div>
          </div>

          {/* 2. MATRIZ DE ASIENTOS HORIZONTAL (10 COLUMNAS) */}
          <div className="flex-1 flex flex-col justify-between py-0.5">
            {/* Indicador Superior: Ventana Izquierda */}
            <div className="flex items-center justify-between px-1 mb-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>🪟 Lado Ventana Izquierda</span>
              <span className="text-[8px] text-slate-400">Filas 1 a 10</span>
            </div>

            {/* Fila 1: Asientos de Ventana Superior */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {columns.map((col) => renderSeatButton(col.seatTopWindow))}
            </div>

            {/* Fila 2: Asientos de Pasillo Superior */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
              {columns.map((col) => renderSeatButton(col.seatTopAisle))}
            </div>

            {/* PASILLO CENTRAL HORIZONTAL (PASO PEATONAL) */}
            <div className="my-1.5 sm:my-2 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wider">
              <span>🚶 PASILLO</span>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 flex-1 max-w-[85%] text-center opacity-70">
                {columns.map((c) => (
                  <span key={c.columnNumber}>F{c.columnNumber}</span>
                ))}
              </div>
              <span>➔ SALIDA</span>
            </div>

            {/* Fila 3: Asientos de Pasillo Inferior */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
              {columns.map((col) => renderSeatButton(col.seatBottomAisle))}
            </div>

            {/* Fila 4: Asientos de Ventana Inferior */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {columns.map((col) => renderSeatButton(col.seatBottomWindow))}
            </div>

            {/* Indicador Inferior: Ventana Derecha */}
            <div className="flex items-center justify-between px-1 mt-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>🪟 Lado Ventana Derecha</span>
              <span className="text-[8px] text-slate-400">Corredor Norte</span>
            </div>
          </div>

          {/* 3. PARTE TRASERA DEL AUTOBÚS (COLA DERECHA) */}
          <div className="w-8 sm:w-10 shrink-0 bg-slate-200/90 dark:bg-slate-800/90 rounded-xl sm:rounded-2xl ml-2 sm:ml-3 flex flex-col justify-center items-center text-center p-1 border border-slate-300 dark:border-slate-700">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
              PARTE TRASERA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusSeatMap;
