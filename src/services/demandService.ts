import type { DemandRequest, CommodityType, QualityGrade } from '../types';
import { apiClient } from './apiClient';
import { mapDemand, type ApiDemandRequest } from './apiMappers';

export const demandService = {
  async create(params: {
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
    const raw = await apiClient.post<ApiDemandRequest>('/demands', params);
    return mapDemand(raw);
  },

  async getAll(): Promise<DemandRequest[]> {
    const raw = await apiClient.get<ApiDemandRequest[]>('/demands', { status: 'open' });
    return raw.map(mapDemand);
  },

  async getById(id: string): Promise<DemandRequest | null> {
    try {
      const raw = await apiClient.get<ApiDemandRequest>(`/demands/${id}`);
      return mapDemand(raw);
    } catch {
      return null;
    }
  },

  async getForBuyer(): Promise<DemandRequest[]> {
    const raw = await apiClient.get<ApiDemandRequest[]>('/demands/mine');
    return raw.map(mapDemand);
  },

  async getByBuyer(): Promise<DemandRequest[]> {
    return this.getForBuyer();
  },
};
