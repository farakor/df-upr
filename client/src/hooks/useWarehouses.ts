import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';
import toast from 'react-hot-toast';

// Типы данных
export interface Warehouse {
  id: number;
  name: string;
  type: 'MAIN' | 'KITCHEN' | 'RETAIL';
  address?: string;
  phone?: string;
  managerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    stockBalances: number;
  };
}

export interface CreateWarehouseData {
  name: string;
  type: 'MAIN' | 'KITCHEN' | 'RETAIL';
  address?: string;
  phone?: string;
  managerId?: number;
}

export interface UpdateWarehouseData {
  name?: string;
  type?: 'MAIN' | 'KITCHEN' | 'RETAIL';
  address?: string;
  phone?: string;
  managerId?: number;
}

// API функции
const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data || response;
  },

  getById: async (id: number): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data || response;
  },

  create: async (data: CreateWarehouseData): Promise<Warehouse> => {
    const response = await api.post('/warehouses', data);
    return response.data || response;
  },

  update: async (id: number, data: UpdateWarehouseData): Promise<Warehouse> => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data || response;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },

  getStockBalances: async (id: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get(`/warehouses/${id}/stock-balances`, { params });
    return response.data || response;
  }
};

// Хуки
export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: warehousesApi.getAll,
  });
};

export const useWarehouse = (id: number) => {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => warehousesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehousesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Склад успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при создании склада');
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseData }) =>
      warehousesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
      toast.success('Склад успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении склада');
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehousesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Склад успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при удалении склада');
    },
  });
};

export const useWarehouseStockBalances = (id: number, params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['warehouse-stock-balances', id, params],
    queryFn: () => warehousesApi.getStockBalances(id, params),
    enabled: !!id,
  });
};
