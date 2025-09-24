import { api } from './client';

export interface Inventory {
  id: number;
  warehouseId: number;
  number: string;
  date: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  responsiblePersonId?: number;
  notes?: string;
  createdById?: number;
  approvedById?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  warehouse: {
    id: number;
    name: string;
  };
  responsiblePerson?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  items?: InventoryItem[];
  _count?: {
    items: number;
  };
}

export interface InventoryItem {
  id: number;
  inventoryId: number;
  productId: number;
  expectedQuantity: number;
  actualQuantity?: number;
  price: number;
  notes?: string;
  countedById?: number;
  countedAt?: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    article?: string;
    category?: {
      id: number;
      name: string;
    };
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
  };
  countedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateInventoryData {
  warehouseId: number;
  date: string;
  responsiblePersonId?: number;
  notes?: string;
}

export interface UpdateInventoryData {
  date?: string;
  responsiblePersonId?: number;
  notes?: string;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
}

export interface CreateInventoryItemData {
  productId: number;
  expectedQuantity: number;
  actualQuantity?: number;
  price: number;
  notes?: string;
}

export interface UpdateInventoryItemData {
  actualQuantity?: number;
  notes?: string;
}

export interface InventoryFilters {
  warehouseId?: number;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  dateFrom?: string;
  dateTo?: string;
  responsiblePersonId?: number;
  page?: number;
  limit?: number;
}

export interface GenerateSheetOptions {
  warehouseId: number;
  categoryIds?: number[];
  productIds?: number[];
  includeZeroBalances?: boolean;
}

export interface InventorySheetItem {
  productId: number;
  productName: string;
  categoryName: string;
  unitName: string;
  expectedQuantity: number;
  price: number;
  totalValue: number;
}

export interface VarianceAnalysis {
  totalItems: number;
  itemsWithVariance: number;
  totalVarianceValue: number;
  surplusValue: number;
  shortageValue: number;
  items: InventoryVarianceItem[];
}

export interface InventoryVarianceItem {
  id: number;
  productId: number;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  quantityVariance: number;
  price: number;
  valueVariance: number;
  variancePercent: number;
}

export interface InventoriesResponse {
  inventories: Inventory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API функции для инвентаризации
export const inventoryApi = {
  // Получение списка инвентаризаций
  getInventories: (filters?: InventoryFilters): Promise<InventoriesResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.responsiblePersonId) params.append('responsiblePersonId', filters.responsiblePersonId.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return api.get(`/inventories?${params.toString()}`);
  },

  // Получение инвентаризации по ID
  getInventoryById: (id: number): Promise<Inventory> => {
    return api.get(`/inventories/${id}`);
  },

  // Создание инвентаризации
  createInventory: (data: CreateInventoryData): Promise<Inventory> => {
    return api.post('/inventories', data);
  },

  // Создание инвентаризации с позициями из остатков
  createInventoryFromBalances: (data: CreateInventoryData & GenerateSheetOptions): Promise<Inventory> => {
    return api.post('/inventories/from-balances', data);
  },

  // Обновление инвентаризации
  updateInventory: (id: number, data: UpdateInventoryData): Promise<Inventory> => {
    return api.put(`/inventories/${id}`, data);
  },

  // Удаление инвентаризации
  deleteInventory: (id: number): Promise<void> => {
    return api.delete(`/inventories/${id}`);
  },

  // Генерация инвентаризационной ведомости
  generateInventorySheet: (options: GenerateSheetOptions): Promise<InventorySheetItem[]> => {
    return api.post('/inventories/generate-sheet', options);
  },

  // Добавление позиции в инвентаризацию
  addInventoryItem: (inventoryId: number, data: CreateInventoryItemData): Promise<InventoryItem> => {
    return api.post(`/inventories/${inventoryId}/items`, data);
  },

  // Обновление позиции инвентаризации
  updateInventoryItem: (itemId: number, data: UpdateInventoryItemData): Promise<InventoryItem> => {
    return api.put(`/inventories/items/${itemId}`, data);
  },

  // Массовое обновление позиций
  bulkUpdateInventoryItems: (inventoryId: number, items: Array<{ id: number; actualQuantity: number; notes?: string }>): Promise<InventoryItem[]> => {
    return api.put(`/inventories/${inventoryId}/items/bulk`, { items });
  },

  // Анализ расхождений
  analyzeVariances: (inventoryId: number, varianceThreshold?: number): Promise<VarianceAnalysis> => {
    const params = varianceThreshold ? `?varianceThreshold=${varianceThreshold}` : '';
    return api.get(`/inventories/${inventoryId}/analyze${params}`);
  },

  // Создание корректировочных документов
  createAdjustmentDocuments: (inventoryId: number): Promise<any> => {
    return api.post(`/inventories/${inventoryId}/create-adjustments`);
  },

  // Утверждение инвентаризации
  approveInventory: (inventoryId: number): Promise<Inventory> => {
    return api.post(`/inventories/${inventoryId}/approve`);
  },
};
