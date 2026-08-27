import type { Notification, NotificationType } from '../types';
import { storageService, STORE_KEYS } from './storageService';

function generateId(): string {
  return `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export const notificationService = {
  create(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    transactionId?: string;
  }): Notification {
    const notif: Notification = {
      id: generateId(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      transactionId: params.transactionId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const all = storageService.get<Notification[]>(STORE_KEYS.NOTIFICATIONS) ?? [];
    all.push(notif);
    storageService.set(STORE_KEYS.NOTIFICATIONS, all);
    return notif;
  },

  getForUser(userId: string): Notification[] {
    const all = storageService.get<Notification[]>(STORE_KEYS.NOTIFICATIONS) ?? [];
    return all
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markRead(notifId: string): void {
    const all = storageService.get<Notification[]>(STORE_KEYS.NOTIFICATIONS) ?? [];
    const idx = all.findIndex((n) => n.id === notifId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], read: true };
      storageService.set(STORE_KEYS.NOTIFICATIONS, all);
    }
  },

  markAllRead(userId: string): void {
    const all = storageService.get<Notification[]>(STORE_KEYS.NOTIFICATIONS) ?? [];
    const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    storageService.set(STORE_KEYS.NOTIFICATIONS, updated);
  },

  getUnreadCount(userId: string): number {
    return this.getForUser(userId).filter((n) => !n.read).length;
  },
};
