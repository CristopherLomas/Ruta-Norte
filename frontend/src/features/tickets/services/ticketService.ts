import { axiosClient } from "@/lib/axiosClient";
import { PurchaseTicketPayload, TicketPurchased, ValidationResult } from "../entities/Ticket";

export const ticketService = {
  async purchase(payload: PurchaseTicketPayload): Promise<TicketPurchased[]> {
    const res = await axiosClient.post<TicketPurchased[]>("/tickets/purchase", payload);
    return res.data;
  },

  async getTicket(id: string): Promise<TicketPurchased> {
    const res = await axiosClient.get<TicketPurchased>(`/tickets/${id}`);
    return res.data;
  },

  async validateQr(qrToken: string): Promise<ValidationResult> {
    const res = await axiosClient.post<ValidationResult>("/tickets/validate-qr", {
      qrToken: qrToken.trim(),
    });
    return res.data;
  },

  generateFallbackTickets(
    payload: PurchaseTicketPayload,
    originCityName: string,
    destCityName: string,
    departureTime: string,
    departureDate: string,
    cooperativeName: string,
    unitPrice: number
  ): TicketPurchased[] {
    return payload.seatNumbers.map((seat) => ({
      id: "tk-" + Math.random().toString(36).substring(2, 9),
      passengerName: payload.passengerName,
      passengerDni: payload.passengerDni,
      seatNumber: seat,
      qrToken: "RN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "PENDING_VERIFICATION",
      paymentMethod: payload.paymentMethod,
      bankName: payload.bankName,
      paymentReference: payload.paymentReference,
      originCity: originCityName,
      destinationCity: destCityName,
      departureTime: departureTime,
      departureDate: departureDate,
      cooperativeName: cooperativeName,
      price: unitPrice,
    }));
  },
};
