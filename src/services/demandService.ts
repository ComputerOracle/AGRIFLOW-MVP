import type { DemandRequest, CommodityType, QualityGrade } from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { auditService } from './auditService';

function generateId(): string {
  const n = String(Date.now()).slice(-5);
  return `DEM-AGF-${n}`;
}

export const demandService = {
  async create(params: {
    buyerId: string;
    buyerName: string;
    commodity: CommodityType;
    quantity: number;
    unit: string;
    qualityGrade: QualityGrade;
    destinationLocation: string;
    requiredByDate: string;
    indicativeBudget: number;
    currency: string;
    notes?: string;
  }): Promise<DemandRequest> {
    await delay(500);
    const now = new Date().toISOString();
    const demand: DemandRequest = {
      id: generateId(),
      ...params,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    const all = storageService.get<DemandRequest[]>(STORE_KEYS.DEMANDS) ?? [];
    all.push(demand);
    storageService.set(STORE_KEYS.DEMANDS, all);
    auditService.log({
      action: 'demand_created',
      actorId: params.buyerId,
      actorName: params.buyerName,
      actorRole: 'buyer',
      entityId: demand.id,
      entityType: 'DemandRequest',
      detail: `Demand for ${params.quantity} ${params.unit} of ${params.commodity}, delivery to ${params.destinationLocation}.`,
    });
    return demand;
  },

  getAll(): DemandRequest[] {
    return storageService.get<DemandRequest[]>(STORE_KEYS.DEMANDS) ?? [];
  },

  getById(id: string): DemandRequest | null {
    return this.getAll().find((d) => d.id === id) ?? null;
  },

  getForBuyer(buyerId: string): DemandRequest[] {
    return this.getAll().filter((d) => d.buyerId === buyerId);
  },

  getByBuyer(buyerId: string): DemandRequest[] {
    return this.getForBuyer(buyerId);
  },

  async updateStatus(demandId: string, status: DemandRequest['status']): Promise<void> {
    const all = storageService.get<DemandRequest[]>(STORE_KEYS.DEMANDS) ?? [];
    const idx = all.findIndex((d) => d.id === demandId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
      storageService.set(STORE_KEYS.DEMANDS, all);
    }
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
