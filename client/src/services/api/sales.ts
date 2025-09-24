import { api } from './client';

export interface SaleItem {
  menuItemId: number;
  quantity: number;
  price?: number;
  discountPercent?: number;
}

export interface CreateSaleRequest {
  warehouseId: number;
  customerName?: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED';
  discountAmount?: number;
  notes?: string;
  items: SaleItem[];
}

export interface Sale {
  id: number;
  number: string;
  date: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  paymentMethod: string;
  customerName?: string;
  notes?: string;
  warehouse: {
    id: number;
    name: string;
  };
  cashier?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  items: {
    id: number;
    quantity: number;
    price: number;
    discountPercent: number;
    total: number;
    menuItem: {
      id: number;
      name: string;
      description?: string;
      imageUrl?: string;
    };
  }[];
}

export interface SalesFilter {
  warehouseId?: number;
  dateFrom?: string;
  dateTo?: string;
  cashierId?: number;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export interface SalesResponse {
  sales: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  isAvailable: boolean;
  availabilityInfo?: {
    maxPortions: number;
    ingredients: {
      productName: string;
      required: number;
      available: number;
      maxPortions: number;
    }[];
  };
}

export interface MenuCategory {
  id: number | null;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface SalesStats {
  period: string;
  totalAmount: number;
  salesCount: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  paymentMethods: Record<string, { count: number; amount: number }>;
  topMenuItems: Array<{ name: string; quantity: number; amount: number }>;
  cashiers: Record<string, { count: number; amount: number }>;
}

export interface CreateProductionLogRequest {
  warehouseId: number;
  recipeId: number;
  quantity: number;
  producedAt?: string;
}

export const salesApi = {
  // Создание продажи
  createSale: (data: CreateSaleRequest) =>
    api.post<{ data: Sale }>('/sales', data),

  // Получение списка продаж
  getSales: (params?: SalesFilter) =>
    api.get<SalesResponse>('/sales', { params }),

  // Получение продажи по ID
  getSaleById: (id: number) =>
    api.get<{ data: Sale }>(`/sales/${id}`),

  // Получение статистики продаж
  getSalesStats: (params: {
    warehouseId?: number;
    dateFrom: string;
    dateTo: string;
    groupBy?: 'day' | 'week' | 'month' | 'cashier' | 'menuItem';
  }) =>
    api.get<{ data: SalesStats[] }>('/sales/stats/analytics', { params }),

  // Получение дневной сводки
  getDailySummary: (params?: { warehouseId?: number; date?: string }) =>
    api.get<{ data: DailySummary }>('/sales/stats/daily-summary', { params }),

  // Получение доступного меню для склада
  getAvailableMenu: (warehouseId: number) =>
    api.get<{ data: MenuCategory[] }>(`/sales/menu/${warehouseId}`),

  // Создание лога производства
  createProductionLog: (data: CreateProductionLogRequest) =>
    api.post('/sales/production-log', data),
};
