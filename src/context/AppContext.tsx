import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthSession, Notification, UserRole } from '../types';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { storageService, STORE_KEYS } from '../services/storageService';
import { seedInitialData } from '../services/seedService';

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationName?: string;
  phone?: string;
  location?: string;
}

interface AppContextValue {
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
  login: (email: string, pw: string) => Promise<AuthSession>;
  register: (params: RegisterParams) => Promise<AuthSession>;
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => void;
  logout: () => void;
  farmerMode: boolean;
  setFarmerMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => authService.getSession());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [farmerMode, setFarmerModeState] = useState<boolean>(() => {
    try { return localStorage.getItem('agriflow_farmerMode') === 'true'; } catch { return false; }
  });

  const setFarmerMode = useCallback((v: boolean) => {
    setFarmerModeState(v);
    try { localStorage.setItem('agriflow_farmerMode', String(v)); } catch {}
  }, []);

  // Seed on first load
  useEffect(() => {
    const seeded = storageService.get<boolean>(STORE_KEYS.SEEDED);
    if (!seeded) seedInitialData();
  }, []);

  const refreshNotifications = useCallback(() => {
    if (session) {
      setNotifications(notificationService.getForUser(session.userId));
    } else {
      setNotifications([]);
    }
  }, [session]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const setSession = useCallback((s: AuthSession | null) => {
    setSessionState(s);
    if (!s) {
      setNotifications([]);
    }
  }, []);

  const login = useCallback(async (email: string, pw: string) => {
    const s = await authService.login(email, pw);
    setSession(s);
    return s;
  }, [setSession]);

  const register = useCallback(async (params: RegisterParams) => {
    const s = await authService.register(params);
    setSession(s);
    return s;
  }, [setSession]);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, [setSession]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
        login,
        register,
        notifications,
        unreadCount,
        refreshNotifications,
        logout,
        farmerMode,
        setFarmerMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
