export interface TicketPurchased {
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

export interface PurchaseTicketPayload {
  tripId: string;
  seatNumbers: number[];
  passengerName: string;
  passengerDni: string;
  paymentMethod: "TRANSFERENCIA" | "EFECTIVO";
  bankName: string;
  paymentReference: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  seatNumber?: number;
  passengerName?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  status?: string;
}
