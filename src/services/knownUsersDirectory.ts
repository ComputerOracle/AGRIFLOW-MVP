// The backend has no endpoint to list users yet (only auth/register,
// auth/login, auth/me — see backend/README.md "Not built yet"), which
// breaks anything that needs to look up users by role — most notably
// logisticsService.getProviders() for the admin's "assign provider" list.
//
// As a stopgap, this caches every public user profile the browser
// actually observes (on register/login/me) into localStorage, keyed by
// id. It's a real directory only for users who have used this browser;
// it will not show a logistics provider who registered on a different
// device and never logged in here. See final report — the real fix is a
// backend GET /users?role= endpoint.

import { storageService, STORE_KEYS } from './storageService';
import type { User, UserRole } from '../types';
import type { ApiUserPublic } from './apiMappers';
import { mapUserPublic } from './apiMappers';

export function rememberUser(raw: ApiUserPublic): void {
  const known = storageService.get<Omit<User, 'passwordHash'>[]>(STORE_KEYS.USERS) ?? [];
  const profile = mapUserPublic(raw);
  const idx = known.findIndex((u) => u.id === profile.id);
  if (idx >= 0) known[idx] = profile;
  else known.push(profile);
  storageService.set(STORE_KEYS.USERS, known);
}

export function getKnownUsersByRole(role: UserRole): Omit<User, 'passwordHash'>[] {
  const known = storageService.get<Omit<User, 'passwordHash'>[]>(STORE_KEYS.USERS) ?? [];
  return known.filter((u) => u.role === role);
}
