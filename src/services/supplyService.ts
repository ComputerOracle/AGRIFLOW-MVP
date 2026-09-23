import type { SupplyListing, ListingStatus, CommodityType, QualityGrade } from '../types';
import { apiClient } from './apiClient';
import { mapListing, type ApiSupplyListing } from './apiMappers';

export const supplyService = {
  async create(params: {
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
    const raw = await apiClient.post<ApiSupplyListing>('/listings', params);
    return mapListing(raw);
  },

  async update(listingId: string, updates: Partial<Pick<SupplyListing, 'quantity' | 'pricePerUnit' | 'description' | 'status'>>): Promise<SupplyListing> {
    const raw = await apiClient.patch<ApiSupplyListing>(`/listings/${listingId}`, updates);
    return mapListing(raw);
  },

  async setStatus(listingId: string, status: ListingStatus): Promise<SupplyListing> {
    return this.update(listingId, { status });
  },

  async getAll(): Promise<SupplyListing[]> {
    const raw = await apiClient.get<ApiSupplyListing[]>('/listings', { status: 'active' });
    return raw.map(mapListing);
  },

  async getActive(): Promise<SupplyListing[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<SupplyListing | null> {
    try {
      const raw = await apiClient.get<ApiSupplyListing>(`/listings/${id}`);
      return mapListing(raw);
    } catch {
      return null;
    }
  },

  async getForSupplier(): Promise<SupplyListing[]> {
    const raw = await apiClient.get<ApiSupplyListing[]>('/listings/mine');
    return raw.map(mapListing);
  },
};
