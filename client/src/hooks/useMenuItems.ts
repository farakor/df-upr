import { useState, useEffect } from 'react';
import { menuApi } from '../services/api/menu';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  recipeId?: number;
  categoryId?: number;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
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
  categoryId?: number;
  recipeId?: number;
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
  name: string;
  description?: string;
  recipeId?: number;
  categoryId?: number;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  sortOrder?: number;
}

export interface MenuItemUpdateData {
  name?: string;
  description?: string;
  recipeId?: number | null;
  categoryId?: number | null;
  price?: number;
  costPrice?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface WarehouseMenuItemData {
  warehouseId: number;
  menuItemId: number;
  isAvailable?: boolean;
  priceOverride?: number | null;
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

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async (filters: MenuItemFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenuItems(filters);
      if (response.success) {
        setItems(response.data.items);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError('Ошибка загрузки позиций меню');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки позиций меню');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: MenuItemCreateData): Promise<MenuItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.createMenuItem(data);
      if (response.success) {
        await fetchItems(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка создания позиции меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания позиции меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, data: MenuItemUpdateData): Promise<MenuItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.updateMenuItem(id, data);
      if (response.success) {
        await fetchItems(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка обновления позиции меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления позиции меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.deleteMenuItem(id);
      if (response.success) {
        await fetchItems(); // Обновляем список
        return true;
      } else {
        setError('Ошибка удаления позиции меню');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции меню');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getItemById = async (id: number): Promise<MenuItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenuItemById(id);
      if (response.success) {
        return response.data;
      } else {
        setError('Ошибка загрузки позиции меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки позиции меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setWarehouseMenuItem = async (data: WarehouseMenuItemData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.setWarehouseMenuItem(data);
      if (response.success) {
        return true;
      } else {
        setError('Ошибка настройки позиции меню для склада');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка настройки позиции меню для склада');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseMenuItems = async (warehouseId: number): Promise<MenuItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getWarehouseMenuItems(warehouseId);
      if (response.success) {
        return response.data.map((item: any) => item.menuItem);
      } else {
        setError('Ошибка загрузки настроек меню для склада');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки настроек меню для склада');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const removeWarehouseMenuItem = async (warehouseId: number, menuItemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.removeWarehouseMenuItem(warehouseId, menuItemId);
      if (response.success) {
        return true;
      } else {
        setError('Ошибка удаления настройки позиции меню для склада');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления настройки позиции меню для склада');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableMenu = async (warehouseId: number): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getAvailableMenu(warehouseId);
      if (response.success) {
        return response.data;
      } else {
        setError('Ошибка загрузки доступного меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки доступного меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkItemAvailability = async (
    menuItemId: number,
    warehouseId: number,
    quantity: number = 1
  ): Promise<MenuItemAvailability | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.checkMenuItemAvailability(menuItemId, warehouseId, quantity);
      if (response.success) {
        return response.data;
      } else {
        setError('Ошибка проверки доступности блюда');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка проверки доступности блюда');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItemById,
    setWarehouseMenuItem,
    getWarehouseMenuItems,
    removeWarehouseMenuItem,
    getAvailableMenu,
    checkItemAvailability,
  };
};
