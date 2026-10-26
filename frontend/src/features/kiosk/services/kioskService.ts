import { axiosClient } from "@/lib/axiosClient";
import { City } from "../entities/City";
import { Trip } from "../entities/Trip";

export const FALLBACK_CITIES: City[] = [
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

export const generateDemoTrips = (origName = "Tulcán", destName = "Ibarra"): Trip[] => [
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

export const kioskService = {
  async getCities(): Promise<City[]> {
    try {
      const res = await axiosClient.get<City[]>("/cities");
      if (res.data && res.data.length > 0) {
        return res.data.map((c) => {
          const found = FALLBACK_CITIES.find(
            (f) => f.id === c.id || f.name.toLowerCase() === c.name.toLowerCase()
          );
          return {
            ...c,
            imageUrl: found?.imageUrl || `/images/cities/${c.name.toLowerCase().replace(/ /g, "-")}.jpg`,
            backupUrl: found?.backupUrl || `/cities/${c.name.toLowerCase().replace(/ /g, "-")}.jpg`,
          };
        });
      }
      return FALLBACK_CITIES;
    } catch {
      return FALLBACK_CITIES;
    }
  },

  async searchTrips(originId: number, destinationId: number, origName = "Tulcán", destName = "Ibarra"): Promise<Trip[]> {
    try {
      const res = await axiosClient.get<Trip[]>(
        `/trips/search?originId=${originId}&destinationId=${destinationId}`
      );
      if (res.data && res.data.length > 0) {
        return res.data;
      }
      return generateDemoTrips(origName, destName);
    } catch {
      return generateDemoTrips(origName, destName);
    }
  },

  async getOccupiedSeats(tripId: string): Promise<number[]> {
    try {
      const res = await axiosClient.get(`/trips/${tripId}/seats`);
      if (res.data) {
        return res.data
          .filter((s: { status: string; seatNumber: number }) => s.status === "OCCUPIED")
          .map((s: { seatNumber: number }) => s.seatNumber);
      }
      return [3, 4, 12, 15, 22];
    } catch {
      return [3, 4, 12, 15, 22];
    }
  },
};
