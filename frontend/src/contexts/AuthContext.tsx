import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role?: string; research_interests?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('scholarpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('scholarpulse_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('scholarpulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const loginDemo = async () => {
    await login('demo@scholarpulse.edu', 'Demo1234!');
  };

  const register = async (data: { email: string; password: string; full_name: string; role?: string; research_interests?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('scholarpulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('scholarpulse_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await api.updateProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginDemo, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
