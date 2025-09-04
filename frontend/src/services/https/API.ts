import axios from "axios";

const apibackend = "http://localhost:8088";

export const apiClient = axios.create({
  baseURL: apibackend,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  if (token && tokenType) {
    config.headers.Authorization = `${tokenType} ${token}`;
  }

  return config;
});
    