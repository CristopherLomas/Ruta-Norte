"use client";

import React from "react";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Trip } from "../entities/Trip";

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
}

export function TripCard({ trip, onSelect }: TripCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-3.5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
          <img
            src={trip.photoUrl}
            alt={trip.cooperativeName}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">
              {trip.cooperativeName}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
              {trip.unitNumber}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {trip.departureTime}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Hoy
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Salida programada
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Users className="w-3.5 h-3.5" />
              {trip.availableSeats} asientos libres
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            Tarifa Fija
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ${trip.price.toFixed(2)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(trip)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-102 cursor-pointer flex items-center space-x-1.5"
        >
          <span>Elegir asiento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default TripCard;
