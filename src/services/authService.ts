import type { User, AuthSession, UserRole } from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { apiClient, setToken } from './apiClient';
import { mapAuthResponse, mapUserPublic, type ApiAuthResponse, type ApiUserPublic } from './apiMappers';

export const authService = {
  async register(params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organizationName?: string;
    phone?: string;
    location?: string;
  }): Promise<AuthSession> {
    const resp = await apiClient.post<ApiAuthResponse>('/auth/register', params);
    const { session, token } = mapAuthResponse(resp);
    setToken(token);
    storageService.set(STORE_KEYS.SESSION, session);
    return session;
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const resp = await apiClient.post<ApiAuthResponse>('/auth/login', { email, password });
    const { session, token } = mapAuthResponse(resp);
    setToken(token);
    storageService.set(STORE_KEYS.SESSION, session);
    return session;
  },

  logout(): void {
    storageService.remove(STORE_KEYS.SESSION);
    storageService.remove(STORE_KEYS.TOKEN);
  },

  getSession(): AuthSession | null {
    return storageService.get<AuthSession>(STORE_KEYS.SESSION);
  },

  async getCurrentUser(): Promise<Omit<User, 'passwordHash'> | null> {
    const session = this.getSession();
    if (!session) return null;
    const raw = await apiClient.get<ApiUserPublic>('/auth/me');
    return mapUserPublic(raw);
  },
};
