import { apiClient } from "./API";
import type { LoginForm } from "../../interfaces/Login"



export async function login(data: LoginForm) {
  return await apiClient
  .post("/api/login", data)
  .then(response => response.data)
  .catch(error => {
    console.error('Login API Error:', error);
    return error.response?.data || { error: 'Network error' };
  });
}


export async function GetCurrentUser() {
  return await apiClient
    .get("/api/currentuser")
    .then(response => response.data)
    .catch(error => {
      console.error('GetCurrentUser API Error:', error);
      return error.response?.data || { error: 'Network error' };
    });
}