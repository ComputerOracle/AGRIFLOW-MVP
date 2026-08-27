import type { User, AuthSession, UserRole } from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { auditService } from './auditService';
import { hashPassword } from './seedService';

function generateId(role: UserRole): string {
  const prefix = role === 'buyer' ? 'USR-BUY' : role === 'supplier' ? 'USR-SUP' : role === 'logistics' ? 'USR-LOG' : 'USR-ADM';
  return `${prefix}-${String(Date.now()).slice(-6)}`;
}

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
    await delay(300);
    const users = storageService.get<User[]>(STORE_KEYS.USERS) ?? [];
    if (users.find((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const user: User = {
      id: generateId(params.role),
      email: params.email,
      passwordHash: hashPassword(params.password),
      name: params.name,
      role: params.role,
      organizationName: params.organizationName || params.name,
      phone: params.phone,
      location: params.location,
      verified: true,
      profileComplete: true,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    storageService.set(STORE_KEYS.USERS, users);

    auditService.log({
      action: 'user_registered',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityId: user.id,
      entityType: 'User',
      detail: `${user.name} registered as ${user.role}.`,
    });

    const session: AuthSession = { userId: user.id, role: user.role, name: user.name, email: user.email };
    storageService.set(STORE_KEYS.SESSION, session);
    return session;
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await delay(250);
    const users = storageService.get<User[]>(STORE_KEYS.USERS) ?? [];
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    const session: AuthSession = { userId: user.id, role: user.role, name: user.name, email: user.email };
    storageService.set(STORE_KEYS.SESSION, session);
    return session;
  },

  logout(): void {
    storageService.remove(STORE_KEYS.SESSION);
  },

  getSession(): AuthSession | null {
    return storageService.get<AuthSession>(STORE_KEYS.SESSION);
  },

  getCurrentUser(): User | null {
    const session = this.getSession();
    if (!session) return null;
    const users = storageService.get<User[]>(STORE_KEYS.USERS) ?? [];
    return users.find((u) => u.id === session.userId) ?? null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const users = storageService.get<User[]>(STORE_KEYS.USERS) ?? [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error('User not found.');
    const updated = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    users[idx] = updated;
    storageService.set(STORE_KEYS.USERS, users);
    return updated;
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
