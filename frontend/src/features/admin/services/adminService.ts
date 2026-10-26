import { axiosClient } from "@/lib/axiosClient";
import { AdminMetrics, BusUnit, PendingTicket } from "../entities/AdminEntities";

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    try {
      const res = await axiosClient.get<AdminMetrics>("/admin/metrics");
      return res.data;
    } catch {
      return {
        totalBuses: 6,
        totalTrips: 1728,
        verifiedTicketsCount: 0,
        totalRevenue: 0.0,
        pendingCount: 0,
      };
    }
  },

  async getBuses(): Promise<BusUnit[]> {
    try {
      const res = await axiosClient.get<BusUnit[]>("/buses");
      return res.data;
    } catch {
      return [];
    }
  },

  async createBus(payload: Omit<BusUnit, "id">): Promise<BusUnit> {
    const res = await axiosClient.post<BusUnit>("/buses", payload);
    return res.data;
  },

  async getPendingTickets(): Promise<PendingTicket[]> {
    try {
      const res = await axiosClient.get<PendingTicket[]>("/tickets/pending-verification");
      return res.data;
    } catch {
      return [];
    }
  },

  async verifyPayment(ticketId: string): Promise<void> {
    await axiosClient.put(`/tickets/${ticketId}/verify-payment`, {
      action: "APPROVE",
    });
  },

  async rejectPayment(ticketId: string): Promise<void> {
    await axiosClient.put(`/tickets/${ticketId}/verify-payment`, {
      action: "REJECT",
    });
  },
};
