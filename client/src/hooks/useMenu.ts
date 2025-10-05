import { useState } from 'react';
import { menuApi, type Menu, type MenuFilters, type MenuCreateData, type MenuUpdateData, type WarehouseMenuData } from '../services/api/menu';

export const useMenu = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMenus = async (filters: MenuFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenus(filters);
      if (response.success && response.data.menus) {
        setMenus(response.data.menus);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setError('Ошибка загрузки меню');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки меню');
    } finally {
      setLoading(false);
    }
  };

  const getMenuById = async (id: number): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getMenuById(id);
      if (response.success) {
        return response.data;
      } else {
        setError('Ошибка загрузки меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMenu = async (data: MenuCreateData): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.createMenu(data);
      if (response.success) {
        await fetchMenus(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка создания меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMenu = async (id: number, data: MenuUpdateData): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.updateMenu(id, data);
      if (response.success) {
        await fetchMenus(); // Обновляем список
        return response.data;
      } else {
        setError('Ошибка обновления меню');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления меню');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.deleteMenu(id);
      if (response.success) {
        await fetchMenus(); // Обновляем список
        return true;
      } else {
        setError('Ошибка удаления меню');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления меню');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // === ПРИВЯЗКА МЕНЮ К СКЛАДАМ ===

  const addWarehouseMenu = async (data: WarehouseMenuData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.addWarehouseMenu(data);
      if (response.success) {
        return true;
      } else {
        setError('Ошибка привязки меню к складу');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка привязки меню к складу');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseMenus = async (warehouseId: number): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.getWarehouseMenus(warehouseId);
      if (response.success) {
        return response.data || [];
      } else {
        setError('Ошибка загрузки меню склада');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки меню склада');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouseMenu = async (
    warehouseId: number,
    menuId: number,
    data: Partial<WarehouseMenuData>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.updateWarehouseMenu(warehouseId, menuId, data);
      if (response.success) {
        return true;
      } else {
        setError('Ошибка обновления привязки меню');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления привязки меню');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeWarehouseMenu = async (warehouseId: number, menuId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuApi.removeWarehouseMenu(warehouseId, menuId);
      if (response.success) {
        return true;
      } else {
        setError('Ошибка отвязки меню от склада');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отвязки меню от склада');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    menus,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    addWarehouseMenu,
    getWarehouseMenus,
    updateWarehouseMenu,
    removeWarehouseMenu,
  };
};
