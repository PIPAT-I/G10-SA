import { apiClient } from "./API";
import type { LoginForm } from "../../interfaces/Login";

export async function login(data: LoginForm) {
  try {
    console.log('🔐 Login request:', data);
    const response = await apiClient.post("/api/login", data);
    console.log('✅ Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Login API Error:', error);
    return error.response?.data || { error: 'Network error' };
  }
}

export async function GetCurrentUser() {
  try {
    console.log('📡 GetCurrentUser request');
    const response = await apiClient.get("/api/currentuser");
    
    console.log('✅ GetCurrentUser raw response:');
    console.log('  Status:', response.status);
    console.log('  Data:', response.data);
    console.log('  Data type:', typeof response.data);
    
    // แปลง response ให้ถูกต้อง
    let userData = response.data;
    
    // ถ้า backend ส่งมาเป็น { user: {...} } ให้ extract user ออกมา
    if (userData && typeof userData === 'object' && userData.user) {
      console.log('📤 Extracting user from wrapper object');
      userData = userData.user;
    }
    
    console.log('✅ Final user data:', userData);
    
    return {
      status: response.status,
      data: userData
    };
  } catch (error: any) {
    console.error('❌ GetCurrentUser API Error:', error);
    console.error('  Status:', error.response?.status);
    console.error('  Data:', error.response?.data);
    
    return {
      status: error.response?.status || 500,
      data: null,
      error: error.response?.data || { error: 'Network error' }
    };
  }
}