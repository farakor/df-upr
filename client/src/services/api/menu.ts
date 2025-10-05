import { apiClient } from './client';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  categories?: T[];
  menus?: T[];
  total: number;
  page: number;
  totalPages: number;
}

// === ТИПЫ ДЛЯ МЕНЮ ===

export interface Menu {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
}

export interface MenuFilters {
  search?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MenuCreateData {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface MenuUpdateData {
  name?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

// === ТИПЫ ДЛЯ КАТЕГОРИЙ МЕНЮ ===

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
}

export interface MenuCategoryFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MenuCategoryCreateData {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface MenuCategoryUpdateData {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// === ТИПЫ ДЛЯ ПОЗИЦИЙ МЕНЮ ===

export interface MenuItem {
  id: number;
  menuId?: number;
  productId?: number;
  categoryId?: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  menu?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  product?: {
    id: number;
    name: string;
    article?: string;
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
    recipe?: {
      id: number;
      name: string;
      portionSize: number;
      costPrice?: number;
      ingredients: {
        id: number;
        quantity: number;
        product: {
          id: number;
          name: string;
          unit: {
            id: number;
            name: string;
            shortName: string;
          };
        };
        unit: {
          id: number;
          name: string;
          shortName: string;
        };
      }[];
    };
  };
  warehouseMenuItems?: {
    id: number;
    warehouseId: number;
    isAvailable: boolean;
    priceOverride?: number;
    warehouse: {
      id: number;
      name: string;
      type: string;
    };
  }[];
}

export interface MenuItemFilters {
  search?: string;
  menuId?: number;
  categoryId?: number;
  productId?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  warehouseId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MenuItemCreateData {
  menuId?: number;
  productId: number;
  categoryId?: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  sortOrder?: number;
}

export interface MenuItemUpdateData {
  menuId?: number | null;
  productId?: number | null;
  categoryId?: number | null;
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface WarehouseMenuData {
  warehouseId: number;
  menuId: number;
  isActive?: boolean;
}

export interface MenuItemAvailability {
  isAvailable: boolean;
  missingIngredients: {
    productId: number;
    productName: string;
    required: number;
    available: number;
    unit: string;
  }[];
}

export const menuApi = {
  // === МЕНЮ ===
  
  async getMenus(filters: MenuFilters = {}): Promise<ApiResponse<PaginatedResponse<Menu>>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/menu?${params.toString()}`);
    return response.data;
  },

  async getMenuById(id: number): Promise<ApiResponse<Menu>> {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  async createMenu(data: MenuCreateData): Promise<ApiResponse<Menu>> {
    const response = await apiClient.post('/menu', data);
    return response.data;
  },

  async updateMenu(id: number, data: MenuUpdateData): Promise<ApiResponse<Menu>> {
    const response = await apiClient.put(`/menu/${id}`, data);
    return response.data;
  },

  async deleteMenu(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

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
    if (filters.menuId) params.append('menuId', filters.menuId.toString());
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.productId) params.append('productId', filters.productId.toString());
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

  // === ПРИВЯЗКА МЕНЮ К СКЛАДАМ ===

  async addWarehouseMenu(data: WarehouseMenuData): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/menu/warehouse-menus', data);
    return response.data;
  },

  async getWarehouseMenus(warehouseId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/menu/warehouses/${warehouseId}/menus`);
    return response.data;
  },

  async updateWarehouseMenu(
    warehouseId: number,
    menuId: number,
    data: Partial<WarehouseMenuData>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put(
      `/menu/warehouses/${warehouseId}/menus/${menuId}`,
      data
    );
    return response.data;
  },

  async removeWarehouseMenu(warehouseId: number, menuId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/menu/warehouses/${warehouseId}/menus/${menuId}`);
    return response.data;
  },

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(warehouseId: number): Promise<ApiResponse<{ categories: MenuCategory[] }>> {
    const response = await apiClient.get(`/menu/warehouses/${warehouseId}/available`);
    return response.data;
  },

  async checkMenuItemAvailability(
    menuItemId: number,
    warehouseId: number,
    quantity: number = 1
  ): Promise<ApiResponse<MenuItemAvailability>> {
    const params = new URLSearchParams({
      warehouseId: warehouseId.toString(),
      quantity: quantity.toString(),
    });
    const response = await apiClient.get(`/menu/items/${menuItemId}/availability?${params.toString()}`);
    return response.data;
  },
};