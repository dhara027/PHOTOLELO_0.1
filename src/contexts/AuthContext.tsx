import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/api/apiClient';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, mobile_no: string, password: string, confirmpassword: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Listen for token removal events from API interceptor
  useEffect(() => {
    const handleTokenRemoved = () => {
      setToken(null);
    };

    window.addEventListener('token-removed', handleTokenRemoved);
    return () => window.removeEventListener('token-removed', handleTokenRemoved);
  }, []);

  const signup = async (email: string, mobile_no: string, password: string, confirmpassword: string) => {
    const response = await apiClient.post('/api/auth/signup', {
      email,
      mobile_no,
      password,
      confirmpassword,
    });
    return response.data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await apiClient.post('/api/auth/verify-otp', {
      email,
      otp,
    });
    // If backend returns token after OTP verification, save it
    if (response.data.token) {
      const token = response.data.token;
      setToken(token);
      localStorage.setItem('token', token);
    }
    return response.data;
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      const token = response.data.token;
      setToken(token);
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        isAuthenticated: !!token,
        signup,
        verifyOtp,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
