import { axiosClient } from "@/lib/axiosClient";
import { RecentTicket, TripOption } from "../entities/Operation";
import { ValidationResult } from "@/features/tickets/entities/Ticket";

export const operationsService = {
  async getTodayTrips(): Promise<TripOption[]> {
    try {
      const res = await axiosClient.get<TripOption[]>("/trips/today");
      if (res.data && res.data.length > 0) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async getRecentTickets(): Promise<RecentTicket[]> {
    try {
      const res = await axiosClient.get<RecentTicket[]>("/tickets/recent");
      if (res.data && res.data.length > 0) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async quickSale(tripId: string, seatNumber: number): Promise<RecentTicket> {
    const res = await axiosClient.post<RecentTicket[]>("/tickets/purchase", {
      tripId,
      seatNumbers: [seatNumber],
      passengerName: "Venta Ventanilla",
      passengerDni: "9999999999",
      paymentMethod: "EFECTIVO",
      bankName: "Ventanilla",
      paymentReference: "VENTANILLA-" + Math.floor(1000 + Math.random() * 9000),
    });
    return res.data[0];
  },

  async validateToken(token: string): Promise<ValidationResult> {
    const res = await axiosClient.post<ValidationResult>("/tickets/validate-qr", {
      qrToken: token.trim(),
    });
    return res.data;
  },
};
