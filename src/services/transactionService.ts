import type {
  Transaction, TransactionStatus, UserRole, SupplyListing, DemandRequest
} from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { canActorTransition } from './transactionStateMachine';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

function generateId(): string {
  const n = String(Math.floor(Math.random() * 90000) + 10000);
  return `TXN-AGF-${n}`;
}

export const transactionService = {
  async create(params: {
    listing: SupplyListing;
    demand?: DemandRequest;
    buyerId: string;
    buyerName: string;
    quantity: number;
    deliveryLocation: string;
    expectedDeliveryDate: string;
  }): Promise<Transaction> {
    await delay(600);
    const now = new Date().toISOString();
    const txn: Transaction = {
      id: generateId(),
      listingId: params.listing.id,
      demandId: params.demand?.id,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      supplierId: params.listing.supplierId,
      supplierName: params.listing.supplierName,
      commodity: params.listing.commodity,
      quantity: params.quantity,
      unit: params.listing.unit,
      qualityGrade: params.listing.qualityGrade,
      pricePerUnit: params.listing.pricePerUnit,
      totalAmount: params.quantity * params.listing.pricePerUnit,
      currency: params.listing.currency,
      pickupLocation: params.listing.location,
      deliveryLocation: params.deliveryLocation,
      expectedDeliveryDate: params.expectedDeliveryDate,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          timestamp: now,
          actor: params.buyerName,
          actorRole: 'buyer',
          note: 'Transaction initiated by buyer.',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const all = storageService.get<Transaction[]>(STORE_KEYS.TRANSACTIONS) ?? [];
    all.push(txn);
    storageService.set(STORE_KEYS.TRANSACTIONS, all);

    auditService.log({
      action: 'transaction_initiated',
      actorId: params.buyerId,
      actorName: params.buyerName,
      actorRole: 'buyer',
      entityId: txn.id,
      entityType: 'Transaction',
      transactionId: txn.id,
      detail: `Transaction ${txn.id} initiated for ${params.quantity} ${params.listing.unit} of ${params.listing.commodity}. Value: ₦${txn.totalAmount.toLocaleString()}.`,
    });

    notificationService.create({
      userId: params.listing.supplierId,
      type: 'transaction_request',
      title: 'New Transaction Request',
      message: `${params.buyerName} has initiated a transaction for ${params.quantity} ${params.listing.unit} of ${params.listing.commodity}. Reference: ${txn.id}`,
      transactionId: txn.id,
    });

    return txn;
  },

  async transition(params: {
    transactionId: string;
    to: TransactionStatus;
    actorId: string;
    actorName: string;
    actorRole: UserRole | 'system';
    note?: string;
  }): Promise<Transaction> {
    await delay(400);
    const all = storageService.get<Transaction[]>(STORE_KEYS.TRANSACTIONS) ?? [];
    const idx = all.findIndex((t) => t.id === params.transactionId);
    if (idx < 0) throw new Error('Transaction not found.');
    const txn = all[idx];

    const { allowed, reason } = canActorTransition(txn.status, params.to, params.actorRole);
    if (!allowed) throw new Error(reason ?? 'Transition not allowed.');

    const now = new Date().toISOString();
    const updated: Transaction = {
      ...txn,
      status: params.to,
      updatedAt: now,
      history: [
        ...txn.history,
        {
          status: params.to,
          timestamp: now,
          actor: params.actorName,
          actorRole: params.actorRole,
          note: params.note,
        },
      ],
    };

    all[idx] = updated;
    storageService.set(STORE_KEYS.TRANSACTIONS, all);

    this._emitSideEffects(txn, updated, params.actorId, params.actorName, params.actorRole);

    return updated;
  },

  _emitSideEffects(
    _prev: Transaction,
    updated: Transaction,
    actorId: string,
    actorName: string,
    actorRole: UserRole | 'system'
  ): void {
    const id = updated.id;
    const status = updated.status;

    const auditActions: Partial<Record<TransactionStatus, Parameters<typeof auditService.log>[0]>> = {
      ACCEPTED: {
        action: 'transaction_accepted', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Supplier accepted transaction ${id}.`,
      },
      REJECTED: {
        action: 'transaction_rejected', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Supplier rejected transaction ${id}.`,
      },
      PAYMENT_CONFIRMED: {
        action: 'payment_confirmed', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Payment confirmed for transaction ${id}.`,
      },
      PAYMENT_FAILED: {
        action: 'payment_failed', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Payment failed for transaction ${id}.`,
      },
      LOGISTICS_PENDING: {
        action: 'logistics_job_created', actorId: 'system', actorName: 'AgriFlow System', actorRole: 'system',
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Logistics job created for transaction ${id}.`,
      },
      LOGISTICS_ASSIGNED: {
        action: 'logistics_provider_assigned', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Logistics provider assigned to transaction ${id}.`,
      },
      LOGISTICS_ACCEPTED: {
        action: 'logistics_job_accepted', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `${actorName} accepted logistics job for transaction ${id}.`,
      },
      READY_FOR_PICKUP: {
        action: 'shipment_ready', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Shipment ready for pickup. Transaction ${id}.`,
      },
      PICKED_UP: {
        action: 'shipment_picked_up', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Shipment picked up from ${updated.pickupLocation}. Transaction ${id}.`,
      },
      IN_TRANSIT: {
        action: 'shipment_in_transit', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Shipment in transit to ${updated.deliveryLocation}. Transaction ${id}.`,
      },
      DELIVERED: {
        action: 'shipment_delivered', actorId, actorName, actorRole,
        entityId: id, entityType: 'LogisticsJob', transactionId: id,
        detail: `Shipment delivered at ${updated.deliveryLocation}. Transaction ${id}.`,
      },
      DELIVERY_CONFIRMED: {
        action: 'delivery_confirmed', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Buyer confirmed delivery for transaction ${id}.`,
      },
      COMPLETED: {
        action: 'transaction_completed', actorId, actorName, actorRole,
        entityId: id, entityType: 'Transaction', transactionId: id,
        detail: `Transaction ${id} completed successfully.`,
      },
    };

    const auditParams = auditActions[status];
    if (auditParams) auditService.log(auditParams);

    // Notifications
    switch (status) {
      case 'ACCEPTED':
        notificationService.create({
          userId: updated.buyerId, type: 'transaction_accepted',
          title: 'Transaction Accepted',
          message: `Your transaction ${id} has been accepted by ${updated.supplierName}. Please proceed with payment.`,
          transactionId: id,
        });
        break;
      case 'REJECTED':
        notificationService.create({
          userId: updated.buyerId, type: 'transaction_rejected',
          title: 'Transaction Rejected',
          message: `Your transaction request ${id} was rejected by the supplier.`,
          transactionId: id,
        });
        break;
      case 'PAYMENT_CONFIRMED':
        notificationService.create({
          userId: updated.buyerId, type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Payment for transaction ${id} has been confirmed. A logistics job has been created.`,
          transactionId: id,
        });
        notificationService.create({
          userId: 'USR-ADM-001', type: 'logistics_assigned',
          title: 'New Logistics Job Pending',
          message: `Transaction ${id} requires a logistics provider assignment.`,
          transactionId: id,
        });
        break;
      case 'LOGISTICS_ASSIGNED':
        // Notify the provider (we need to look up the job)
        break;
      case 'DELIVERED':
        notificationService.create({
          userId: updated.buyerId, type: 'delivery_received',
          title: 'Shipment Delivered',
          message: `Your shipment for transaction ${id} has been marked delivered. Please confirm receipt.`,
          transactionId: id,
        });
        break;
      case 'DELIVERY_CONFIRMED':
        notificationService.create({
          userId: updated.supplierId, type: 'delivery_confirmed',
          title: 'Delivery Confirmed',
          message: `The buyer has confirmed delivery for transaction ${id}. Transaction is now complete.`,
          transactionId: id,
        });
        break;
      case 'COMPLETED':
        notificationService.create({
          userId: updated.buyerId, type: 'transaction_completed',
          title: 'Transaction Complete',
          message: `Transaction ${id} has been marked complete.`,
          transactionId: id,
        });
        break;
    }
  },

  getAll(): Transaction[] {
    return storageService.get<Transaction[]>(STORE_KEYS.TRANSACTIONS) ?? [];
  },

  getById(id: string): Transaction | null {
    return this.getAll().find((t) => t.id === id) ?? null;
  },

  getForBuyer(buyerId: string): Transaction[] {
    return this.getAll().filter((t) => t.buyerId === buyerId);
  },

  getByBuyer(buyerId: string): Transaction[] {
    return this.getForBuyer(buyerId);
  },

  async initiate(params: {
    listingId: string;
    buyerId: string;
    buyerName: string;
    quantity: number;
    deliveryLocation: string;
    expectedDeliveryDate: string;
  }): Promise<Transaction> {
    const listing = storageService.get<SupplyListing[]>(STORE_KEYS.LISTINGS)?.find((l) => l.id === params.listingId);
    if (!listing) throw new Error('Listing not found');
    return this.create({
      listing,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      quantity: params.quantity,
      deliveryLocation: params.deliveryLocation,
      expectedDeliveryDate: params.expectedDeliveryDate,
    });
  },

  getForSupplier(supplierId: string): Transaction[] {
    return this.getAll().filter((t) => t.supplierId === supplierId);
  },

  updateField<K extends keyof Transaction>(id: string, key: K, value: Transaction[K]): void {
    const all = storageService.get<Transaction[]>(STORE_KEYS.TRANSACTIONS) ?? [];
    const idx = all.findIndex((t) => t.id === id);
    if (idx >= 0) {
      (all[idx] as any)[key] = value;
      all[idx].updatedAt = new Date().toISOString();
      storageService.set(STORE_KEYS.TRANSACTIONS, all);
    }
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
