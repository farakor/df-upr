import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi, CreateSaleRequest, SalesFilter, CreateProductionLogRequest } from '../services/api/sales';
import { toast } from 'react-hot-toast';

export const useSales = (filter?: SalesFilter) => {
  return useQuery({
    queryKey: ['sales', filter],
    queryFn: () => salesApi.getSales(filter),
    select: (data) => data.data,
  });
};

export const useSale = (id: number) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => salesApi.getSaleById(id),
    select: (data) => data?.data?.data || data?.data,
    enabled: !!id,
  });
};

export const useAvailableMenu = (warehouseId: number) => {
  return useQuery({
    queryKey: ['availableMenu', warehouseId],
    queryFn: () => salesApi.getAvailableMenu(warehouseId),
    select: (data) => data?.data?.data || data?.data,
    enabled: !!warehouseId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useSalesStats = (params: {
  warehouseId?: number;
  dateFrom: string;
  dateTo: string;
  groupBy?: 'day' | 'week' | 'month' | 'cashier' | 'menuItem';
}) => {
  return useQuery({
    queryKey: ['salesStats', params],
    queryFn: () => salesApi.getSalesStats(params),
    select: (data) => data?.data?.data || data?.data,
    enabled: !!(params.dateFrom && params.dateTo),
  });
};

export const useDailySummary = (params?: { warehouseId?: number; date?: string }) => {
  return useQuery({
    queryKey: ['dailySummary', params],
    queryFn: () => salesApi.getDailySummary(params),
    select: (data) => data?.data?.data || data?.data,
    refetchInterval: 5 * 60 * 1000, // Обновляем каждые 5 минут
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleRequest) => salesApi.createSale(data),
    onSuccess: (response: any) => {
      toast.success('Продажа успешно создана');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      queryClient.invalidateQueries({ queryKey: ['salesStats'] });
      queryClient.invalidateQueries({ queryKey: ['availableMenu'] });
      return response.data.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при создании продажи';
      toast.error(message);
      throw error;
    },
  });
};

export const useCreateProductionLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductionLogRequest) => salesApi.createProductionLog(data),
    onSuccess: () => {
      toast.success('Лог производства создан');
      queryClient.invalidateQueries({ queryKey: ['availableMenu'] });
      queryClient.invalidateQueries({ queryKey: ['stockBalances'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при создании лога производства';
      toast.error(message);
    },
  });
};
