import { apiClient } from './client';

export interface LowStockItem {
  id: number;
  productId: number;
  productName: string;
  productArticle?: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  unitShortName: string;
  threshold: number;
}

export interface LowStockResponse {
  data: LowStockItem[];
  total: number;
}

export const lowStockApi = {
  // Получить товары с низкими остатками
  getLowStockItems: async (threshold?: number): Promise<LowStockResponse> => {
    const response = await apiClient.get('/low-stock', { 
      params: threshold ? { threshold } : undefined 
    });
    return response.data;
  },
};
