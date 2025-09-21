import { apiClient } from './client';

export interface StockBalance {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  avgPrice: number;
  totalValue: number;
  lastMovementDate?: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    article?: string;
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
    category?: {
      id: number;
      name: string;
    };
  };
}

export interface StockBalancesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface StockBalancesResponse {
  data: StockBalance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const stockBalancesApi = {
  // Получить остатки по складу
  getByWarehouse: async (warehouseId: number, params?: StockBalancesQuery): Promise<StockBalancesResponse> => {
    const response = await apiClient.get(`/warehouses/${warehouseId}/stock-balances`, { params });
    return response.data;
  },
};
