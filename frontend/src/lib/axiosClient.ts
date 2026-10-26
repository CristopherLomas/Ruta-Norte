import axios from "axios";

/**
 * Cliente centralizado de Axios para Ruta Norte 2.0 (Visual Edition)
 * Apunta al backend Spring Boot en http://localhost:8080/api/v1
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para inyectar token si existe en localStorage
if (typeof window !== "undefined") {
  axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("rn_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default axiosClient;
