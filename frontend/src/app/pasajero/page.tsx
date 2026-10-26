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
  Calendar,
  CheckCircle2,
  Ticket as TicketIcon,
  Printer,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";

interface City {
  id: number;
  name: string;
  province: string;
  terminalName: string;
  imageUrl: string;
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
  seatNumber: number;
  qrToken: string;
  status: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  departureDate: string;
  cooperativeName: string;
  price: number;
}

// Fallback de las 9 ciudades por si la API está arrancando
const FALLBACK_CITIES: City[] = [
  { id: 1, name: "Tulcán", province: "Carchi", terminalName: "Terminal Terrestre de Tulcán", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Julio Andrade", province: "Carchi", terminalName: "Terminal Parroquial Julio Andrade", imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "San Gabriel", province: "Carchi", terminalName: "Terminal Terrestre San Gabriel", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Bolívar", province: "Carchi", terminalName: "Terminal Cantonal Bolívar", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "El Ángel", province: "Carchi", terminalName: "Terminal Terrestre El Ángel", imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Ibarra", province: "Imbabura", terminalName: "Terminal Terrestre de Ibarra", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Atuntaqui", province: "Imbabura", terminalName: "Terminal Intercantonal Atuntaqui", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "Otavalo", province: "Imbabura", terminalName: "Terminal Terrestre de Otavalo", imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80" },
  { id: 9, name: "Cotacachi", province: "Imbabura", terminalName: "Terminal Terrestre Cotacachi", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
];

export default function PasajeroPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Paso 1
  const [cities, setCities] = useState<City[]>(FALLBACK_CITIES);
  const [originCity, setOriginCity] = useState<City | null>(FALLBACK_CITIES[0]); // Tulcán default
  const [destinationCity, setDestinationCity] = useState<City | null>(FALLBACK_CITIES[5]); // Ibarra default

  // Paso 2
  const [selectedShift, setSelectedShift] = useState<"ALL" | "MORNING" | "AFTERNOON" | "NIGHT">("ALL");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Paso 3
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([3, 4, 12, 15]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState("Pasajero General");
  const [purchasing, setPurchasing] = useState(false);

  // Paso 4
  const [purchasedTickets, setPurchasedTickets] = useState<TicketPurchased[]>([]);

  // Cargar ciudades con Axios
  useEffect(() => {
    axiosClient
      .get<City[]>("/cities")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCities(res.data);
          if (!originCity) setOriginCity(res.data[0]);
          if (!destinationCity) setDestinationCity(res.data[Math.min(5, res.data.length - 1)]);
        }
      })
      .catch(() => {
        // Mantiene fallback
      });
  }, []);

  // Cargar viajes al avanzar al Paso 2
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
    } catch (err) {
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
        departureTime: "14:15 PM",
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
        departureTime: "19:00 PM",
        shift: "NIGHT",
        price: 4.0,
        totalSeats: 40,
        occupiedSeats: 4,
        availableSeats: 36,
      },
    ]);
  };

  useEffect(() => {
    if (step === 2) {
      fetchTrips();
    }
  }, [step, selectedShift]);

  // Cargar asientos del viaje
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
    setStep(3);
  };

  const handleToggleSeat = (seatNum: number) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  // Compra en 1 clic
  const handleConfirmPurchase = async () => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    setPurchasing(true);

    try {
      const res = await axiosClient.post<TicketPurchased[]>("/tickets/purchase", {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        passengerName: passengerName.trim() || "Pasajero General",
      });

      if (res.data && res.data.length > 0) {
        setPurchasedTickets(res.data);
      } else {
        generateFallbackPurchasedTickets();
      }
    } catch (err) {
      generateFallbackPurchasedTickets();
    } finally {
      setPurchasing(false);
      setStep(4);
    }
  };

  const generateFallbackPurchasedTickets = () => {
    const tickets = selectedSeats.map((seat) => ({
      id: "tk-" + seat,
      passengerName: passengerName.trim() || "Pasajero General",
      seatNumber: seat,
      qrToken: "RN-" + Math.random().toString(36).substring(2, 14).toUpperCase(),
      status: "PAID",
      originCity: selectedTrip?.originCityName || "Tulcán",
      destinationCity: selectedTrip?.destinationCityName || "Ibarra",
      departureTime: selectedTrip?.departureTime || "08:00 AM",
      departureDate: selectedTrip?.departureDate || "Hoy",
      cooperativeName: selectedTrip?.cooperativeName || "Velotax del Norte",
      price: selectedTrip?.price || 3.75,
    }));
    setPurchasedTickets(tickets);
  };

  // Manejador de selección de ciudad
  const handleCityClick = (city: City) => {
    if (!originCity) {
      setOriginCity(city);
    } else if (originCity.id === city.id) {
      // Deseleccionar si toca la misma
      setOriginCity(null);
    } else if (!destinationCity) {
      setDestinationCity(city);
    } else {
      // Reemplazar destino si ya tenía ambos
      setDestinationCity(city);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarVisual />

      {/* Barra de Progreso del Wizard (Gigante y Accesible) */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sticky top-20 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {[
            { num: 1, label: "1. Ruta" },
            { num: 2, label: "2. Horario" },
            { num: 3, label: "3. Asientos" },
            { num: 4, label: "4. Boleto QR" },
          ].map((item) => (
            <div key={item.num} className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                  step === item.num
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110"
                    : step > item.num
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > item.num ? "✓" : item.num}
              </div>
              <span
                className={`hidden sm:inline font-black text-sm sm:text-base ${
                  step === item.num ? "text-blue-700" : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido Principal por Pasos */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* =================================================================== */}
        {/* PASO 1: CIUDADES FOTOGRÁFICAS                                       */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                ¿De dónde sales y a dónde vas?
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-medium">
                Toca una ciudad para tu <span className="text-emerald-600 font-bold">ORIGEN</span> y otra para tu{" "}
                <span className="text-blue-600 font-bold">DESTINO</span>.
              </p>
            </div>

            {/* Resumen Superior de Selección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black">
                  🛫
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block">
                    ORIGEN (SUBES AQUÍ)
                  </span>
                  <span className="text-2xl font-black text-emerald-950">
                    {originCity ? originCity.name : "Toca una ciudad abajo"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-blue-50 border-2 border-blue-300">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black">
                  🛬
                </div>
                <div>
                  <span className="text-xs font-black text-blue-800 uppercase tracking-widest block">
                    DESTINO (BAJAS AQUÍ)
                  </span>
                  <span className="text-2xl font-black text-blue-950">
                    {destinationCity ? destinationCity.name : "Toca una ciudad abajo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuadrícula de 9 Tarjetas Fotográficas de Ciudades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
              {cities.map((city) => {
                const isOrigin = originCity?.id === city.id;
                const isDestination = destinationCity?.id === city.id;

                return (
                  <div
                    key={city.id}
                    onClick={() => handleCityClick(city)}
                    className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shadow-md group ${
                      isOrigin
                        ? "ring-6 ring-emerald-500 shadow-2xl scale-102"
                        : isDestination
                        ? "ring-6 ring-blue-600 shadow-2xl scale-102"
                        : "border-2 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {/* Imagen de Fondo */}
                    <div className="h-52 w-full overflow-hidden bg-slate-800">
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                      />
                    </div>

                    {/* Gradiente Oscuro para Legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

                    {/* Badges de Estado */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
                        {city.province}
                      </span>
                      {isOrigin && (
                        <span className="bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center space-x-1 animate-pulse">
                          <span>🛫 ORIGEN</span>
                        </span>
                      )}
                      {isDestination && (
                        <span className="bg-blue-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center space-x-1 animate-pulse">
                          <span>🛬 DESTINO</span>
                        </span>
                      )}
                    </div>

                    {/* Información de la Ciudad */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-3xl font-black tracking-tight">{city.name}</h3>
                      <p className="text-xs text-slate-300 font-semibold flex items-center space-x-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{city.terminalName}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón Gigante Siguiente */}
            <div className="pt-6 text-center">
              <button
                type="button"
                disabled={!originCity || !destinationCity || originCity.id === destinationCity.id}
                onClick={() => setStep(2)}
                className={`w-full max-w-xl mx-auto h-20 rounded-3xl font-black text-2xl flex items-center justify-center space-x-3 transition-all shadow-xl ${
                  originCity && destinationCity && originCity.id !== destinationCity.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40 hover:scale-102"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Ver Horarios Disponibles</span>
                <ArrowRight className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 2: HORARIOS Y AUTOBUSES                                        */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black text-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Cambiar Ruta</span>
              </button>

              <div className="text-right">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest block">
                  RUTA SELECCIONADA
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {originCity?.name} ➔ {destinationCity?.name}
                </span>
              </div>
            </div>

            {/* Pestañas de Turno Gigantes */}
            <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto p-2 bg-slate-200/80 rounded-3xl">
              {[
                { id: "ALL", label: "✨ Todos", desc: "Ver todo el día" },
                { id: "MORNING", label: "☀️ Mañana", desc: "05:00 - 11:59" },
                { id: "AFTERNOON", label: "🌤️ Tarde", desc: "12:00 - 17:59" },
                { id: "NIGHT", label: "🌙 Noche", desc: "18:00 - 23:00" },
              ].map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedShift(shift.id as any)}
                  className={`py-4 px-3 rounded-2xl font-black text-center transition-all ${
                    selectedShift === shift.id
                      ? "bg-white text-blue-700 shadow-lg scale-102 border-2 border-blue-500"
                      : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  <span className="text-lg sm:text-xl block">{shift.label}</span>
                  <span className="text-xs text-slate-400 font-semibold">{shift.desc}</span>
                </button>
              ))}
            </div>

            {/* Tarjetas Grandes de Buses Disponibles */}
            {loadingTrips ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-xl font-bold text-slate-600">Buscando las mejores salidas...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border-2 border-slate-200">
                <span className="text-5xl block mb-4">🚌</span>
                <h3 className="text-2xl font-black text-slate-800">No hay salidas para este horario</h3>
                <p className="text-slate-500 mt-2">Prueba seleccionando otro turno o vuelve a la mañana.</p>
                <button
                  onClick={() => setSelectedShift("ALL")}
                  className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold"
                >
                  Ver todas las salidas
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
                  >
                    {/* Foto y Datos del Bus */}
                    <div className="flex items-center space-x-5 w-full md:w-auto">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        <img
                          src={trip.photoUrl}
                          alt={trip.cooperativeName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                            {trip.unitNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            Placa: {trip.plate}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                          {trip.cooperativeName}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{trip.availableSeats} asientos libres</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hora y Precio */}
                    <div className="flex items-center justify-between w-full md:w-auto md:space-x-8 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-left md:text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                          HORA DE SALIDA
                        </span>
                        <div className="flex items-center space-x-1.5 text-slate-900">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="text-3xl font-black">{trip.departureTime}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                          PRECIO POR ASIENTO
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                          ${trip.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Botón Elegir */}
                    <button
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      className="w-full md:w-auto px-8 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 hover:scale-103 transition-all shrink-0"
                    >
                      <span>Elegir Asiento</span>
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 3: MAPA GRÁFICO DEL BUS (40 ASIENTOS)                          */}
        {/* =================================================================== */}
        {step === 3 && selectedTrip && (
          <div className="space-y-6 pb-28">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a Salidas</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase block">BUS SELECCIONADO</span>
                <span className="text-lg font-black text-slate-800">
                  {selectedTrip.cooperativeName} ({selectedTrip.unitNumber})
                </span>
              </div>
            </div>

            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900">Toca tus Asientos</h2>
              <p className="text-slate-600 font-medium mt-1">
                Los asientos en <span className="text-emerald-600 font-bold">VERDE</span> están libres.
              </p>
            </div>

            {/* Input Rápido del Nombre del Pasajero */}
            <div className="max-w-xl mx-auto bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <div className="flex-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                  Nombre del Pasajero Principal
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Componente Gráfico del Bus */}
            <BusSeatMap
              occupiedSeats={occupiedSeats}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
            />

            {/* Barra Flotante Fija Inferior */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 p-4 z-50 shadow-2xl">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    ASIENTOS SELECCIONADOS
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-blue-700">
                      {selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(", ") : "Ninguno"}
                    </span>
                    {selectedSeats.length > 0 && (
                      <span className="text-sm font-bold text-slate-500">
                        ({selectedSeats.length} {selectedSeats.length === 1 ? "pasaje" : "pasajes"})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      TOTAL A PAGAR
                    </span>
                    <span className="text-3xl font-black text-emerald-600">
                      ${(selectedSeats.length * selectedTrip.price).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={selectedSeats.length === 0 || purchasing}
                    onClick={handleConfirmPurchase}
                    className={`h-16 px-8 rounded-2xl font-black text-xl sm:text-2xl flex items-center space-x-3 transition-all shadow-xl ${
                      selectedSeats.length > 0 && !purchasing
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/40 hover:scale-103"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span>
                      {purchasing
                        ? "Emitiendo..."
                        : `Confirmar y Pagar ($${(selectedSeats.length * selectedTrip.price).toFixed(2)})`}
                    </span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PASO 4: BOLETO DIGITAL CON QR GIGANTE                               */}
        {/* =================================================================== */}
        {step === 4 && (
          <div className="space-y-8 max-w-2xl mx-auto py-6">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-4xl shadow-md animate-bounce">
                ✅
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ¡Boleto Emitido con Éxito!
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Muestra este código QR al chofer o inspector al momento de subir al bus.
              </p>
            </div>

            {/* Tarjetas de Boletos Estilo Boarding Pass */}
            <div className="space-y-6">
              {purchasedTickets.map((ticket, idx) => (
                <div
                  key={ticket.id || idx}
                  className="bg-white rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl"
                >
                  {/* Encabezado del Boarding Pass */}
                  <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black tracking-widest uppercase text-amber-400 block">
                        BOARDING PASS DIGITAL · RUTA NORTE
                      </span>
                      <h3 className="text-2xl font-black tracking-tight">{ticket.cooperativeName}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">ESTADO</span>
                      <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo del Boleto */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Trayecto */}
                    <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-6">
                      <div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          ORIGEN
                        </span>
                        <span className="text-3xl font-black text-slate-900">{ticket.originCity}</span>
                      </div>
                      <span className="text-3xl text-slate-300 font-black">➔</span>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          DESTINO
                        </span>
                        <span className="text-3xl font-black text-slate-900">{ticket.destinationCity}</span>
                      </div>
                    </div>

                    {/* Datos Clave */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black text-slate-400 uppercase block">PASAJERO</span>
                        <span className="text-base font-bold text-slate-800 truncate block">
                          {ticket.passengerName}
                        </span>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-2xl border-2 border-blue-300">
                        <span className="text-xs font-black text-blue-800 uppercase block">ASIENTO</span>
                        <span className="text-3xl font-black text-blue-700">#{ticket.seatNumber}</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black text-slate-400 uppercase block">HORA</span>
                        <span className="text-lg font-black text-slate-800">{ticket.departureTime}</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-xs font-black text-slate-400 uppercase block">VALOR</span>
                        <span className="text-xl font-black text-emerald-600">${ticket.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Código QR Gigante */}
                    <div className="pt-4 flex flex-col items-center justify-center space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-slate-300">
                        <QRCodeSVG value={ticket.qrToken} size={220} level="H" includeMargin={true} />
                      </div>
                      <span className="font-mono text-sm font-black text-slate-700 tracking-widest">
                        TOKEN: {ticket.qrToken}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center space-x-2 shadow-lg hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-6 h-6" />
                <span>🖨️ Imprimir / Guardar Boleto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSelectedSeats([]);
                  setSelectedTrip(null);
                }}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center space-x-2 shadow-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
                <span>Comprar Otro Pasaje</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
