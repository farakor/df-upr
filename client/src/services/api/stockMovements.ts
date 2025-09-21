import { apiClient } from './client';

export interface StockMovement {
  id: number;
  warehouseId: number;
  productId: number;
  documentId?: number;
  type: 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'WRITEOFF' | 'PRODUCTION_USE';
  quantity: number;
  price: number;
  batchNumber?: string;
  expiryDate?: string;
  createdAt: string;
  warehouse: {
    id: number;
    name: string;
  };
  product: {
    id: number;
    name: string;
    article?: string;
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
  };
  document?: {
    id: number;
    number: string;
    type: string;
  };
}

export interface StockMovementsQuery {
  page?: number;
  limit?: number;
  warehouseId?: number;
  productId?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const stockMovementsApi = {
  // Получить движения товаров
  getAll: async (params?: StockMovementsQuery): Promise<StockMovementsResponse> => {
    const response = await apiClient.get('/stock-movements', { params });
    return response.data;
  },

  // Получить движения по товару
  getByProduct: async (productId: number, params?: StockMovementsQuery): Promise<StockMovementsResponse> => {
    const response = await apiClient.get(`/products/${productId}/stock-movements`, { params });
    return response.data;
  },

  // Получить движения по складу
  getByWarehouse: async (warehouseId: number, params?: StockMovementsQuery): Promise<StockMovementsResponse> => {
    const response = await apiClient.get(`/warehouses/${warehouseId}/stock-movements`, { params });
    return response.data;
  },
};
