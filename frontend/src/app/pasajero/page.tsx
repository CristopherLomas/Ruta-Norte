"use client";

import React, { useState, useEffect } from "react";
import NavbarVisual from "@/components/NavbarVisual";
import BusSeatMap from "@/components/BusSeatMap";
import { axiosClient } from "@/lib/axiosClient";
import { QRCodeSVG } from "qrcode.react";
import {
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Ticket as TicketIcon,
  Printer,
  RotateCcw,
  Sparkles,
  Users,
  Sun,
  Sunset,
  Moon,
  Compass,
  CreditCard,
  Building2,
  Banknote,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface City {
  id: number;
  name: string;
  province: string;
  terminalName: string;
  imageUrl: string;
  backupUrl?: string;
}

interface Trip {
  id: string;
  originCityId: number;
  originCityName: string;
  originTerminal: string;
  destinationCityId: number;
  destinationCityName: string;
  destinationTerminal: string;
  busId: number;
  cooperativeName: string;
  unitNumber: string;
  plate: string;
  photoUrl: string;
  departureDate: string;
  departureTime: string;
  shift: string;
  price: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
}

interface TicketPurchased {
  id: string;
  passengerName: string;
  passengerDni?: string;
  seatNumber: number;
  qrToken: string;
  status: "PENDING_VERIFICATION" | "PAID" | "REJECTED" | "BOARDED";
  paymentMethod?: string;
  paymentReference?: string;
  bankName?: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  departureDate: string;
  cooperativeName: string;
  price: number;
}

// 9 Ciudades con Fotos 100% Reales de Wikipedia Commons en /images/cities/...
const FALLBACK_CITIES: City[] = [
  {
    id: 1,
    name: "Tulcán",
    province: "Carchi",
    terminalName: "Terminal Terrestre de Tulcán",
    imageUrl: "/images/cities/tulcan.jpg",
    backupUrl: "/cities/tulcan.jpg",
  },
  {
    id: 2,
    name: "Julio Andrade",
    province: "Carchi",
    terminalName: "Terminal Parroquial Julio Andrade",
    imageUrl: "/images/cities/julio-andrade.jpg",
    backupUrl: "/cities/julio-andrade.jpg",
  },
  {
    id: 3,
    name: "San Gabriel",
    province: "Carchi",
    terminalName: "Terminal Terrestre San Gabriel",
    imageUrl: "/images/cities/san-gabriel.jpg",
    backupUrl: "/cities/san-gabriel.jpg",
  },
  {
    id: 4,
    name: "Bolívar",
    province: "Carchi",
    terminalName: "Terminal Cantonal Bolívar",
    imageUrl: "/images/cities/bolivar.jpg",
    backupUrl: "/cities/bolivar.jpg",
  },
  {
    id: 5,
    name: "El Ángel",
    province: "Carchi",
    terminalName: "Terminal Terrestre El Ángel",
    imageUrl: "/images/cities/el-angel.jpg",
    backupUrl: "/cities/el-angel.jpg",
  },
  {
    id: 6,
    name: "Ibarra",
    province: "Imbabura",
    terminalName: "Terminal Terrestre de Ibarra",
    imageUrl: "/images/cities/ibarra.jpg",
    backupUrl: "/cities/ibarra.jpg",
  },
  {
    id: 7,
    name: "Atuntaqui",
    province: "Imbabura",
    terminalName: "Terminal Intercantonal Atuntaqui",
    imageUrl: "/images/cities/atuntaqui.jpg",
    backupUrl: "/cities/atuntaqui.jpg",
  },
  {
    id: 8,
    name: "Otavalo",
    province: "Imbabura",
    terminalName: "Terminal Terrestre de Otavalo",
    imageUrl: "/images/cities/otavalo.jpg",
    backupUrl: "/cities/otavalo.jpg",
  },
  {
    id: 9,
    name: "Cotacachi",
    province: "Imbabura",
    terminalName: "Terminal Terrestre Cotacachi",
    imageUrl: "/images/cities/cotacachi.jpg",
    backupUrl: "/cities/cotacachi.jpg",
  },
];

export default function PasajeroPage() {
  // Wizard de 5 Pasos Independientes:
  // 1: Origen | 2: Destino | 3: Horario | 4: Asiento & Pago | 5: Boleto QR
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Estados de Rutas
  const [cities, setCities] = useState<City[]>(FALLBACK_CITIES);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);

  // Estados de Horarios (Paso 3)
  const [selectedShift, setSelectedShift] = useState<"ALL" | "MORNING" | "AFTERNOON" | "NIGHT">("ALL");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Estados de Asientos y Pago (Paso 4)
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([3, 4, 12, 15, 22, 23]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState("Pasajero General");
  const [passengerDni, setPassengerDni] = useState("1004567890");
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFERENCIA" | "EFECTIVO">("TRANSFERENCIA");
  const [bankName, setBankName] = useState("Banco Pichincha");
  const [paymentReference, setPaymentReference] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  // Estados de Boleto QR (Paso 5)
  const [purchasedTickets, setPurchasedTickets] = useState<TicketPurchased[]>([]);
  const [updatingTicketStatus, setUpdatingTicketStatus] = useState(false);

  // Cargar ciudades con Axios garantizando fotos locales reales
  useEffect(() => {
    axiosClient
      .get<City[]>("/cities")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const merged = res.data.map((c) => {
            const found = FALLBACK_CITIES.find(
              (f) => f.id === c.id || f.name.toLowerCase() === c.name.toLowerCase()
            );
            return {
              ...c,
              imageUrl: found?.imageUrl || `/images/cities/${c.name.toLowerCase().replace(/ /g, "-")}.jpg`,
              backupUrl: found?.backupUrl || `/cities/${c.name.toLowerCase().replace(/ /g, "-")}.jpg`,
            };
          });
          setCities(merged);
        }
      })
      .catch(() => {
        setCities(FALLBACK_CITIES);
      });
  }, []);

  // Cargar viajes al avanzar al Paso 3
  const fetchTrips = async () => {
    if (!originCity || !destinationCity) return;
    setLoadingTrips(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const shiftParam = selectedShift === "ALL" ? "" : `&shift=${selectedShift}`;
      const res = await axiosClient.get<Trip[]>(
        `/trips/search?originId=${originCity.id}&destinationId=${destinationCity.id}&date=${today}${shiftParam}`
      );
      if (res.data && res.data.length > 0) {
        setTrips(res.data);
      } else {
        generateDemoTripsFallback();
      }
    } catch {
      generateDemoTripsFallback();
    } finally {
      setLoadingTrips(false);
    }
  };

  const generateDemoTripsFallback = () => {
    const orig = originCity?.name || "Tulcán";
    const dest = destinationCity?.name || "Ibarra";
    setTrips([
      {
        id: "demo-t1",
        originCityId: originCity?.id || 1,
        originCityName: orig,
        originTerminal: "Terminal Terrestre de " + orig,
        destinationCityId: destinationCity?.id || 6,
        destinationCityName: dest,
        destinationTerminal: "Terminal Terrestre de " + dest,
        busId: 1,
        cooperativeName: "Velotax del Norte",
        unitNumber: "Disco 12",
        plate: "CAA-1020",
        photoUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
        departureDate: "Hoy",
        departureTime: "07:30 AM",
        shift: "MORNING",
        price: 3.75,
        totalSeats: 40,
        occupiedSeats: 8,
        availableSeats: 32,
      },
      {
        id: "demo-t2",
        originCityId: originCity?.id || 1,
        originCityName: orig,
        originTerminal: "Terminal Terrestre de " + orig,
        destinationCityId: destinationCity?.id || 6,
        destinationCityName: dest,
        destinationTerminal: "Terminal Terrestre de " + dest,
        busId: 2,
        cooperativeName: "Expreso Tulcán",
        unitNumber: "Disco 05",
        plate: "CAA-2345",
        photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        departureDate: "Hoy",
        departureTime: "13:30 PM",
        shift: "AFTERNOON",
        price: 3.75,
        totalSeats: 40,
        occupiedSeats: 14,
        availableSeats: 26,
      },
      {
        id: "demo-t3",
        originCityId: originCity?.id || 1,
        originCityName: orig,
        originTerminal: "Terminal Terrestre de " + orig,
        destinationCityId: destinationCity?.id || 6,
        destinationCityName: dest,
        destinationTerminal: "Terminal Terrestre de " + dest,
        busId: 3,
        cooperativeName: "Flota Imbabura",
        unitNumber: "Disco 44",
        plate: "IAC-3456",
        photoUrl: "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80",
        departureDate: "Hoy",
        departureTime: "18:45 PM",
        shift: "NIGHT",
        price: 4.0,
        totalSeats: 40,
        occupiedSeats: 6,
        availableSeats: 34,
      },
    ]);
  };

  useEffect(() => {
    if (step === 3) {
      fetchTrips();
    }
  }, [step, selectedShift, originCity, destinationCity]);

  // Selección de Viaje (Paso 3 -> Paso 4)
  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    try {
      const res = await axiosClient.get(`/trips/${trip.id}/seats`);
      if (res.data) {
        const occ = res.data
          .filter((s: { status: string; seatNumber: number }) => s.status === "OCCUPIED")
          .map((s: { seatNumber: number }) => s.seatNumber);
        setOccupiedSeats(occ);
      }
    } catch {
      setOccupiedSeats([2, 5, 14, 18]);
    }
    setStep(4);
  };

  // Toggle de Asiento
  const handleToggleSeat = (seatNum: number) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  // Autocompletar comprobante demo
  const handleAutocompleteDemoPayment = () => {
    setPaymentMethod("TRANSFERENCIA");
    setBankName("Banco Pichincha");
    setPaymentReference("TR-" + Math.floor(100000 + Math.random() * 900000));
  };

  // Compra / Reserva con método de pago
  const handleConfirmPurchase = async () => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    setPurchasing(true);

    const ref =
      paymentMethod === "TRANSFERENCIA"
        ? paymentReference.trim() || "TR-DEMO" + Math.floor(100000 + Math.random() * 900000)
        : "EFECTIVO-VENTANILLA";

    try {
      const res = await axiosClient.post<TicketPurchased[]>("/tickets/purchase", {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        passengerName: passengerName.trim() || "Pasajero General",
        passengerDni: passengerDni.trim() || "1004567890",
        paymentMethod: paymentMethod,
        bankName: paymentMethod === "TRANSFERENCIA" ? bankName : "Pago en Taquilla",
        paymentReference: ref,
      });

      if (res.data && res.data.length > 0) {
        setPurchasedTickets(res.data);
      } else {
        generateFallbackPurchasedTickets(ref);
      }
    } catch {
      generateFallbackPurchasedTickets(ref);
    } finally {
      setPurchasing(false);
      setStep(5);
    }
  };

  const generateFallbackPurchasedTickets = (ref: string) => {
    const tickets: TicketPurchased[] = selectedSeats.map((seat) => ({
      id: "tk-" + Math.random().toString(36).substring(2, 9),
      passengerName: passengerName.trim() || "Pasajero General",
      passengerDni: passengerDni.trim() || "1004567890",
      seatNumber: seat,
      qrToken: "RN-" + Math.random().toString(36).substring(2, 14).toUpperCase(),
      status: "PENDING_VERIFICATION",
      paymentMethod: paymentMethod,
      bankName: paymentMethod === "TRANSFERENCIA" ? bankName : "Pago en Taquilla",
      paymentReference: ref,
      originCity: selectedTrip?.originCityName || originCity?.name || "Tulcán",
      destinationCity: selectedTrip?.destinationCityName || destinationCity?.name || "Ibarra",
      departureTime: selectedTrip?.departureTime || "08:00 AM",
      departureDate: selectedTrip?.departureDate || "Hoy",
      cooperativeName: selectedTrip?.cooperativeName || "Velotax del Norte",
      price: selectedTrip?.price || 3.75,
    }));
    setPurchasedTickets(tickets);
  };

  // Re-consultar estado del boleto en tiempo real
  const handleCheckTicketStatus = async () => {
    if (purchasedTickets.length === 0) return;
    setUpdatingTicketStatus(true);
    try {
      const firstId = purchasedTickets[0].id;
      const res = await axiosClient.get(`/tickets/${firstId}`);
      if (res.data && res.data.status) {
        setPurchasedTickets((prev) =>
          prev.map((t) => ({ ...t, status: res.data.status }))
        );
      }
    } catch {
      // Simular verificación si se pulsa para demo
      setPurchasedTickets((prev) =>
        prev.map((t) => ({ ...t, status: "PAID" }))
      );
    } finally {
      setUpdatingTicketStatus(false);
    }
  };

  // Acción Inmediata Paso 1 (Origen)
  const handleSelectOrigin = (city: City) => {
    setOriginCity(city);
    if (destinationCity?.id === city.id) {
      setDestinationCity(null);
    }
    setStep(2);
  };

  // Acción Inmediata Paso 2 (Destino)
  const handleSelectDestination = (city: City) => {
    if (city.id === originCity?.id) return;
    setDestinationCity(city);
    setStep(3);
  };

  // Reiniciar Kiosco
  const handleResetKiosk = () => {
    setOriginCity(null);
    setDestinationCity(null);
    setSelectedTrip(null);
    setSelectedSeats([]);
    setPurchasedTickets([]);
    setStep(1);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    backupUrl?: string
  ) => {
    const target = e.currentTarget;
    if (backupUrl && target.src !== backupUrl) {
      target.src = backupUrl;
    }
  };

  const carchiCities = cities.filter((c) => c.province === "Carchi");
  const imbaburaCities = cities.filter((c) => c.province === "Imbabura");

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none transition-colors duration-200">
      {/* 1. Navbar Compacto con Botón Modo Oscuro */}
      <NavbarVisual />

      {/* 2. Barra de Progreso de 5 Pasos Independientes */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-1.5 px-4 shadow-xs transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {[
            { num: 1, label: "1. Origen" },
            { num: 2, label: "2. Destino" },
            { num: 3, label: "3. Horario" },
            { num: 4, label: "4. Asiento & Pago" },
            { num: 5, label: "5. Boleto QR" },
          ].map((item, idx, arr) => {
            const isCurrent = step === item.num;
            const isPast = step > item.num;
            const canClick = isPast;

            return (
              <React.Fragment key={item.num}>
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && setStep(item.num as any)}
                  className={`flex items-center space-x-1.5 transition-all text-left ${
                    canClick ? "cursor-pointer hover:opacity-80" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/40 scale-105 ring-2 ring-blue-300 dark:ring-blue-500"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {isPast ? "✓" : item.num}
                  </div>
                  <span
                    className={`hidden sm:inline font-bold text-xs ${
                      isCurrent
                        ? "text-blue-700 dark:text-blue-400 font-black"
                        : isPast
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
                {idx < arr.length - 1 && (
                  <div
                    className={`hidden md:block flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      step > item.num
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Contenedor Maestro "Cero Scroll" (100vh) */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col p-2.5 sm:p-3 max-w-7xl w-full mx-auto">
        {/* =================================================================== */}
        {/* PASO 1: "¿De dónde sales? (Elige tu Origen)"                        */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="h-full flex flex-col justify-between">
            {/* Cabecera Compacta */}
            <div className="shrink-0 text-center mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ¿De dónde sales? <span className="text-emerald-600 dark:text-emerald-400">(Elige tu Origen)</span>
              </h1>
              <div className="flex justify-center items-center gap-2 sm:gap-4 my-1">
                {/* Caja 1 (Activa) */}
                <div className="border-2 border-dashed border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold px-3.5 py-1 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs animate-pulse">
                  <span>🛫 ORIGEN:</span>
                  <span className="font-extrabold">
                    {originCity ? originCity.name : "(Toca una ciudad abajo)"}
                  </span>
                </div>
                {/* Caja 2 (Inactiva) */}
                <div className="bg-slate-200/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold px-3.5 py-1 rounded-xl text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🛬 DESTINO:</span>
                  <span>(Pendiente)</span>
                </div>
              </div>
            </div>

            {/* Cuadrícula de 9 Tarjetas DIVIDIDAS (Foto limpia 72% arriba, texto 28% abajo) */}
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5">
              {/* Bloque Carchi (5 ciudades en 1 fila) */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>Provincia del Carchi (Norte)</span>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                  {carchiCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectOrigin(city)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all shadow-md hover:shadow-xl hover:scale-[1.02] text-left h-full w-full cursor-pointer"
                    >
                      {/* Parte Superior (72% de altura): FOTOGRAFÍA LIMPIA EN HD */}
                      <div className="relative w-full h-[72%] overflow-hidden bg-slate-950">
                        <img
                          src={city.imageUrl}
                          alt={city.name}
                          onError={(e) => handleImageError(e, city.backupUrl)}
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                          loading="eager"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                            Elegir ➔
                          </span>
                        </div>
                      </div>

                      {/* Parte Inferior (28% de altura): TEXTO SÓLIDO INDEPENDIENTE */}
                      <div className="h-[28%] px-2.5 py-1 bg-slate-900/95 dark:bg-slate-950 flex flex-col justify-center border-t border-slate-800">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {city.name}
                        </h3>
                        <p className="text-[10px] text-amber-400 truncate font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span>{city.terminalName}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloque Imbabura (4 ciudades en 1 fila centrada) */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  <span>Provincia de Imbabura (Lagos y Valles)</span>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:max-w-[85%] lg:mx-auto w-full">
                  {imbaburaCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectOrigin(city)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all shadow-md hover:shadow-xl hover:scale-[1.02] text-left h-full w-full cursor-pointer"
                    >
                      {/* Parte Superior (72%): FOTO LIMPIA EN HD */}
                      <div className="relative w-full h-[72%] overflow-hidden bg-slate-950">
                        <img
                          src={city.imageUrl}
                          alt={city.name}
                          onError={(e) => handleImageError(e, city.backupUrl)}
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                          loading="eager"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                            Elegir ➔
                          </span>
                        </div>
                      </div>

                      {/* Parte Inferior (28%): TEXTO SÓLIDO */}
                      <div className="h-[28%] px-2.5 py-1 bg-slate-900/95 dark:bg-slate-950 flex flex-col justify-center border-t border-slate-800">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                          {city.name}
                        </h3>
                        <p className="text-[10px] text-amber-400 truncate font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span>{city.terminalName}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 2: "¿A dónde vas? (Elige tu Destino)"                          */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="h-full flex flex-col justify-between">
            {/* Cabecera Compacta */}
            <div className="shrink-0 text-center mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ¿A dónde vas? <span className="text-blue-600 dark:text-blue-400">(Elige tu Destino)</span>
              </h1>
              <div className="flex justify-center items-center gap-2 sm:gap-4 my-1">
                {/* Caja 1 (Completada con botón cambiar) */}
                <div className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold px-3 py-1 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs">
                  <span>🛫 ORIGEN:</span>
                  <span className="font-extrabold">{originCity?.name}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ml-1 text-[11px] bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-600 font-extrabold cursor-pointer"
                  >
                    Cambiar ✏️
                  </button>
                </div>
                {/* Caja 2 (Activa) */}
                <div className="border-2 border-dashed border-blue-500 bg-blue-50/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold px-3.5 py-1 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs animate-pulse">
                  <span>🛬 DESTINO:</span>
                  <span className="font-extrabold">
                    {destinationCity ? destinationCity.name : "(Toca una ciudad abajo)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuadrícula con Origen Deshabilitado */}
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5">
              {/* Bloque Carchi */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>Provincia del Carchi</span>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                  {carchiCities.map((city) => {
                    const isOrigin = originCity?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        disabled={isOrigin}
                        onClick={() => handleSelectDestination(city)}
                        className={`group flex flex-col rounded-2xl overflow-hidden transition-all h-full w-full text-left ${
                          isOrigin
                            ? "opacity-35 grayscale cursor-not-allowed border-2 border-slate-500 bg-slate-900"
                            : "cursor-pointer bg-slate-900 border-2 border-slate-700/80 hover:border-blue-500 hover:shadow-xl hover:scale-[1.02]"
                        }`}
                      >
                        {/* 72% FOTO */}
                        <div className="relative w-full h-[72%] overflow-hidden bg-slate-950">
                          <img
                            src={city.imageUrl}
                            alt={city.name}
                            onError={(e) => handleImageError(e, city.backupUrl)}
                            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                            loading="eager"
                          />
                          <div className="absolute top-2 right-2">
                            {isOrigin ? (
                              <span className="bg-slate-950/95 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/50">
                                📍 SALES DE AQUÍ
                              </span>
                            ) : (
                              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                                Llegar ➔
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 28% TEXTO */}
                        <div className="h-[28%] px-2.5 py-1 bg-slate-900/95 dark:bg-slate-950 flex flex-col justify-center border-t border-slate-800">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                            {city.name}
                          </h3>
                          <p className="text-[10px] text-amber-400 truncate font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{city.terminalName}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque Imbabura */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  <span>Provincia de Imbabura</span>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:max-w-[85%] lg:mx-auto w-full">
                  {imbaburaCities.map((city) => {
                    const isOrigin = originCity?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        disabled={isOrigin}
                        onClick={() => handleSelectDestination(city)}
                        className={`group flex flex-col rounded-2xl overflow-hidden transition-all h-full w-full text-left ${
                          isOrigin
                            ? "opacity-35 grayscale cursor-not-allowed border-2 border-slate-500 bg-slate-900"
                            : "cursor-pointer bg-slate-900 border-2 border-slate-700/80 hover:border-blue-500 hover:shadow-xl hover:scale-[1.02]"
                        }`}
                      >
                        {/* 72% FOTO */}
                        <div className="relative w-full h-[72%] overflow-hidden bg-slate-950">
                          <img
                            src={city.imageUrl}
                            alt={city.name}
                            onError={(e) => handleImageError(e, city.backupUrl)}
                            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                            loading="eager"
                          />
                          <div className="absolute top-2 right-2">
                            {isOrigin ? (
                              <span className="bg-slate-950/95 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/50">
                                📍 SALES DE AQUÍ
                              </span>
                            ) : (
                              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                                Llegar ➔
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 28% TEXTO */}
                        <div className="h-[28%] px-2.5 py-1 bg-slate-900/95 dark:bg-slate-950 flex flex-col justify-center border-t border-slate-800">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                            {city.name}
                          </h3>
                          <p className="text-[10px] text-amber-400 truncate font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{city.terminalName}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 3: "Selecciona tu Horario y Bus"                               */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="h-full flex flex-col justify-between">
            {/* Barra de Resumen Compacta */}
            <div className="shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center justify-between shadow-xs mb-2 transition-colors duration-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  🛫 {originCity?.name} ➔ 🛬 {destinationCity?.name}
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 font-bold">
                  (Corredor Norte E35 · Consultando Supabase Cloud)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl font-extrabold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Cambiar ruta ✏️
              </button>
            </div>

            {/* Pestañas de Turno en 1 sola fila */}
            <div className="shrink-0 flex items-center justify-center gap-2 mb-2">
              {[
                { id: "ALL", label: "🌟 Todos", icon: Compass },
                { id: "MORNING", label: "☀️ Mañana", icon: Sun },
                { id: "AFTERNOON", label: "🌤️ Tarde", icon: Sunset },
                { id: "NIGHT", label: "🌙 Noche", icon: Moon },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = selectedShift === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedShift(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white shadow-blue-500/30 scale-102"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Lista de Buses Compacta */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {loadingTrips ? (
                <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                  Buscando salidas en Supabase Cloud...
                </div>
              ) : trips.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-base">No hay salidas disponibles para este turno.</p>
                  <button
                    type="button"
                    onClick={() => setSelectedShift("ALL")}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 underline font-bold"
                  >
                    Ver todos los turnos
                  </button>
                </div>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Foto y Datos del Bus */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={trip.photoUrl}
                          alt={trip.cooperativeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                          {trip.cooperativeName} · {trip.unitNumber}
                        </span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {trip.departureTime}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            (Hoy)
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Turno: {trip.shift}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Users className="w-3.5 h-3.5" />
                            {trip.availableSeats} disponibles
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Precio y Botón de Selección */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          TARIFA
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          ${trip.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectTrip(trip)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base px-5 py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-500/30 hover:scale-102 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Elegir Asiento</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 4: "Elige tu Asiento y Método de Pago"                        */}
        {/* =================================================================== */}
        {step === 4 && selectedTrip && (
          <div className="h-full flex flex-col md:flex-row gap-3 min-h-0">
            {/* Izquierda: BusSeatMap Compacto */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto">
              <BusSeatMap
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                compact={true}
              />
            </div>

            {/* Derecha: Formulario de Pasajero, Método de Pago y Confirmación */}
            <div className="w-full md:w-96 lg:w-[420px] shrink-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between overflow-y-auto transition-colors duration-200">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                    Datos del Pasajero & Pago
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Horarios</span>
                  </button>
                </div>

                {/* Resumen de Ruta */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{selectedTrip.originCityName} ➔ {selectedTrip.destinationCityName}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">${selectedTrip.price.toFixed(2)} c/u</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedTrip.departureTime} · {selectedTrip.cooperativeName} · {selectedTrip.unitNumber}
                  </p>
                </div>

                {/* Datos del Pasajero */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Cédula / DNI
                    </label>
                    <input
                      type="text"
                      value={passengerDni}
                      onChange={(e) => setPassengerDni(e.target.value)}
                      placeholder="1004567890"
                      className="w-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Métodos de Pago: 2 Opciones Grandes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Método de Pago
                    </span>
                    <button
                      type="button"
                      onClick={handleAutocompleteDemoPayment}
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold hover:underline flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Autocompletar Demo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Opción A: Transferencia */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TRANSFERENCIA")}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === "TRANSFERENCIA"
                          ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-300"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-xs">Transferencia</span>
                      </div>
                      <span className="text-[9px] block text-slate-500 dark:text-slate-400 mt-0.5">
                        Pichincha, Deuna, etc.
                      </span>
                    </button>

                    {/* Opción B: Efectivo */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("EFECTIVO")}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === "EFECTIVO"
                          ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-300"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-xs">Efectivo</span>
                      </div>
                      <span className="text-[9px] block text-slate-500 dark:text-slate-400 mt-0.5">
                        Pagar en Ventanilla
                      </span>
                    </button>
                  </div>
                </div>

                {/* Detalle si es Transferencia */}
                {paymentMethod === "TRANSFERENCIA" && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] space-y-2">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-blue-100 dark:border-blue-900 leading-tight">
                      <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 block">
                        CUENTA RECEPTORA RUTA NORTE:
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Banco Pichincha · Cta. Cte #2100458921
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                        RUC: 0490012345001 · Ruta Norte S.A.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Banco de Origen:
                        </label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <option value="Banco Pichincha">Banco Pichincha</option>
                          <option value="Deuna!">Deuna! (App)</option>
                          <option value="Produbanco">Produbanco</option>
                          <option value="Banco Guayaquil">Banco Guayaquil</option>
                          <option value="Cooperativa Tulcán">Cooperativa Tulcán</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          # Comprobante / Ref:
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="Ej. TR-48291"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Detalle si es Efectivo */}
                {paymentMethod === "EFECTIVO" && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1">
                      <span>💵 Reserva con Pago en Ventanilla</span>
                    </p>
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
                      Tu asiento quedará reservado en estado pendiente hasta que abones el valor al taquillero en la terminal.
                    </p>
                  </div>
                )}

                {/* Asientos Elegidos */}
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Asientos Elegidos:</span>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {selectedSeats.length > 0 ? selectedSeats.length : "Ninguno"}
                    </span>
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedSeats.map((s) => (
                        <span
                          key={s}
                          className="bg-blue-600 text-white font-black px-2 py-0.5 rounded-md text-xs shadow-xs"
                        >
                          #{s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-[11px]">
                      Toca los asientos verdes del mapa para agregarlos.
                    </p>
                  )}
                </div>
              </div>

              {/* Total y Botón de Envío */}
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-2">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">Total a Pagar:</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ${(selectedSeats.length * selectedTrip.price).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length === 0 || purchasing}
                  onClick={handleConfirmPurchase}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-base shadow-lg shadow-emerald-600/30 hover:scale-101 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {purchasing
                      ? "Procesando..."
                      : selectedSeats.length === 0
                      ? "Elige un asiento"
                      : paymentMethod === "TRANSFERENCIA"
                      ? "Registrar Pago y Generar Boleto"
                      : "Reservar y Generar Orden en Efectivo"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 5: "Boleto Digital QR con Verificación en Tiempo Real"         */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="h-full flex items-center justify-center p-2">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl max-w-md w-full text-center flex flex-col justify-between max-h-full overflow-y-auto transition-colors duration-200">
              {/* Badge de Estado Dinámico */}
              <div>
                {purchasedTickets.length > 0 &&
                purchasedTickets[0].status === "PENDING_VERIFICATION" ? (
                  <div className="mb-2 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 animate-pulse">
                    <div className="flex items-center justify-center gap-1.5 font-black text-sm">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span>⏳ PENDIENTE DE VERIFICACIÓN POR ADMINISTRACIÓN</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 font-semibold">
                      Comprobante registrado: {purchasedTickets[0].paymentReference} ({purchasedTickets[0].paymentMethod}).
                      Tan pronto el Administrador lo apruebe, el código QR quedará activo para abordar.
                    </p>
                  </div>
                ) : (
                  <div className="mb-2 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200">
                    <div className="flex items-center justify-center gap-1.5 font-black text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>✅ PAGO VERIFICADO - BOLETO ACTIVO PARA ABORDAR</span>
                    </div>
                  </div>
                )}

                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Pase de Abordar Digital
                </h2>
              </div>

              {/* Tarjeta con Código QR */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-3 my-2 flex flex-col items-center">
                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200">
                  <QRCodeSVG
                    value={
                      purchasedTickets.length > 0
                        ? purchasedTickets[0].qrToken
                        : "RN-DEMOQR12345"
                    }
                    size={140}
                    level="H"
                  />
                </div>
                <div className="mt-1.5 text-center">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest block">
                    TOKEN QR
                  </span>
                  <span className="text-xs font-black font-mono text-blue-700 dark:text-blue-400">
                    {purchasedTickets.length > 0
                      ? purchasedTickets[0].qrToken
                      : "RN-DEMOQR12345"}
                  </span>
                </div>

                <div className="w-full mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-left grid grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px]">PASAJERO</span>
                    <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                      {purchasedTickets[0]?.passengerName || passengerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px]">ASIENTO</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      #{purchasedTickets.map((t) => t.seatNumber).join(", #")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px]">SALIDA</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {purchasedTickets[0]?.departureTime || selectedTrip?.departureTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold block text-[9px]">MÉTODO</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {purchasedTickets[0]?.paymentMethod || paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleCheckTicketStatus}
                  disabled={updatingTicketStatus}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingTicketStatus ? "animate-spin" : ""}`} />
                  <span>🔄 Actualizar Estado del Boleto</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>🖨️ Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetKiosk}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>🔄 Nuevo Boleto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
