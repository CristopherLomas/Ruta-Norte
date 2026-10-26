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

  // Lógica clara y directa al hacer clic en cualquier ciudad
  const handleCityClick = (city: City) => {
    if (!originCity) {
      // 1er Clic: Selecciona Origen
      setOriginCity(city);
    } else if (originCity.id === city.id) {
      // Clic en la misma ciudad de origen: la deselecciona para permitir cambiar
      setOriginCity(null);
      setDestinationCity(null);
    } else if (!destinationCity) {
      // 2do Clic: Selecciona Destino y prepara las salidas
      setDestinationCity(city);
      const generated = generateDemoTrips(originCity.name, city.name);
      setTrips(generated);
    } else if (destinationCity.id === city.id) {
      // Clic en el destino actual: lo deselecciona
      setDestinationCity(null);
    } else {
      // Clic en una ciudad diferente: cambia el destino
      setDestinationCity(city);
      const generated = generateDemoTrips(originCity.name, city.name);
      setTrips(generated);
    }
  };

  // Botón para continuar al paso 3 (Horarios)
  const handleProceedToTrips = () => {
    if (!originCity || !destinationCity) return;
    const generated = generateDemoTrips(originCity.name, destinationCity.name);
    setTrips(generated);
    setStep(3);

    // Consulta en segundo plano por si el servidor tiene viajes en BD
    axiosClient
      .get<Trip[]>(`/trips/search?originId=${originCity.id}&destinationId=${destinationCity.id}`)
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* 1. Barra de Navegación */}
      <NavbarVisual />

      {/* 2. Barra de Pasos */}
      <div className="bg-white border-b border-slate-200 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
          {[
            { num: 1, label: "Ruta" },
            { num: 2, label: "Horario" },
            { num: 3, label: "Asiento" },
            { num: 4, label: "Boleto" },
          ].map((item, idx, arr) => {
            const stepNum = item.num === 1 ? 1 : item.num === 2 ? 3 : item.num === 3 ? 4 : 5;
            const isCurrent = (item.num === 1 && (step === 1 || step === 2)) || step === stepNum;
            const isPast = (item.num === 1 && step > 2) || (item.num > 1 && step > stepNum);

            return (
              <React.Fragment key={item.num}>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : item.num}
                  </div>
                  <span
                    className={`hidden sm:inline ${
                      isCurrent
                        ? "text-blue-700 font-bold"
                        : isPast
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`hidden md:block flex-1 h-0.5 mx-3 rounded-full ${
                      isPast ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Contenedor Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-12 flex flex-col justify-start">
        {/* =================================================================== */}
        {/* PASOS 1 Y 2: SELECCIÓN DE RUTA (CONSOLA + GRILLA VISUAL ACTIVA)     */}
        {/* =================================================================== */}
        {(step === 1 || step === 2) && (
          <div className="space-y-6">
            {/* Banner de Consola de Viaje (Fondo Claro, Limpio y Accesible) */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              {/* Instrucción directa */}
              <div className="mb-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    {!originCity
                      ? "Paso 1: Elige tu ciudad de salida"
                      : !destinationCity
                      ? `Saliendo desde ${originCity.name}. Ahora elige tu ciudad de llegada.`
                      : `Ruta lista: ${originCity.name} hacia ${destinationCity.name}`}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {!originCity
                      ? "Haz clic sobre la ciudad donde abordarás el bus."
                      : !destinationCity
                      ? "Haz clic en la ciudad a donde te diriges."
                      : "Puedes continuar a los horarios o hacer clic en cambiar si deseas modificarla."}
                  </p>
                </div>
                {(originCity || destinationCity) && (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginCity(null);
                      setDestinationCity(null);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer self-start sm:self-auto"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>

              {/* Bloques de Origen y Destino */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                {/* Bloque ORIGEN */}
                <div
                  className={`rounded-xl p-3.5 border transition-all ${
                    originCity
                      ? "bg-blue-50/80 border-2 border-blue-500 text-blue-900"
                      : "bg-slate-50 border-2 border-dashed border-blue-400 text-blue-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {originCity ? "✓ Origen seleccionado" : "1. Ciudad de Salida"}
                    </span>
                    {originCity && (
                      <button
                        type="button"
                        onClick={() => setOriginCity(null)}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    {originCity ? originCity.name : "Toca una ciudad abajo"}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {originCity ? originCity.terminalName : "Punto de salida"}
                  </p>
                </div>

                {/* Flecha conectora */}
                <div className="flex items-center justify-center text-slate-400 font-bold px-2">
                  <ArrowRight className="w-5 h-5 hidden md:block" />
                  <span className="md:hidden text-xs text-slate-400 font-semibold">hacia</span>
                </div>

                {/* Bloque DESTINO */}
                <div
                  className={`rounded-xl p-3.5 border transition-all ${
                    destinationCity
                      ? "bg-emerald-50/80 border-2 border-emerald-500 text-emerald-900"
                      : originCity
                      ? "bg-emerald-50/50 border-2 border-dashed border-emerald-400 text-emerald-800"
                      : "bg-slate-50 border border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {destinationCity
                        ? "✓ Destino seleccionado"
                        : originCity
                        ? "2. Ciudad de Llegada"
                        : "2. Destino"}
                    </span>
                    {destinationCity && (
                      <button
                        type="button"
                        onClick={() => setDestinationCity(null)}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    {destinationCity
                      ? destinationCity.name
                      : originCity
                      ? "Toca la ciudad de llegada abajo"
                      : "Pendiente"}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {destinationCity ? destinationCity.terminalName : "Punto de llegada"}
                  </p>
                </div>
              </div>

              {/* Botón Prominente de Continuar */}
              {originCity && destinationCity && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-600">
                    Viaje de <strong className="text-slate-900">{originCity.name}</strong> a{" "}
                    <strong className="text-slate-900">{destinationCity.name}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleProceedToTrips}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <span>Ver horarios y salidas disponibles</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Grilla de Ciudades de Carchi */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Provincia del Carchi
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {carchiCities.map((city) => {
                  const isOrigin = originCity?.id === city.id;
                  const isDestination = destinationCity?.id === city.id;

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityClick(city)}
                      className={`group rounded-xl overflow-hidden text-left transition-all cursor-pointer bg-white border ${
                        isOrigin
                          ? "border-2 border-blue-600 ring-4 ring-blue-100 shadow-md scale-[1.02]"
                          : isDestination
                          ? "border-2 border-emerald-600 ring-4 ring-emerald-100 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                      }`}
                    >
                      <div className="relative w-full h-32 bg-slate-100 overflow-hidden">
                        <img
                          src={city.imageUrl}
                          alt={city.name}
                          onError={(e) => handleImageError(e, city.backupUrl)}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="eager"
                        />
                        <div className="absolute top-2 right-2">
                          {isOrigin ? (
                            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Origen
                            </span>
                          ) : isDestination ? (
                            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Destino
                            </span>
                          ) : !originCity ? (
                            <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Elegir salida
                            </span>
                          ) : (
                            <span className="bg-emerald-700/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Elegir llegada
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {city.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{city.terminalName}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grilla de Ciudades de Imbabura */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Provincia de Imbabura
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 md:max-w-4xl">
                {imbaburaCities.map((city) => {
                  const isOrigin = originCity?.id === city.id;
                  const isDestination = destinationCity?.id === city.id;

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityClick(city)}
                      className={`group rounded-xl overflow-hidden text-left transition-all cursor-pointer bg-white border ${
                        isOrigin
                          ? "border-2 border-blue-600 ring-4 ring-blue-100 shadow-md scale-[1.02]"
                          : isDestination
                          ? "border-2 border-emerald-600 ring-4 ring-emerald-100 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                      }`}
                    >
                      <div className="relative w-full h-32 bg-slate-100 overflow-hidden">
                        <img
                          src={city.imageUrl}
                          alt={city.name}
                          onError={(e) => handleImageError(e, city.backupUrl)}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="eager"
                        />
                        <div className="absolute top-2 right-2">
                          {isOrigin ? (
                            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Origen
                            </span>
                          ) : isDestination ? (
                            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Check className="w-3 h-3" /> Destino
                            </span>
                          ) : !originCity ? (
                            <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Elegir salida
                            </span>
                          ) : (
                            <span className="bg-emerald-700/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Elegir llegada
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {city.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{city.terminalName}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 3: SELECCIONA HORARIO Y SALIDA                                 */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Cabecera */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs text-slate-500 block">Ruta seleccionada</span>
                <span className="text-lg font-bold text-slate-900">
                  {originCity?.name} → {destinationCity?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Cambiar ruta
              </button>
            </div>

            {/* Filtros de Turno */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {[
                { id: "ALL", label: "Todos los horarios" },
                { id: "MORNING", label: "Mañana" },
                { id: "AFTERNOON", label: "Tarde" },
                { id: "NIGHT", label: "Noche" },
              ].map((tab) => {
                const active = selectedShift === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedShift(tab.id as "ALL" | "MORNING" | "AFTERNOON" | "NIGHT")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Lista de Salidas */}
            <div className="space-y-3">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={trip.photoUrl}
                        alt={trip.cooperativeName}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">
                        {trip.cooperativeName} · {trip.unitNumber}
                      </span>
                      <div className="flex items-baseline space-x-2 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900">
                          {trip.departureTime}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Hoy</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Salida programada
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {trip.availableSeats} disponibles
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">
                        Tarifa
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        ${trip.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Elegir asiento
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mapa de Asientos */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <BusSeatMap
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                compact={false}
              />
            </div>

            {/* Datos del Pasajero */}
            <div className="w-full lg:w-96 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">
                    Datos del Pasajero
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a horarios</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{selectedTrip.originCityName} → {selectedTrip.destinationCityName}</span>
                    <span>${selectedTrip.price.toFixed(2)} c/u</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {selectedTrip.departureTime} · {selectedTrip.cooperativeName}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Cédula / Identificación
                    </label>
                    <input
                      type="text"
                      value={passengerDni}
                      onChange={(e) => setPassengerDni(e.target.value)}
                      placeholder="1004567890"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5 text-xs">
                    Forma de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TRANSFERENCIA")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === "TRANSFERENCIA"
                          ? "border-blue-600 bg-blue-50/60 text-blue-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
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
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === "EFECTIVO"
                          ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
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
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="leading-tight">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Banco Pichincha · Cta. Cte #2100458921
                      </span>
                      <p className="text-slate-500 text-[10px]">Ruta Norte S.A. · RUC 0490012345001</p>
                    </div>

                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Número de comprobante"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Asientos seleccionados:</span>
                    <span className="font-bold text-blue-600">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Ninguno"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-semibold text-slate-600 text-xs">Total:</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ${(selectedSeats.length * selectedTrip.price).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length === 0 || purchasing}
                  onClick={handleConfirmPurchase}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {purchasing
                      ? "Procesando..."
                      : selectedSeats.length === 0
                      ? "Elige un asiento en el mapa"
                      : "Confirmar boleto"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 5: BOLETO EMITIDO                                              */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="flex items-center justify-center py-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-sm w-full text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Boleto de Viaje
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Presenta este código al momento de abordar
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-xs">
                  <QRCodeSVG
                    value={
                      purchasedTickets.length > 0
                        ? purchasedTickets[0].qrToken
                        : "RN-DEMO12345"
                    }
                    size={130}
                    level="H"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 mt-2">
                  {purchasedTickets[0]?.qrToken || "RN-DEMO12345"}
                </span>

                <div className="w-full mt-3 pt-3 border-t border-slate-200 text-left grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pasajero</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {purchasedTickets[0]?.passengerName || passengerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asiento(s)</span>
                    <span className="font-bold text-slate-900">
                      {purchasedTickets.map((t) => t.seatNumber).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Salida</span>
                    <span className="font-medium text-slate-800">
                      {purchasedTickets[0]?.departureTime || selectedTrip?.departureTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ruta</span>
                    <span className="font-medium text-slate-800">
                      {originCity?.name} → {destinationCity?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleCheckTicketStatus}
                  disabled={updatingTicketStatus}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingTicketStatus ? "animate-spin" : ""}`} />
                  <span>Actualizar estado</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
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
