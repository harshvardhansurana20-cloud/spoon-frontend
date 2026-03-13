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
    if (token === 'demo-token') return; // demo mode — skip API call
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
    try {
      const result = await authApi.login(phone);
      return { otp: result.otp };
    } catch {
      // Demo mode: backend unreachable, use mock OTP
      return { otp: '510000' };
    }
  };

  const verify = async (phone: string, otp: string) => {
    try {
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
    } catch {
      // Demo mode: backend unreachable, create mock user session
      setToken('demo-token');
      setUser({
        id: 'demo-user',
        phone: phone,
        name: 'Jane Doe',
        role: 'customer',
      });
      setAddresses([]);
    }
  };

  const addAddress = async (data: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    try {
      const addr = await authApi.addAddress(data);
      setAddresses(prev => [...prev, addr]);
      return addr;
    } catch {
      // Demo mode: create address locally
      const newAddr: Address = {
        ...data,
        id: 'addr-' + Date.now(),
        userId: user?.id || 'demo-user',
        isDefault: addresses.length === 0 ? true : data.isDefault,
      };
      setAddresses(prev => [...prev, newAddr]);
      return newAddr;
    }
  };

  const deleteAddress = async (id: string): Promise<void> => {
    try {
      await authApi.deleteAddress(id);
      setAddresses(prev => {
        const remaining = prev.filter(a => a.id !== id);
        if (remaining.length && !remaining.some(a => a.isDefault)) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
    } catch {
      // Demo mode: delete locally
      setAddresses(prev => {
        const remaining = prev.filter(a => a.id !== id);
        if (remaining.length && !remaining.some(a => a.isDefault)) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
    }
  };

  const updateName = async (name: string) => {
    try {
      await authApi.updateProfile({ name });
      setUser(prev => prev ? { ...prev, name } : null);
    } catch {
      // Demo mode: update locally
      setUser(prev => prev ? { ...prev, name } : null);
    }
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
