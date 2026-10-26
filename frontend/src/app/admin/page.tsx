"use client";

import React, { useState, useEffect } from "react";
import NavbarVisual from "@/components/NavbarVisual";
import { axiosClient } from "@/lib/axiosClient";
import {
  DollarSign,
  Ticket,
  Bus,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface City {
  id: number;
  name: string;
  terminalName: string;
}

interface BusUnit {
  id: number;
  cooperativeName: string;
  unitNumber: string;
  plate: string;
  photoUrl: string;
  capacity: number;
}

export default function AdminPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [buses, setBuses] = useState<BusUnit[]>([]);

  // Formulario de nueva salida
  const [originId, setOriginId] = useState<number>(1);
  const [destinationId, setDestinationId] = useState<number>(6);
  const [busId, setBusId] = useState<number>(1);
  const [departureDate, setDepartureDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [departureTime, setDepartureTime] = useState<string>("08:30");
  const [price, setPrice] = useState<number>(3.75);
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [tripSuccessMessage, setTripSuccessMessage] = useState<string | null>(null);

  // Formulario de nuevo bus
  const [newCoop, setNewCoop] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [creatingBus, setCreatingBus] = useState(false);
  const [busSuccessMessage, setBusSuccessMessage] = useState<string | null>(null);

  // Cargar ciudades y buses
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    axiosClient.get("/cities").then((res) => {
      if (res.data) setCities(res.data);
    }).catch(() => {
      setCities([
        { id: 1, name: "Tulcán", terminalName: "Terminal Terrestre Tulcán" },
        { id: 2, name: "Julio Andrade", terminalName: "Terminal Julio Andrade" },
        { id: 3, name: "San Gabriel", terminalName: "Terminal San Gabriel" },
        { id: 4, name: "Bolívar", terminalName: "Terminal Bolívar" },
        { id: 5, name: "El Ángel", terminalName: "Terminal El Ángel" },
        { id: 6, name: "Ibarra", terminalName: "Terminal Terrestre Ibarra" },
        { id: 7, name: "Atuntaqui", terminalName: "Terminal Atuntaqui" },
        { id: 8, name: "Otavalo", terminalName: "Terminal Otavalo" },
        { id: 9, name: "Cotacachi", terminalName: "Terminal Cotacachi" },
      ]);
    });

    axiosClient.get("/buses").then((res) => {
      if (res.data) setBuses(res.data);
    }).catch(() => {
      setBuses([
        {
          id: 1,
          cooperativeName: "Velotax del Norte",
          unitNumber: "Disco 12",
          plate: "CAA-1020",
          photoUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
          capacity: 40,
        },
        {
          id: 2,
          cooperativeName: "Expreso Tulcán",
          unitNumber: "Disco 05",
          plate: "CAA-2345",
          photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
          capacity: 40,
        },
        {
          id: 3,
          cooperativeName: "Flota Imbabura",
          unitNumber: "Disco 44",
          plate: "IAC-3456",
          photoUrl: "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80",
          capacity: 40,
        },
      ]);
    });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destinationId) {
      alert("El origen y destino no pueden ser iguales");
      return;
    }
    setCreatingTrip(true);
    setTripSuccessMessage(null);

    try {
      await axiosClient.post("/trips", {
        originCityId: originId,
        destinationCityId: destinationId,
        busId,
        departureDate,
        departureTime: departureTime.length === 5 ? `${departureTime}:00` : departureTime,
        price,
      });
      setTripSuccessMessage("¡Salida programada exitosamente!");
    } catch {
      setTripSuccessMessage("¡Salida programada exitosamente (Modo Demo)!");
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoop || !newUnit || !newPlate) {
      alert("Por favor completa los campos del bus");
      return;
    }
    setCreatingBus(true);
    setBusSuccessMessage(null);

    const busPayload = {
      cooperativeName: newCoop,
      unitNumber: newUnit,
      plate: newPlate.toUpperCase(),
      photoUrl:
        newPhoto.trim() ||
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
      capacity: 40,
    };

    try {
      const res = await axiosClient.post("/buses", busPayload);
      if (res.data) {
        setBuses([...buses, res.data]);
      } else {
        setBuses([...buses, { ...busPayload, id: buses.length + 1 }]);
      }
      setBusSuccessMessage("¡Unidad añadida exitosamente!");
      setNewCoop("");
      setNewUnit("");
      setNewPlate("");
      setNewPhoto("");
    } catch {
      setBuses([...buses, { ...busPayload, id: buses.length + 1 }]);
      setBusSuccessMessage("¡Unidad añadida exitosamente (Modo Demo)!");
      setNewCoop("");
      setNewUnit("");
      setNewPlate("");
      setNewPhoto("");
    } finally {
      setCreatingBus(false);
    }
  };

  const selectedBusPreview = buses.find((b) => b.id === Number(busId)) || buses[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <NavbarVisual />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* =================================================================== */}
        {/* BLOQUE 1: TARJETAS DE RESUMEN SUPERIOR                              */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-black">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                BOLETOS VENDIDOS HOY
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                142 pasajes
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% que ayer</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-black">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                RECAUDACIÓN TOTAL HOY
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-700">
                $418.50
              </span>
              <span className="text-xs font-bold text-slate-400 block mt-0.5">
                Taquilla + Venta Digital
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-black">
              <Bus className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                SALIDAS ACTIVAS
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                24 frecuencias
              </span>
              <span className="text-xs font-bold text-blue-600 block mt-0.5">
                Corredor Carchi-Imbabura E35
              </span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BLOQUE 2: PROGRAMADOR VISUAL DE SALIDAS (ADMIN)                     */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                📅 Programador Visual de Salidas
              </h2>
              <p className="text-slate-500 font-semibold text-sm">
                Crea una nueva frecuencia con cálculo automático de turno (Mañana, Tarde o Noche)
              </p>
            </div>
            {tripSuccessMessage && (
              <span className="bg-emerald-100 text-emerald-800 font-black text-sm px-4 py-2 rounded-xl flex items-center space-x-2 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{tripSuccessMessage}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleCreateTrip} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Origen */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  1. CIUDAD DE ORIGEN 🛫
                </label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(Number(e.target.value))}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-lg text-slate-800 outline-none focus:border-blue-500"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.terminalName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destino */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  2. CIUDAD DE DESTINO 🛬
                </label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(Number(e.target.value))}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-lg text-slate-800 outline-none focus:border-blue-500"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.terminalName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bus */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  3. BUS ASIGNADO (40 Asientos) 🚌
                </label>
                <select
                  value={busId}
                  onChange={(e) => setBusId(Number(e.target.value))}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-lg text-slate-800 outline-none focus:border-blue-500"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.cooperativeName} - {b.unitNumber} ({b.plate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  4. FECHA DE SALIDA 📆
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-lg text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  5. HORA EXACTA ⏰
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-lg text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  6. PRECIO POR PASAJE ($) 💵
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.50"
                  max="20.00"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-16 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-2xl text-emerald-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Previsualización del Bus Asignado */}
            {selectedBusPreview && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center space-x-4">
                <img
                  src={selectedBusPreview.photoUrl}
                  alt={selectedBusPreview.cooperativeName}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-300"
                />
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase">UNIDAD SELECCIONADA</span>
                  <div className="text-lg font-black text-slate-800">
                    {selectedBusPreview.cooperativeName} ({selectedBusPreview.unitNumber})
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Placa: {selectedBusPreview.plate} · Capacidad estándar: 40 asientos
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={creatingTrip}
              className="w-full h-18 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center space-x-3"
            >
              <span>{creatingTrip ? "Guardando Salida..." : "➕ Programar Nueva Salida"}</span>
            </button>
          </form>
        </div>

        {/* =================================================================== */}
        {/* BLOQUE 3: CATÁLOGO DE FLOTA (BUSES DE 40 ASIENTOS)                  */}
        {/* =================================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                🚍 Catálogo de Flota (Buses de 40 Asientos)
              </h2>
              <p className="text-slate-500 font-semibold text-sm">
                Unidades registradas en el sistema para cooperativas del norte
              </p>
            </div>
            {busSuccessMessage && (
              <span className="bg-emerald-100 text-emerald-800 font-bold text-sm px-4 py-2 rounded-xl">
                {busSuccessMessage}
              </span>
            )}
          </div>

          {/* Formulario Rápido de Agregar Bus */}
          <form
            onSubmit={handleCreateBus}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end"
          >
            <div>
              <label className="text-xs font-black text-slate-400 uppercase block mb-1">
                Cooperativa
              </label>
              <input
                type="text"
                placeholder="Ej. Flota Imbabura"
                value={newCoop}
                onChange={(e) => setNewCoop(e.target.value)}
                className="w-full h-14 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase block mb-1">
                Disco / Unidad
              </label>
              <input
                type="text"
                placeholder="Ej. Disco 15"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full h-14 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase block mb-1">
                Placa
              </label>
              <input
                type="text"
                placeholder="Ej. CAA-9988"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className="w-full h-14 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase block mb-1">
                URL de Foto
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                className="w-full h-14 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-xs text-slate-800"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={creatingBus}
                className="w-full h-14 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-base shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Agregar Bus</span>
              </button>
            </div>
          </form>

          {/* Lista de Buses en Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-xl transition-all group"
              >
                <div className="h-44 w-full overflow-hidden bg-slate-200">
                  <img
                    src={bus.photoUrl}
                    alt={bus.cooperativeName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                      {bus.unitNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Placa: {bus.plate}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{bus.cooperativeName}</h4>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                    <span>Capacidad Única:</span>
                    <span className="text-emerald-600 font-black text-sm">40 Asientos Fijos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
