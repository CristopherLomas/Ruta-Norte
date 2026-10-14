"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, Clock, MapPin, User, Bus, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TicketDetail } from "@/features/tickets/actions";

interface TicketCardProps {
  ticket: TicketDetail;
  showPrintButton?: boolean;
}

export function TicketCard({ ticket, showPrintButton = true }: TicketCardProps) {
  const handlePrint = () => {
    window.print();
  };

  const departureDate = ticket.departure_time
    ? new Date(ticket.departure_time).toLocaleDateString("es-EC", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Fecha por confirmar";

  const departureHour = ticket.departure_time
    ? new Date(ticket.departure_time).toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const isUsed = ticket.status === "used";
  const isCancelled = ticket.status === "cancelled";

  return (
    <Card className="max-w-md mx-auto bg-white border-2 border-slate-200 shadow-md rounded-2xl overflow-hidden print:shadow-none print:border-black">
      {/* Cabecera del boleto */}
      <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-brand-secondary" />
          <div>
            <h4 className="font-bold text-sm tracking-tight leading-tight">Ruta Norte</h4>
            <p className="text-[11px] text-slate-300">{ticket.cooperative_name}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge
            variant={isUsed ? "secondary" : isCancelled ? "destructive" : "success"}
            className="text-[10px] font-mono px-2 py-0.5"
          >
            {isUsed ? "UTILIZADO" : isCancelled ? "CANCELADO" : "VÁLIDO"}
          </Badge>
          <span className="block text-[10px] text-slate-300 font-mono mt-0.5">
            {ticket.unit_number} · Placa {ticket.plate}
          </span>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Trayecto Origen -> Destino */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Origen</span>
            <div className="font-bold text-brand-primary text-base flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
              {ticket.origin_name}
            </div>
          </div>
          <div className="text-center px-2">
            <span className="text-xs text-muted-foreground">→</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Destino</span>
            <div className="font-bold text-brand-primary text-base flex items-center gap-1 justify-end">
              <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
              {ticket.destination_name}
            </div>
          </div>
        </div>

        {/* Datos de Salida, Asiento y Tarifa */}
        <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-dashed border-slate-200">
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[10px] text-muted-foreground block">Fecha & Hora</span>
            <span className="text-xs font-bold text-slate-800 block">{departureHour}</span>
            <span className="text-[10px] text-muted-foreground">{departureDate}</span>
          </div>
          <div className="border-r border-slate-200 px-2">
            <span className="text-[10px] text-muted-foreground block">Asiento</span>
            <span className="text-lg font-black text-brand-primary">{ticket.seat_number}</span>
            <span className="text-[10px] text-muted-foreground block">Individual</span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] text-muted-foreground block">Tarifa Pagada</span>
            <span className="text-xs font-bold text-emerald-600 block">
              ${ticket.fare_price.toFixed(2)} USD
            </span>
            <span className="text-[10px] text-muted-foreground">Simulado</span>
          </div>
        </div>

        {/* Pasajero */}
        <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50/50 p-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Pasajero: <strong className="text-slate-900">{ticket.passenger_name}</strong></span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            ID: {ticket.id.slice(0, 8)}
          </span>
        </div>

        {/* Código QR Opaco Inmutable */}
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs">
            <QRCodeSVG
              value={ticket.qr_code}
              size={160}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="font-mono font-bold text-xs text-slate-800 tracking-wider">
              {ticket.qr_code}
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              Presente este código al abordar la unidad
            </span>
          </div>
        </div>

        {/* Footer de seguridad */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verificación criptográfica SHA-256</span>
          </div>
          {showPrintButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-7 print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
