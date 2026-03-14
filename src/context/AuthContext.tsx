import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setToken, clearToken, getToken, Address } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  email?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  addresses: Address[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<{ otp?: string }>;
  verify: (phone: string, otp: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  addAddress: (data: Omit<Address, 'id' | 'userId'>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const profile = await authApi.getProfile();
      setUser({
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        role: profile.role,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      });
      setAddresses(profile.addresses || []);
    } catch {
      clearToken();
      setUser(null);
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = async (phone: string) => {
    const result = await authApi.login(phone);
    return { otp: result.otp };
  };

  const verify = async (phone: string, otp: string) => {
    const result = await authApi.verify(phone, otp);
    setToken(result.token);
    setUser({
      id: result.user.id,
      phone: result.user.phone,
      name: result.user.name,
      role: result.user.role,
    });
    try { connectSocket(); } catch {}
    await refreshProfile();
  };

  const addAddress = async (data: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    const addr = await authApi.addAddress(data);
    setAddresses(prev => [...prev, addr]);
    return addr;
  };

  const deleteAddress = async (id: string): Promise<void> => {
    await authApi.deleteAddress(id);
    setAddresses(prev => {
      const remaining = prev.filter(a => a.id !== id);
      if (remaining.length && !remaining.some(a => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const updateName = async (name: string) => {
    await authApi.updateProfile({ name });
    setUser(prev => prev ? { ...prev, name } : null);
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const logout = () => {
    disconnectSocket();
    clearToken();
    setUser(null);
    setAddresses([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        isLoading,
        isAuthenticated: !!user,
        login,
        verify,
        updateName,
        logout,
        refreshProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
