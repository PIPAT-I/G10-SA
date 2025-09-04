import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';
import type {LoginForm} from '../interfaces/Login';
import { login,GetCurrentUser } from '../services/https/Authen';
import type { User } from '../interfaces';

// ===== Types =====
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (credentials: LoginForm) => Promise<{ success: boolean; error?: string; user?: any }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

// ===== Context =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Provider =====
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

const fetchUserLogin = async () => {
    const token = localStorage.getItem("authToken");
    console.log('AuthContext: fetchUserLogin - token:', token);
    
    if (!token) {
      console.log('AuthContext: No token found, setting unauthenticated');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await GetCurrentUser();
      console.log('AuthContext: GetCurrentUser response:', response);
      
      if (response.status === 200) {
        console.log('AuthContext: User authenticated successfully:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log('AuthContext: GetCurrentUser failed, logging out');
        logout();
      }
    } catch (error) {
      console.error('AuthContext: GetCurrentUser error:', error);
      logout();
    }
    
    setIsLoading(false);
  };


    useEffect(() => {
      fetchUserLogin();
    }, []);

const loginUser = async (credentials: LoginForm) => {
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials);
      const response = await login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response?.token) {
        // เก็บ token ใน localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("token_type", response.token_type);
        
        // ดึงข้อมูล user ล่าสุด
        await fetchUserLogin();
        console.log('AuthContext: User data updated after login');
        return { success: true, user: response.user };
      } else {
        console.error('AuthContext: Login failed, no token received:', response);
        message.error(response?.error || 'Login failed');
        return { success: false, error: response?.error || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      message.error('Login failed');
      return { success: false, error: 'Login failed' };
    }
};

 const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    setUser(null);
    setIsAuthenticated(false);
  };

const refreshUser = async () => {
    await fetchUserLogin();
};
return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loginUser,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
