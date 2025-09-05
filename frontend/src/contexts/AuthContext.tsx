import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");
    
    console.log('fetchUserLogin - tokens:', { token: !!token, tokenType });
    
    if (!token || !tokenType) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await GetCurrentUser();
      
      console.log('fetchUserLogin - response:', response);
      
      if (response.status === 200 && response.data) {
        console.log('fetchUserLogin - setting user:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.log('fetchUserLogin - invalid response');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.log('fetchUserLogin - error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
      }
      
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    
    const initAuth = async () => {
      // รอให้ localStorage พร้อม
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchUserLogin();
    };
    
    initAuth();
  }, []);

  const loginUser = async (credentials: LoginForm) => {
    try {
      const response = await login(credentials);
      
      // เช็คหลายรูปแบบของ response
      let token, token_type, userData;
      
      if (response?.data) {
        token = response.data.token;
        token_type = response.data.token_type;
        userData = response.data.user;
      } else {
        token = response?.token;
        token_type = response?.token_type;
        userData = response?.user;
      }
      
      if (token && userData) {
        localStorage.setItem("token", token);
        localStorage.setItem("token_type", token_type || "Bearer");
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid server response' };
      }
    } catch (error) {
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

  // เรียก fetchUserLogin เมื่อ component mount
  useEffect(() => {
    console.log('AuthContext mounted - calling fetchUserLogin');
    fetchUserLogin();
  }, []);

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