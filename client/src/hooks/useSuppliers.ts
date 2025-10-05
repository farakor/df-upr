import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';
import toast from 'react-hot-toast';

// Типы данных
export interface Supplier {
  id: number;
  name: string;
  legalName?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  paymentTerms: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
}

export interface CreateSupplierData {
  name: string;
  legalName?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  paymentTerms?: number;
}

export interface UpdateSupplierData {
  name?: string;
  legalName?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  paymentTerms?: number;
}

export interface SuppliersResponse {
  data: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API функции
const suppliersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<SuppliersResponse> => {
    // api.get возвращает ApiResponse, внутри data содержится SuppliersResponse
    const response = await api.get('/suppliers', { params });
    // Сервер возвращает { data: [...], pagination: {...} } без обертки ApiResponse
    return response as unknown as SuppliersResponse;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data || response;
  },

  create: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await api.post('/suppliers', data);
    return response.data || response;
  },

  update: async (id: number, data: UpdateSupplierData): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data || response;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  getDocuments: async (id: number, params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    const response = await api.get(`/suppliers/${id}/documents`, { params });
    return response.data || response;
  }
};

// Хуки
export const useSuppliers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getAll(params),
  });
};

export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Поставщик успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при создании поставщика');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierData }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      toast.success('Поставщик успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении поставщика');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Поставщик успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при удалении поставщика');
    },
  });
};

export const useSupplierDocuments = (id: number, params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['supplier-documents', id, params],
    queryFn: () => suppliersApi.getDocuments(id, params),
    enabled: !!id,
  });
};
