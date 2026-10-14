"use client";

import * as React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationTimerProps {
  expiresAt: string; // ISO string
  onExpire?: () => void;
  className?: string;
}

export function ReservationTimer({ expiresAt, onExpire, className }: ReservationTimerProps) {
  const [timeLeftMs, setTimeLeftMs] = React.useState<number>(() => {
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  const onExpireCalledRef = React.useRef(false);

  React.useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const remaining = Math.max(0, target - Date.now());
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (!onExpireCalledRef.current) {
          onExpireCalledRef.current = true;
          onExpire?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);

  const isLowTime = minutes < 2;
  const isExpired = timeLeftMs <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors shadow-xs",
        isExpired
          ? "bg-red-50 border-red-300 text-red-800"
          : isLowTime
          ? "bg-amber-50 border-amber-300 text-amber-800 animate-pulse"
          : "bg-blue-50 border-blue-200 text-brand-primary",
        className
      )}
    >
      {isExpired ? (
        <AlertTriangle className="h-4 w-4 text-red-600" />
      ) : (
        <Clock className={cn("h-4 w-4", isLowTime ? "text-amber-600" : "text-brand-primary")} />
      )}

      <div>
        {isExpired ? (
          <span className="font-bold">Reserva expirada — Asientos liberados</span>
        ) : (
          <span>
            Tiempo restante para pagar:{" "}
            <span className="font-mono font-bold text-base">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
