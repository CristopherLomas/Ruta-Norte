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
  Printer,
  RotateCcw,
  Users,
  Building2,
  Banknote,
  RefreshCw,
  Check,
  ShieldCheck,
  Bus,
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

const generateDemoTrips = (origName = "Tulcán", destName = "Ibarra"): Trip[] => [
  {
    id: "trip-1",
    originCityId: 1,
    originCityName: origName,
    originTerminal: `Terminal Terrestre de ${origName}`,
    destinationCityId: 6,
    destinationCityName: destName,
    destinationTerminal: `Terminal Terrestre de ${destName}`,
    busId: 1,
    cooperativeName: "Velotax del Norte",
    unitNumber: "Disco 12",
    plate: "CAA-1020",
    photoUrl: "/images/buses/bus-velotax.jpg",
    departureDate: "Hoy",
    departureTime: "07:30",
    shift: "MORNING",
    price: 3.75,
    totalSeats: 40,
    occupiedSeats: 8,
    availableSeats: 32,
  },
  {
    id: "trip-2",
    originCityId: 1,
    originCityName: origName,
    originTerminal: `Terminal Terrestre de ${origName}`,
    destinationCityId: 6,
    destinationCityName: destName,
    destinationTerminal: `Terminal Terrestre de ${destName}`,
    busId: 2,
    cooperativeName: "Expreso Tulcán",
    unitNumber: "Disco 05",
    plate: "CAA-2345",
    photoUrl: "/images/buses/bus-expreso-tulcan.jpg",
    departureDate: "Hoy",
    departureTime: "13:30",
    shift: "AFTERNOON",
    price: 3.75,
    totalSeats: 40,
    occupiedSeats: 14,
    availableSeats: 26,
  },
  {
    id: "trip-3",
    originCityId: 1,
    originCityName: origName,
    originTerminal: `Terminal Terrestre de ${origName}`,
    destinationCityId: 6,
    destinationCityName: destName,
    destinationTerminal: `Terminal Terrestre de ${destName}`,
    busId: 3,
    cooperativeName: "Flota Imbabura",
    unitNumber: "Disco 44",
    plate: "IAC-3456",
    photoUrl: "/images/buses/bus-flota-imbabura.jpg",
    departureDate: "Hoy",
    departureTime: "18:45",
    shift: "NIGHT",
    price: 4.0,
    totalSeats: 40,
    occupiedSeats: 6,
    availableSeats: 34,
  },
];

