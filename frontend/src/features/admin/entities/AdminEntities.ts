export interface AdminMetrics {
  totalBuses: number;
  totalTrips: number;
  verifiedTicketsCount: number;
  totalRevenue: number;
  pendingCount: number;
}

export interface BusUnit {
  id: number;
  cooperativeName: string;
  unitNumber: string;
  plate: string;
  photoUrl: string;
  capacity: number;
}

export interface PendingTicket {
  id: string;
  passengerName: string;
  passengerDni?: string;
  seatNumber: number;
  qrToken: string;
  status: "PENDING_VERIFICATION" | "PAID" | "REJECTED" | "BOARDED";
  paymentMethod: string;
  paymentReference: string;
  bankName: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  departureDate: string;
  cooperativeName: string;
  unitNumber?: string;
  price: number;
  createdAt?: string;
}
