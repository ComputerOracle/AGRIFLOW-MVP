import type { Dispute } from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { transactionService } from './transactionService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

function generateId(): string {
  return `DIS-AGF-${String(Date.now()).slice(-5)}`;
}

export const disputeService = {
  async raise(params: {
    transactionId: string;
    raisedById: string;
    raisedByName: string;
    reason: string;
    description: string;
  }): Promise<Dispute> {
    await delay(500);
    const now = new Date().toISOString();
    const dispute: Dispute = {
      id: generateId(),
      transactionId: params.transactionId,
      raisedById: params.raisedById,
      raisedByName: params.raisedByName,
      reason: params.reason,
      description: params.description,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    const all = storageService.get<Dispute[]>(STORE_KEYS.DISPUTES) ?? [];
    all.push(dispute);
    storageService.set(STORE_KEYS.DISPUTES, all);

    // Transition transaction to DISPUTED
    await transactionService.transition({
      transactionId: params.transactionId,
      to: 'DISPUTED',
      actorId: params.raisedById,
      actorName: params.raisedByName,
      actorRole: 'buyer',
      note: `Dispute raised: ${params.reason}`,
    });

    auditService.log({
      action: 'dispute_raised',
      actorId: params.raisedById,
      actorName: params.raisedByName,
      actorRole: 'buyer',
      entityId: dispute.id,
      entityType: 'Dispute',
      transactionId: params.transactionId,
      detail: `Dispute ${dispute.id} raised. Reason: ${params.reason}`,
    });

    notificationService.create({
      userId: 'USR-ADM-001',
      type: 'dispute_raised',
      title: 'Dispute Raised',
      message: `A dispute has been raised on transaction ${params.transactionId}. Reason: ${params.reason}`,
      transactionId: params.transactionId,
    });

    return dispute;
  },

  async resolve(params: {
    disputeId: string;
    adminId: string;
    adminName: string;
    decision: string;
    outcome: 'completed' | 'cancelled';
  }): Promise<Dispute> {
    await delay(500);
    const all = storageService.get<Dispute[]>(STORE_KEYS.DISPUTES) ?? [];
    const idx = all.findIndex((d) => d.id === params.disputeId);
    if (idx < 0) throw new Error('Dispute not found.');
    const dispute = all[idx];

    const now = new Date().toISOString();
    const updated: Dispute = {
      ...dispute,
      status: 'RESOLVED',
      resolution: params.decision,
      resolvedById: params.adminId,
      resolvedByName: params.adminName,
      resolvedAt: now,
      updatedAt: now,
    };
    all[idx] = updated;
    storageService.set(STORE_KEYS.DISPUTES, all);

    const txnStatus = params.outcome === 'completed' ? 'COMPLETED' : 'CANCELLED';
    await transactionService.transition({
      transactionId: dispute.transactionId,
      to: txnStatus,
      actorId: params.adminId,
      actorName: params.adminName,
      actorRole: 'admin',
      note: `Dispute resolved: ${params.decision}`,
    });

    auditService.log({
      action: 'dispute_resolved',
      actorId: params.adminId,
      actorName: params.adminName,
      actorRole: 'admin',
      entityId: params.disputeId,
      entityType: 'Dispute',
      transactionId: dispute.transactionId,
      detail: `Dispute ${params.disputeId} resolved. Decision: ${params.decision}. Outcome: ${txnStatus}.`,
    });

    return updated;
  },

  getAll(): Dispute[] {
    return storageService.get<Dispute[]>(STORE_KEYS.DISPUTES) ?? [];
  },

  getById(id: string): Dispute | null {
    return this.getAll().find((d) => d.id === id) ?? null;
  },

  getForTransaction(transactionId: string): Dispute | null {
    return this.getAll().find((d) => d.transactionId === transactionId) ?? null;
  },

  getOpen(): Dispute[] {
    return this.getAll().filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
