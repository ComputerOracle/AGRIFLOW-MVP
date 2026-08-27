import type { AuditEvent, AuditAction, UserRole } from '../types';
import { storageService, STORE_KEYS } from './storageService';

function generateId(): string {
  return `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export const auditService = {
  log(params: {
    action: AuditAction;
    actorId: string;
    actorName: string;
    actorRole: UserRole | 'system';
    entityId?: string;
    entityType?: string;
    detail?: string;
    transactionId?: string;
  }): AuditEvent {
    const event: AuditEvent = {
      id: generateId(),
      action: params.action,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      entityId: params.entityId,
      entityType: params.entityType,
      detail: params.detail,
      transactionId: params.transactionId,
      createdAt: new Date().toISOString(),
    };
    const events = storageService.get<AuditEvent[]>(STORE_KEYS.AUDIT_EVENTS) ?? [];
    events.push(event);
    storageService.set(STORE_KEYS.AUDIT_EVENTS, events);
    return event;
  },

  getAll(): AuditEvent[] {
    const events = storageService.get<AuditEvent[]>(STORE_KEYS.AUDIT_EVENTS) ?? [];
    return [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getForTransaction(transactionId: string): AuditEvent[] {
    const events = storageService.get<AuditEvent[]>(STORE_KEYS.AUDIT_EVENTS) ?? [];
    return events
      .filter((e) => e.transactionId === transactionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
};
