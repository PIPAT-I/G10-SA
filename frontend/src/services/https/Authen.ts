import { apiClient } from "./API";
import type { LoginForm } from "../../interfaces/Login";

export async function login(data: LoginForm) {
  try {
    const response = await apiClient.post("/api/login", data);
    return response.data;
  } catch (error: any) {
    return error.response?.data || { error: 'Network error' };
  }
}

export async function GetCurrentUser() {
  try {
    const response = await apiClient.get("/api/currentuser");
    
    console.log('GetCurrentUser response:', response.data);
    
    // Backend ส่งมาเป็น { user: {...} }
    let userData = response.data;
    if (userData && userData.user) {
      userData = userData.user;
    }
    
    console.log('Processed userData:', userData);
    
    return {
      status: response.status,
      data: userData
    };
  } catch (error: any) {
    console.log('GetCurrentUser error:', error);
    return {
      status: error.response?.status || 500,
      data: null,
      error: error.response?.data || { error: 'Network error' }
    };
  }
}