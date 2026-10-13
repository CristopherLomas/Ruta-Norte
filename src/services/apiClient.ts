/**
 * Cliente HTTP para consumo de la API REST de Spring Boot (Ruta Norte)
 * Base URL por defecto: http://localhost:8080/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SPRING_API_URL || "http://localhost:8080/api";

export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Obtiene el token JWT almacenado en sessionStorage o cookies
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rutanorte_jwt") || null;
}

/**
 * Guarda el token JWT tras un login exitoso
 */
export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rutanorte_jwt", token);
  }
}

/**
 * Realiza una petición tipada a los endpoints de Spring Boot
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error HTTP ${response.status}`);
  }

  return data;
}

// -------------------------------------------------------------
// SERVICIOS ESPECÍFICOS DE RUTA NORTE (SPRING BOOT ENDPOINTS)
// -------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; userId: string; role: string; fullName: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
};

export const tripsApi = {
  search: (routeId?: string) =>
    apiRequest<any[]>(`/trips${routeId ? `?routeId=${routeId}` : ""}`),
  getById: (id: string) => apiRequest<any>(`/trips/${id}`),
  getSeats: (tripId: string) => apiRequest<any>(`/trips/${tripId}/seats`),
};

export const bookingsApi = {
  create: (tripId: string, originStopId: string, destinationStopId: string, passengerId: string, seatIds: string[]) =>
    apiRequest<any>("/bookings", {
      method: "POST",
      body: JSON.stringify({ tripId, originStopId, destinationStopId, passengerId, seatIds }),
    }),
  cancel: (bookingId: string) =>
    apiRequest<void>(`/bookings/${bookingId}`, { method: "DELETE" }),
};

export const paymentsApi = {
  process: (bookingId: string, amount: number, method: string) =>
    apiRequest<any>("/payments", {
      method: "POST",
      body: JSON.stringify({ bookingId, amount, method }),
    }),
};

export const inspectorApi = {
  validateTicket: (qrPayload: string, inspectorId?: string) =>
    apiRequest<any>("/inspector/validate-ticket", {
      method: "POST",
      body: JSON.stringify({ qrPayload, inspectorId }),
    }),
};
