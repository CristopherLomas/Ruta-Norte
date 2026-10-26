"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, RefreshCw, Printer, RotateCcw } from "lucide-react";
import { TicketPurchased } from "../entities/Ticket";

interface TicketQrCardProps {
  tickets: TicketPurchased[];
  onRefreshStatus: () => void;
  isUpdating: boolean;
  onReset: () => void;
}

export function TicketQrCard({
  tickets,
  onRefreshStatus,
  isUpdating,
  onReset,
}: TicketQrCardProps) {
  const mainTicket = tickets[0];
  const allSeats = tickets.map((t) => t.seatNumber).join(", ");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Boleto Electrónico
        </h2>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Presenta este código al abordar el bus
      </p>

      <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 my-2 flex flex-col items-center">
        {/* QR en fondo blanco para lectura óptica fiable */}
        <div className="bg-white p-3 rounded-2xl shadow-xs">
          <QRCodeSVG
            value={mainTicket?.qrToken || "RN-DEMO12345"}
            size={140}
            level="H"
          />
        </div>
        <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {mainTicket?.qrToken || "RN-DEMO12345"}
        </span>

        <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-left grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
              Pasajero
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {mainTicket?.passengerName || "Pasajero General"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
              Asiento(s)
            </span>
            <span className="font-black text-blue-600 dark:text-blue-400">
              {allSeats || "1"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
              Salida
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {mainTicket?.departureTime || "08:00"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
              Ruta
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {mainTicket?.originCity} → {mainTicket?.destinationCity}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <button
          type="button"
          onClick={onRefreshStatus}
          disabled={isUpdating}
          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
          <span>Actualizar estado de boleto</span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuevo viaje</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketQrCard;
