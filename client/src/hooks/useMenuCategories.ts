import { useState, useEffect } from 'react';
import { menuApi } from '../services/api/menu';

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
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

export const useMenuCategories = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCategories = async (filters: MenuCategoryFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenuCategories(filters);
      if (response.success) {
        setCategories(response.data.categories);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError('Ошибка загрузки категорий меню');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий меню');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: MenuCategoryCreateData): Promise<MenuCategory | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.createMenuCategory(data);
      if (response.success) {
        await fetchCategories(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка создания категории меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания категории меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: MenuCategoryUpdateData): Promise<MenuCategory | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.updateMenuCategory(id, data);
      if (response.success) {
        await fetchCategories(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка обновления категории меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления категории меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.deleteMenuCategory(id);
      if (response.success) {
        await fetchCategories(); // Обновляем список
        return true;
      } else {
        setError('Ошибка удаления категории меню');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления категории меню');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: number): Promise<MenuCategory | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenuCategoryById(id);
      if (response.success) {
        return response.data;
      } else {
        setError('Ошибка загрузки категории меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки категории меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
};
