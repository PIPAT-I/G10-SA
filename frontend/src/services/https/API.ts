import axios from "axios";

const apibackend = "http://localhost:8088";

export const apiClient = axios.create({
  baseURL: apibackend,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    console.log('🔍 API Request:', config.url);
    console.log('  Token exists:', !!token);
    console.log('  Token type:', tokenType);

    if (token && tokenType) {
      config.headers.Authorization = `${tokenType} ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.log('❌ No token available for request');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - ลบ auto logout
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status);
    console.error('  Error data:', error.response?.data);
    
    // ไม่ลบ token ใน interceptor แล้ว ให้ AuthContext จัดการเอง
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);