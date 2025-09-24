import { apiClient } from './client';
import type {
  MenuCategory,
  MenuCategoryFilters,
  MenuCategoryCreateData,
  MenuCategoryUpdateData,
} from '../../hooks/useMenuCategories';
import type {
  MenuItem,
  MenuItemFilters,
  MenuItemCreateData,
  MenuItemUpdateData,
  WarehouseMenuItemData,
  MenuItemAvailability,
} from '../../hooks/useMenuItems';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  categories?: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const menuApi = {
  // === КАТЕГОРИИ МЕНЮ ===
  
  async getMenuCategories(filters: MenuCategoryFilters = {}): Promise<ApiResponse<PaginatedResponse<MenuCategory>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/menu/categories?${params.toString()}`);
    return response.data;
  },

  async getMenuCategoryById(id: number): Promise<ApiResponse<MenuCategory>> {
    const response = await apiClient.get(`/menu/categories/${id}`);
    return response.data;
  },

  async createMenuCategory(data: MenuCategoryCreateData): Promise<ApiResponse<MenuCategory>> {
    const response = await apiClient.post('/menu/categories', data);
    return response.data;
  },

  async updateMenuCategory(id: number, data: MenuCategoryUpdateData): Promise<ApiResponse<MenuCategory>> {
    const response = await apiClient.put(`/menu/categories/${id}`, data);
    return response.data;
  },

  async deleteMenuCategory(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/menu/categories/${id}`);
    return response.data;
  },

  // === ПОЗИЦИИ МЕНЮ ===

  async getMenuItems(filters: MenuItemFilters = {}): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.recipeId) params.append('recipeId', filters.recipeId.toString());
    if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
    if (filters.warehouseId) params.append('warehouseId', filters.warehouseId.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/menu/items?${params.toString()}`);
    return response.data;
  },

  async getMenuItemById(id: number): Promise<ApiResponse<MenuItem>> {
    const response = await apiClient.get(`/menu/items/${id}`);
    return response.data;
  },

  async createMenuItem(data: MenuItemCreateData): Promise<ApiResponse<MenuItem>> {
    const response = await apiClient.post('/menu/items', data);
    return response.data;
  },

  async updateMenuItem(id: number, data: MenuItemUpdateData): Promise<ApiResponse<MenuItem>> {
    const response = await apiClient.put(`/menu/items/${id}`, data);
    return response.data;
  },

  async deleteMenuItem(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/menu/items/${id}`);
    return response.data;
  },

  // === НАСТРОЙКИ МЕНЮ ПО СКЛАДАМ ===

  async setWarehouseMenuItem(data: WarehouseMenuItemData): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/menu/warehouse-items', data);
    return response.data;
  },

  async getWarehouseMenuItems(warehouseId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/menu/warehouses/${warehouseId}/items`);
    return response.data;
  },

  async removeWarehouseMenuItem(warehouseId: number, menuItemId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/menu/warehouses/${warehouseId}/items/${menuItemId}`);
    return response.data;
  },

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(warehouseId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/menu/warehouses/${warehouseId}/available`);
    return response.data;
  },

  async checkMenuItemAvailability(
    menuItemId: number,
    warehouseId: number,
    quantity: number = 1
  ): Promise<ApiResponse<MenuItemAvailability>> {
    const params = new URLSearchParams();
    if (quantity !== 1) params.append('quantity', quantity.toString());

    const response = await apiClient.get(
      `/menu/items/${menuItemId}/availability/${warehouseId}?${params.toString()}`
    );
    return response.data;
  },
};
