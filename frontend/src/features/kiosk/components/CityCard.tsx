"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { City } from "../entities/City";

interface CityCardProps {
  city: City;
  onSelect: (city: City) => void;
  isOrigin?: boolean;
  isDisabled?: boolean;
  mode?: "ORIGIN" | "DESTINATION";
}

export function CityCard({
  city,
  onSelect,
  isOrigin = false,
  isDisabled = false,
  mode = "ORIGIN",
}: CityCardProps) {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    backupUrl?: string
  ) => {
    const target = e.currentTarget;
    if (backupUrl && target.src !== backupUrl) {
      target.src = backupUrl;
    }
  };

  const isDestinationMode = mode === "DESTINATION";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(city)}
      className={`group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all text-left ${
        isDisabled
          ? "opacity-50 grayscale border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-not-allowed"
          : isDestinationMode
          ? "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
      }`}
    >
      {/* 70% Fotografía Real HD */}
      <div className="relative w-full h-[68%] sm:h-[72%] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={city.imageUrl}
          alt={city.name}
          onError={(e) => handleImageError(e, city.backupUrl)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="eager"
        />
        <span
          className={`absolute top-1.5 right-1.5 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs ${
            isOrigin
              ? "bg-blue-600 text-white"
              : isDestinationMode
              ? "bg-slate-900/80 dark:bg-slate-950/80 text-white group-hover:bg-emerald-600 transition-colors"
              : "bg-slate-900/80 dark:bg-slate-950/80 text-white group-hover:bg-blue-600 transition-colors"
          }`}
        >
          {isOrigin ? "✓ Salida" : isDestinationMode ? "Llegar ➔" : "Elegir ➔"}
        </span>
      </div>

      {/* 30% Barra de Texto Sólida */}
      <div className="h-[32%] sm:h-[28%] min-h-[40px] px-2 sm:px-2.5 py-1 flex flex-col justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <h3
          className={`font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight truncate transition-colors ${
            isDestinationMode
              ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
        >
          {city.name}
        </h3>
        <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate flex items-center gap-1 mt-0.5">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{city.terminalName}</span>
        </p>
      </div>
    </button>
  );
}

export default CityCard;
