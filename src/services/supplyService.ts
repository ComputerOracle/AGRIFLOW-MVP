import type { SupplyListing, ListingStatus, CommodityType, QualityGrade } from '../types';
import { storageService, STORE_KEYS } from './storageService';
import { auditService } from './auditService';

function generateId(): string {
  const n = String(Date.now()).slice(-5);
  return `SUP-AGF-${n}`;
}

export const supplyService = {
  async create(params: {
    supplierId: string;
    supplierName: string;
    supplierVerified: boolean;
    commodity: CommodityType;
    quantity: number;
    unit: string;
    qualityGrade: QualityGrade;
    pricePerUnit: number;
    currency: string;
    location: string;
    availabilityDate: string;
    description: string;
  }): Promise<SupplyListing> {
    await delay(500);
    const now = new Date().toISOString();
    const listing: SupplyListing = {
      id: generateId(),
      ...params,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const all = storageService.get<SupplyListing[]>(STORE_KEYS.LISTINGS) ?? [];
    all.push(listing);
    storageService.set(STORE_KEYS.LISTINGS, all);
    auditService.log({
      action: 'supply_created',
      actorId: params.supplierId,
      actorName: params.supplierName,
      actorRole: 'supplier',
      entityId: listing.id,
      entityType: 'SupplyListing',
      detail: `${params.quantity} ${params.unit} of ${params.commodity} listed at ₦${params.pricePerUnit.toLocaleString()}/${params.unit}.`,
    });
    return listing;
  },

  async update(listingId: string, supplierId: string, updates: Partial<SupplyListing>): Promise<SupplyListing> {
    await delay(400);
    const all = storageService.get<SupplyListing[]>(STORE_KEYS.LISTINGS) ?? [];
    const idx = all.findIndex((l) => l.id === listingId);
    if (idx < 0) throw new Error('Listing not found.');
    if (all[idx].supplierId !== supplierId) throw new Error('Unauthorized: you do not own this listing.');
    const updated = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    storageService.set(STORE_KEYS.LISTINGS, all);
    auditService.log({
      action: 'supply_updated',
      actorId: supplierId,
      actorName: all[idx].supplierName,
      actorRole: 'supplier',
      entityId: listingId,
      entityType: 'SupplyListing',
      detail: `Listing ${listingId} updated.`,
    });
    return updated;
  },

  async setStatus(listingId: string, supplierId: string, status: ListingStatus): Promise<SupplyListing> {
    return this.update(listingId, supplierId, { status });
  },

  getAll(): SupplyListing[] {
    return storageService.get<SupplyListing[]>(STORE_KEYS.LISTINGS) ?? [];
  },

  getActive(): SupplyListing[] {
    return this.getAll().filter((l) => l.status === 'active');
  },

  getById(id: string): SupplyListing | null {
    return this.getAll().find((l) => l.id === id) ?? null;
  },

  getForSupplier(supplierId: string): SupplyListing[] {
    return this.getAll().filter((l) => l.supplierId === supplierId);
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
