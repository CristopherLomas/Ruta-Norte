export interface Trip {
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

export interface ShiftFilterOption {
  id: "ALL" | "MORNING" | "AFTERNOON" | "NIGHT";
  label: string;
}
