import axios from "axios";

/**
 * Cliente centralizado de Axios para Ruta Norte 2.0 (Visual Edition)
 * Arquitectura Híbrida:
 * - En Producción (Vercel): Apunta a '/api/v1' (Route Handlers conectados a Supabase Cloud).
 * - En Local: Intenta Spring Boot en 'http://localhost:8080/api/v1' con fallback automático a '/api/v1'.
 */
const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    // Si estamos en Vercel o cualquier dominio no-localhost
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "/api/v1";
    }
  }
  // En desarrollo local
  return "http://localhost:8080/api/v1";
};

export const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

// Interceptor para inyectar token JWT si existe en localStorage
if (typeof window !== "undefined") {
  axiosClient.interceptors.request.use((config) => {
    // Si estamos en producción o si no se especificó otra base, usar /api/v1
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      config.baseURL = "/api/v1";
    }

    const token = localStorage.getItem("rn_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor de respuesta con fallback automático a /api/v1 si localhost:8080 falla
  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        !originalRequest._retry &&
        originalRequest.baseURL?.includes("localhost:8080") &&
        (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
      ) {
        originalRequest._retry = true;
        originalRequest.baseURL = "/api/v1";
        return axiosClient(originalRequest);
      }
      return Promise.reject(error);
    }
  );
}

export default axiosClient;