export default function HomePage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Estados de Rutas
  const [cities, setCities] = useState<City[]>(FALLBACK_CITIES);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);

  // Estados de Horarios
  const [selectedShift, setSelectedShift] = useState<"ALL" | "MORNING" | "AFTERNOON" | "NIGHT">("ALL");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Estados de Asientos y Pago
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([3, 4, 12, 15, 22, 23]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState("Pasajero General");
  const [passengerDni, setPassengerDni] = useState("1004567890");
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFERENCIA" | "EFECTIVO">("TRANSFERENCIA");
  const [bankName, setBankName] = useState("Banco Pichincha");
  const [paymentReference, setPaymentReference] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  // Estados de Boleto
  const [purchasedTickets, setPurchasedTickets] = useState<TicketPurchased[]>([]);
  const [updatingTicketStatus, setUpdatingTicketStatus] = useState(false);

  // Carga de ciudades
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

  // Paso 1: Seleccionar Origen -> Pasa directo al Paso 2
  const handleSelectOrigin = (city: City) => {
    setOriginCity(city);
    setDestinationCity(null);
    setStep(2);
  };

  // Paso 2: Seleccionar Destino -> Carga viajes y pasa al Paso 3
  const handleSelectDestination = (city: City) => {
    if (!originCity || city.id === originCity.id) return;
    setDestinationCity(city);

    const generated = generateDemoTrips(originCity.name, city.name);
    setTrips(generated);
    setStep(3);

    // Consulta al backend en segundo plano
    axiosClient
      .get<Trip[]>(`/trips/search?originId=${originCity.id}&destinationId=${city.id}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTrips(res.data);
        }
      })
      .catch(() => {});
  };

  // Paso 3 -> Seleccionar Viaje
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

  // Paso 4 -> Alternar Asiento
  const handleToggleSeat = (seatNum: number) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  // Paso 4 -> Confirmar Compra
  const handleConfirmPurchase = async () => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    setPurchasing(true);

    const ref =
      paymentMethod === "TRANSFERENCIA"
        ? paymentReference.trim() || "TR-" + Math.floor(100000 + Math.random() * 900000)
        : "EFECTIVO-VENTANILLA";

    try {
      const res = await axiosClient.post<TicketPurchased[]>("/tickets/purchase", {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        passengerName: passengerName.trim() || "Pasajero General",
        passengerDni: passengerDni.trim() || "1004567890",
        paymentMethod: paymentMethod,
        bankName: paymentMethod === "TRANSFERENCIA" ? bankName : "Ventanilla",
        paymentReference: ref,
      });

      if (res.data && res.data.length > 0) {
        setPurchasedTickets(res.data);
      } else {
        generateFallbackTickets(ref);
      }
    } catch {
      generateFallbackTickets(ref);
    } finally {
      setPurchasing(false);
      setStep(5);
    }
  };

  const generateFallbackTickets = (ref: string) => {
    const tickets: TicketPurchased[] = selectedSeats.map((seat) => ({
      id: "tk-" + Math.random().toString(36).substring(2, 9),
      passengerName: passengerName.trim() || "Pasajero General",
      passengerDni: passengerDni.trim() || "1004567890",
      seatNumber: seat,
      qrToken: "RN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "PENDING_VERIFICATION",
      paymentMethod: paymentMethod,
      bankName: paymentMethod === "TRANSFERENCIA" ? bankName : "Ventanilla",
      paymentReference: ref,
      originCity: selectedTrip?.originCityName || originCity?.name || "Tulcán",
      destinationCity: selectedTrip?.destinationCityName || destinationCity?.name || "Ibarra",
      departureTime: selectedTrip?.departureTime || "08:00",
      departureDate: selectedTrip?.departureDate || "Hoy",
      cooperativeName: selectedTrip?.cooperativeName || "Velotax del Norte",
      price: selectedTrip?.price || 3.75,
    }));
    setPurchasedTickets(tickets);
  };

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
      setPurchasedTickets((prev) =>
        prev.map((t) => ({ ...t, status: "PAID" }))
      );
    } finally {
      setUpdatingTicketStatus(false);
    }
  };

  const handleReset = () => {
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

  const filteredTrips = trips.filter((t) => {
    if (selectedShift === "ALL") return true;
    return t.shift === selectedShift;
  });

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Barra de Navegación Superior */}
      <NavbarVisual />

      {/* 2. Barra de Pasos Kiosco Compacta */}
      <div className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-1.5 px-3 sm:px-6 shadow-xs z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold">
          {[
            { num: 1, label: "1. Origen" },
            { num: 2, label: "2. Destino" },
            { num: 3, label: "3. Horario" },
            { num: 4, label: "4. Asiento" },
            { num: 5, label: "5. Boleto QR" },
          ].map((item, idx, arr) => {
            const isCurrent = step === item.num;
            const isPast = step > item.num;

            return (
              <React.Fragment key={item.num}>
                <div
                  onClick={() => {
                    if (isPast) {
                      if (item.num === 1) setStep(1);
                      if (item.num === 2 && originCity) setStep(2);
                      if (item.num === 3 && originCity && destinationCity) setStep(3);
                    }
                  }}
                  className={`flex items-center space-x-1.5 ${
                    isPast ? "cursor-pointer hover:opacity-80" : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : item.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs transition-colors ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-extrabold"
                        : isPast
                        ? "text-slate-700 dark:text-slate-300 font-medium"
                        : "text-slate-400 dark:text-slate-600 font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`hidden md:block flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      isPast
                        ? "bg-emerald-500"
                        : isCurrent
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Contenedor Principal (100vh Libre de Scroll en Pantallas Kiosco) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-hidden flex flex-col justify-start">
        {/* =================================================================== */}
        {/* PASO 1: ORIGEN (¿DE DÓNDE SALES?) — 100% CERO SCROLL                */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="h-full flex flex-col justify-between py-1">
            {/* Cabecera Compacta */}
            <div className="shrink-0 flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>📍 1. ¿De dónde sales?</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                    Elige tu Terminal de Salida
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Toca la ciudad donde abordarás el bus en el Corredor Norte E35.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Paso 1 de 5
                </span>
                <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                  9 Ciudades Disponibles
                </span>
              </div>
            </div>

            {/* Contenedor de las dos filas de ciudades (Carchi + Imbabura) */}
            <div className="flex-1 overflow-hidden flex flex-col justify-between gap-1.5 pt-1.5">
              {/* FILA 1: CARCHI (5 CIUDADES) */}
              <div className="h-[49%] flex flex-col justify-between">
                <div className="shrink-0 flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Provincia del Carchi (5 Terminales)
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1">
                  {carchiCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectOrigin(city)}
                      className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left"
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
                        <span className="absolute top-1.5 right-1.5 bg-slate-900/80 dark:bg-slate-950/80 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-xs group-hover:bg-blue-600 transition-colors shadow-xs">
                          Elegir ➔
                        </span>
                      </div>
                      {/* 30% Barra de Texto Sólida */}
                      <div className="h-[32%] sm:h-[28%] min-h-[40px] px-2 sm:px-2.5 py-1 flex flex-col justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{city.terminalName}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FILA 2: IMBABURA (4 CIUDADES) */}
              <div className="h-[49%] flex flex-col justify-between">
                <div className="shrink-0 flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Provincia de Imbabura (4 Terminales)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1 max-w-[85%] mx-auto w-full">
                  {imbaburaCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectOrigin(city)}
                      className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer text-left"
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
                        <span className="absolute top-1.5 right-1.5 bg-slate-900/80 dark:bg-slate-950/80 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-xs group-hover:bg-blue-600 transition-colors shadow-xs">
                          Elegir ➔
                        </span>
                      </div>
                      {/* 30% Barra de Texto Sólida */}
                      <div className="h-[32%] sm:h-[28%] min-h-[40px] px-2 sm:px-2.5 py-1 flex flex-col justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{city.terminalName}</span>
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
        {/* PASO 2: DESTINO (¿A DÓNDE VAS?) — 100% CERO SCROLL                  */}
        {/* =================================================================== */}
        {step === 2 && originCity && (
          <div className="h-full flex flex-col justify-between py-1">
            {/* Cabecera Kiosco con Origen Seleccionado */}
            <div className="shrink-0 flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
                <div>
                  <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Saliendo de {originCity.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>2. ¿A dónde viajas?</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Toca tu ciudad de destino para ver los buses y horarios disponibles.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Paso 2 de 5
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Selecciona Llegada
                </span>
              </div>
            </div>

            {/* Contenedor de las dos filas de ciudades (Carchi + Imbabura) */}
            <div className="flex-1 overflow-hidden flex flex-col justify-between gap-1.5 pt-1.5">
              {/* FILA 1: CARCHI */}
              <div className="h-[49%] flex flex-col justify-between">
                <div className="shrink-0 flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Provincia del Carchi (5 Terminales)
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1">
                  {carchiCities.map((city) => {
                    const isOrigin = originCity.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        disabled={isOrigin}
                        onClick={() => handleSelectDestination(city)}
                        className={`group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all text-left ${
                          isOrigin
                            ? "opacity-50 grayscale border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-not-allowed"
                            : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
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
                                : "bg-slate-900/80 dark:bg-slate-950/80 text-white group-hover:bg-emerald-600 transition-colors"
                            }`}
                          >
                            {isOrigin ? "✓ Salida" : "Llegar ➔"}
                          </span>
                        </div>
                        {/* 30% Barra de Texto Sólida */}
                        <div className="h-[32%] sm:h-[28%] min-h-[40px] px-2 sm:px-2.5 py-1 flex flex-col justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{city.terminalName}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FILA 2: IMBABURA */}
              <div className="h-[49%] flex flex-col justify-between">
                <div className="shrink-0 flex items-center space-x-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Provincia de Imbabura (4 Terminales)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1 max-w-[85%] mx-auto w-full">
                  {imbaburaCities.map((city) => {
                    const isOrigin = originCity.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        disabled={isOrigin}
                        onClick={() => handleSelectDestination(city)}
                        className={`group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all text-left ${
                          isOrigin
                            ? "opacity-50 grayscale border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-not-allowed"
                            : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
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
                                : "bg-slate-900/80 dark:bg-slate-950/80 text-white group-hover:bg-emerald-600 transition-colors"
                            }`}
                          >
                            {isOrigin ? "✓ Salida" : "Llegar ➔"}
                          </span>
                        </div>
                        {/* 30% Barra de Texto Sólida */}
                        <div className="h-[32%] sm:h-[28%] min-h-[40px] px-2 sm:px-2.5 py-1 flex flex-col justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{city.terminalName}</span>
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
        {/* PASO 3: SELECCIONA HORARIO Y SALIDA                                 */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="h-full flex flex-col justify-between py-1">
            {/* Cabecera con Ruta y Filtros */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Destino</span>
                </button>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">
                    Ruta Seleccionada
                  </span>
                  <div className="flex items-center space-x-1.5 text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    <span>{originCity?.name}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                    <span>{destinationCity?.name}</span>
                  </div>
                </div>
              </div>

              {/* Filtros de Turno */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: "ALL", label: "Todos los horarios" },
                  { id: "MORNING", label: "🌅 Mañana" },
                  { id: "AFTERNOON", label: "☀️ Tarde" },
                  { id: "NIGHT", label: "🌙 Noche" },
                ].map((tab) => {
                  const active = selectedShift === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setSelectedShift(
                          tab.id as "ALL" | "MORNING" | "AFTERNOON" | "NIGHT"
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-102"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Salidas */}
            <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-2.5">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
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
                      onClick={() => handleSelectTrip(trip)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-102 cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Elegir asiento</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 4: MAPA DE ASIENTOS Y DATOS                                    */}
        {/* =================================================================== */}
        {step === 4 && selectedTrip && (
          <div className="h-full flex flex-col justify-between py-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 h-full">
              {/* Mapa de Asientos (40 puestos estándar) */}
              <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xs overflow-y-auto">
                <BusSeatMap
                  occupiedSeats={occupiedSeats}
                  selectedSeats={selectedSeats}
                  onToggleSeat={handleToggleSeat}
                  compact={true}
                />
              </div>

              {/* Datos del Pasajero y Pago */}
              <div className="w-full lg:w-96 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      Datos del Pasajero
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-black text-slate-900 dark:text-white">
                      <span>{selectedTrip.originCityName} → {selectedTrip.destinationCityName}</span>
                      <span>${selectedTrip.price.toFixed(2)} c/u</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                      {selectedTrip.departureTime} · {selectedTrip.cooperativeName}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nombre y Apellido
                      </label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Ej. Cristopher Lomas"
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Cédula / Identificación
                      </label>
                      <input
                        type="text"
                        value={passengerDni}
                        onChange={(e) => setPassengerDni(e.target.value)}
                        placeholder="1004567890"
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                      Forma de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("TRANSFERENCIA")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "TRANSFERENCIA"
                            ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Transferencia</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("EFECTIVO")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "EFECTIVO"
                            ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Ventanilla</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "TRANSFERENCIA" && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="leading-tight">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                          Banco Pichincha · Cta. Cte #2100458921
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                          Ruta Norte S.A. · RUC 0490012345001
                        </p>
                      </div>

                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Número de comprobante"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Asientos elegidos:
                    </span>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Ninguno"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="flex items-baseline justify-between mb-2.5">
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">
                      Total a pagar:
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ${(selectedSeats.length * selectedTrip.price).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={selectedSeats.length === 0 || purchasing}
                    onClick={handleConfirmPurchase}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {purchasing
                        ? "Emitiendo boleto..."
                        : selectedSeats.length === 0
                        ? "Elige asiento en el mapa"
                        : "Confirmar Boleto"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 5: BOLETO EMITIDO CON QR                                       */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="h-full flex items-center justify-center py-2">
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
                    value={
                      purchasedTickets.length > 0
                        ? purchasedTickets[0].qrToken
                        : "RN-DEMO12345"
                    }
                    size={140}
                    level="H"
                  />
                </div>
                <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {purchasedTickets[0]?.qrToken || "RN-DEMO12345"}
                </span>

                <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-left grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                      Pasajero
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {purchasedTickets[0]?.passengerName || passengerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                      Asiento(s)
                    </span>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {purchasedTickets.map((t) => t.seatNumber).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                      Salida
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {purchasedTickets[0]?.departureTime || selectedTrip?.departureTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">
                      Ruta
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {originCity?.name} → {destinationCity?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <button
                  type="button"
                  onClick={handleCheckTicketStatus}
                  disabled={updatingTicketStatus}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      updatingTicketStatus ? "animate-spin" : ""
                    }`}
                  />
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
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nuevo viaje</span>
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
