import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      // First attempt to refresh token via httpOnly cookie on load
      const refreshRes = await api.post('/auth/refresh');
      if (refreshRes.data?.data?.accessToken) {
        const newToken = refreshRes.data.data.accessToken;
        setToken(newToken);
        setAccessToken(newToken);
        setUser(refreshRes.data.data.user);
      }
    } catch {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;
    setUser(userData);
    setToken(accessToken);
    setAccessToken(accessToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, accessToken } = res.data.data;
    setUser(userData);
    setToken(accessToken);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
