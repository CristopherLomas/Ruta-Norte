export interface TripOption {
  id: string;
  originCityName: string;
  destinationCityName: string;
  cooperativeName: string;
  unitNumber: string;
  departureTime: string;
  price: number;
}

export interface RecentTicket {
  id: string;
  passengerName: string;
  seatNumber: number;
  qrToken: string;
  status: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  cooperativeName: string;
  price: number;
}
