"use client";

import React, { useState, useEffect } from "react";
import NavbarVisual from "@/components/NavbarVisual";
import { AuthUser, LoginModal } from "@/features/auth";
import { authService } from "@/features/auth/services/authService";
import { City, Trip } from "@/features/kiosk";
import { kioskService, FALLBACK_CITIES } from "@/features/kiosk/services/kioskService";
import { CityCard } from "@/features/kiosk/components/CityCard";
import { TripCard } from "@/features/kiosk/components/TripCard";
import { BusSeatMap } from "@/features/kiosk/components/BusSeatMap";
import { TicketPurchased } from "@/features/tickets";
import { ticketService } from "@/features/tickets/services/ticketService";
import { TicketQrCard } from "@/features/tickets/components/TicketQrCard";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Banknote,
  Check,
  LogIn,
  UserCheck,
} from "lucide-react";

export default function HomePage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Estados de Usuario & Ventana Flotante de Login
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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

  // Carga inicial de sesión de usuario
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.name) setPassengerName(user.name);
      if (user.dni) setPassengerDni(user.dni);
    }
  }, []);

  // Carga de ciudades
  useEffect(() => {
    kioskService.getCities().then((data) => {
      setCities(data);
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

    kioskService
      .searchTrips(originCity.id, city.id, originCity.name, city.name)
      .then((data) => {
        setTrips(data);
      });

    setStep(3);
  };

  // Paso 3 -> Seleccionar Viaje
  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    const occ = await kioskService.getOccupiedSeats(trip.id);
    setOccupiedSeats(occ);
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

  // Paso 4 -> Validación de Login antes de Confirmar la Compra
  const handlePreConfirmPurchase = () => {
    if (!selectedTrip || selectedSeats.length === 0) return;

    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }

    executePurchase(currentUser);
  };

  // Ejecución de la compra
  const executePurchase = async (userToUse?: AuthUser | null) => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    setPurchasing(true);

    const user = userToUse || currentUser;
    const finalName = user?.name || passengerName.trim() || "Pasajero General";
    const finalDni = user?.dni || passengerDni.trim() || "1004567890";

    const ref =
      paymentMethod === "TRANSFERENCIA"
        ? paymentReference.trim() || "TR-" + Math.floor(100000 + Math.random() * 900000)
        : "EFECTIVO-VENTANILLA";

    const payload = {
      tripId: selectedTrip.id,
      seatNumbers: selectedSeats,
      passengerName: finalName,
      passengerDni: finalDni,
      paymentMethod,
      bankName: paymentMethod === "TRANSFERENCIA" ? bankName : "Ventanilla",
      paymentReference: ref,
    };

    try {
      const tickets = await ticketService.purchase(payload);
      if (tickets && tickets.length > 0) {
        setPurchasedTickets(tickets);
      } else {
        const fallbacks = ticketService.generateFallbackTickets(
          payload,
          selectedTrip.originCityName,
          selectedTrip.destinationCityName,
          selectedTrip.departureTime,
          selectedTrip.departureDate,
          selectedTrip.cooperativeName,
          selectedTrip.price
        );
        setPurchasedTickets(fallbacks);
      }
    } catch {
      const fallbacks = ticketService.generateFallbackTickets(
        payload,
        selectedTrip.originCityName,
        selectedTrip.destinationCityName,
        selectedTrip.departureTime,
        selectedTrip.departureDate,
        selectedTrip.cooperativeName,
        selectedTrip.price
      );
      setPurchasedTickets(fallbacks);
    } finally {
      setPurchasing(false);
      setStep(5);
    }
  };

  // Callback cuando el usuario se autentica exitosamente en el modal flotante
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setPassengerName(user.name);
    if (user.dni) setPassengerDni(user.dni);

    if (step === 4 && selectedSeats.length > 0) {
      executePurchase(user);
    }
  };

  const handleCheckTicketStatus = async () => {
    if (purchasedTickets.length === 0) return;
    setUpdatingTicketStatus(true);
    try {
      const firstId = purchasedTickets[0].id;
      const res = await ticketService.getTicket(firstId);
      if (res && res.status) {
        setPurchasedTickets((prev) =>
          prev.map((t) => ({ ...t, status: res.status }))
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

  const carchiCities = cities.filter((c) => c.province === "Carchi");
  const imbaburaCities = cities.filter((c) => c.province === "Imbabura");

  const filteredTrips = trips.filter((t) => {
    if (selectedShift === "ALL") return true;
    return t.shift === selectedShift;
  });

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Barra de Navegación Superior con Detección de Usuario */}
      <NavbarVisual
        currentUser={currentUser}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
          setPassengerName("Pasajero General");
          setPassengerDni("1004567890");
        }}
      />

      {/* 2. Barra de Pasos Kiosco Compacta */}
      <div className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-1.5 px-3 sm:px-6 shadow-xs z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs sm:text-sm font-semibold">
          {[
            { num: 1, label: "1. Origen" },
            { num: 2, label: "2. Destino" },
            { num: 3, label: "3. Horario" },
            { num: 4, label: "4. Asiento & Pago" },
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
                      if (item.num === 4 && selectedTrip) setStep(4);
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
                    <CityCard
                      key={city.id}
                      city={city}
                      onSelect={handleSelectOrigin}
                      mode="ORIGIN"
                    />
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
                    <CityCard
                      key={city.id}
                      city={city}
                      onSelect={handleSelectOrigin}
                      mode="ORIGIN"
                    />
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
                  {carchiCities.map((city) => (
                    <CityCard
                      key={city.id}
                      city={city}
                      onSelect={handleSelectDestination}
                      isOrigin={originCity.id === city.id}
                      isDisabled={originCity.id === city.id}
                      mode="DESTINATION"
                    />
                  ))}
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
                  {imbaburaCities.map((city) => (
                    <CityCard
                      key={city.id}
                      city={city}
                      onSelect={handleSelectDestination}
                      isOrigin={originCity.id === city.id}
                      isDisabled={originCity.id === city.id}
                      mode="DESTINATION"
                    />
                  ))}
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
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={handleSelectTrip}
                />
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
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
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

                  {/* Estado de Autenticación de Pasajero */}
                  {currentUser ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoginModalOpen(true)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="text-amber-500 font-bold">ℹ️</span>
                        <span className="text-[11px] text-amber-900 dark:text-amber-200 font-bold truncate">
                          Inicia sesión para emitir el boleto
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoginModalOpen(true)}
                        className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Acceder</span>
                      </button>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-black text-slate-900 dark:text-white">
                      <span>{selectedTrip.originCityName} → {selectedTrip.destinationCityName}</span>
                      <span>${selectedTrip.price.toFixed(2)} c/u</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                      {selectedTrip.departureTime} · {selectedTrip.cooperativeName}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nombre del Pasajero
                      </label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Ej. Cristopher Lomas"
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="flex items-baseline justify-between mb-2">
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
                    onClick={handlePreConfirmPurchase}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {purchasing
                        ? "Emitiendo boleto..."
                        : selectedSeats.length === 0
                        ? "Elige asiento en el mapa"
                        : currentUser
                        ? "Confirmar Boleto"
                        : "Iniciar Sesión y Confirmar"}
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
            <TicketQrCard
              tickets={purchasedTickets}
              onRefreshStatus={handleCheckTicketStatus}
              isUpdating={updatingTicketStatus}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* 4. MODAL FLOTANTE DE INICIO DE SESIÓN ENCIMA DE LA PÁGINA */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        tripSummary={
          selectedTrip
            ? {
                origin: selectedTrip.originCityName,
                destination: selectedTrip.destinationCityName,
                seats: selectedSeats,
                price: selectedSeats.length * selectedTrip.price,
              }
            : null
        }
      />
    </div>
  );
}
