import type {
  Transaction, TransactionStatus, UserRole, SupplyListing, DemandRequest
} from '../types';
import { apiClient } from './apiClient';
import { mapTransaction, type ApiTransaction } from './apiMappers';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

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
    const raw = await apiClient.post<ApiTransaction>('/transactions', {
      listingId: params.listing.id,
      demandId: params.demand?.id,
      quantity: params.quantity,
      deliveryLocation: params.deliveryLocation,
      expectedDeliveryDate: params.expectedDeliveryDate,
    });
    const txn = mapTransaction(raw);

    auditService.log({
      action: 'transaction_initiated',
      actorId: txn.buyerId,
      actorName: txn.buyerName,
      actorRole: 'buyer',
      entityId: txn.id,
      entityType: 'Transaction',
      transactionId: txn.id,
      detail: `Transaction ${txn.id} initiated for ${txn.quantity} ${txn.unit} of ${txn.commodity}. Value: ₦${txn.totalAmount.toLocaleString()}.`,
    });

    notificationService.create({
      userId: txn.supplierId,
      type: 'transaction_request',
      title: 'New Transaction Request',
      message: `${txn.buyerName} has initiated a transaction for ${txn.quantity} ${txn.unit} of ${txn.commodity}. Reference: ${txn.id}`,
      transactionId: txn.id,
    });

    return txn;
  },

  async initiate(params: {
    listingId: string;
    buyerId: string;
    buyerName: string;
    quantity: number;
    deliveryLocation: string;
    expectedDeliveryDate: string;
  }): Promise<Transaction> {
    const raw = await apiClient.post<ApiTransaction>('/transactions', {
      listingId: params.listingId,
      quantity: params.quantity,
      deliveryLocation: params.deliveryLocation,
      expectedDeliveryDate: params.expectedDeliveryDate,
    });
    const txn = mapTransaction(raw);

    auditService.log({
      action: 'transaction_initiated',
      actorId: txn.buyerId,
      actorName: txn.buyerName,
      actorRole: 'buyer',
      entityId: txn.id,
      entityType: 'Transaction',
      transactionId: txn.id,
      detail: `Transaction ${txn.id} initiated for ${txn.quantity} ${txn.unit} of ${txn.commodity}. Value: ₦${txn.totalAmount.toLocaleString()}.`,
    });

    notificationService.create({
      userId: txn.supplierId,
      type: 'transaction_request',
      title: 'New Transaction Request',
      message: `${txn.buyerName} has initiated a transaction for ${txn.quantity} ${txn.unit} of ${txn.commodity}. Reference: ${txn.id}`,
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
    const prevRaw = await apiClient.get<ApiTransaction>(`/transactions/${params.transactionId}`);
    const prev = mapTransaction(prevRaw);

    const raw = await apiClient.post<ApiTransaction>(`/transactions/${params.transactionId}/transition`, {
      to: params.to,
      note: params.note,
    });
    const updated = mapTransaction(raw);

    this._emitSideEffects(prev, updated, params.actorId, params.actorName, params.actorRole);

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

  async getAll(): Promise<Transaction[]> {
    const raw = await apiClient.get<ApiTransaction[]>('/transactions');
    return raw.map(mapTransaction);
  },

  async getById(id: string): Promise<Transaction | null> {
    try {
      const raw = await apiClient.get<ApiTransaction>(`/transactions/${id}`);
      return mapTransaction(raw);
    } catch {
      return null;
    }
  },

  // Role-scoping (buyer/supplier/admin) is done server-side based on the JWT —
  // these are thin aliases over the same role-scoped endpoint.
  async getForBuyer(): Promise<Transaction[]> {
    return this.getAll();
  },

  async getByBuyer(): Promise<Transaction[]> {
    return this.getAll();
  },

  async getForSupplier(): Promise<Transaction[]> {
    return this.getAll();
  },
};
