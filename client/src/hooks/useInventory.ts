import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  inventoryApi, 
  Inventory, 
  InventoryFilters, 
  CreateInventoryData, 
  UpdateInventoryData,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  GenerateSheetOptions
} from '../services/api/inventory';

// Ключи для кеширования
export const inventoryKeys = {
  all: ['inventories'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters?: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventoryKeys.details(), id] as const,
  analysis: (id: number) => [...inventoryKeys.all, 'analysis', id] as const,
  sheet: (options: GenerateSheetOptions) => [...inventoryKeys.all, 'sheet', options] as const,
};

// Хук для получения списка инвентаризаций
export const useInventories = (filters?: InventoryFilters) => {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => inventoryApi.getInventories(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения инвентаризации по ID
export const useInventory = (id: number) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.getInventoryById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для создания инвентаризации
export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.createInventory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success(`Инвентаризация ${data.number} создана`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при создании инвентаризации');
    },
  });
};

// Хук для создания инвентаризации с позициями из остатков
export const useCreateInventoryFromBalances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.createInventoryFromBalances,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success(`Инвентаризация ${data.number} создана с позициями из остатков`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при создании инвентаризации');
    },
  });
};

// Хук для обновления инвентаризации
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInventoryData }) =>
      inventoryApi.updateInventory(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) });
      toast.success('Инвентаризация обновлена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при обновлении инвентаризации');
    },
  });
};

// Хук для удаления инвентаризации
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Инвентаризация удалена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при удалении инвентаризации');
    },
  });
};

// Хук для генерации инвентаризационной ведомости
export const useGenerateInventorySheet = () => {
  return useMutation({
    mutationFn: inventoryApi.generateInventorySheet,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при генерации ведомости');
    },
  });
};

// Хук для добавления позиции в инвентаризацию
export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, data }: { inventoryId: number; data: CreateInventoryItemData }) =>
      inventoryApi.addInventoryItem(inventoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.inventoryId) });
      toast.success('Позиция добавлена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при добавлении позиции');
    },
  });
};

// Хук для обновления позиции инвентаризации
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data, inventoryId }: { itemId: number; data: UpdateInventoryItemData; inventoryId: number }) =>
      inventoryApi.updateInventoryItem(itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.inventoryId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.analysis(variables.inventoryId) });
      toast.success('Позиция обновлена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при обновлении позиции');
    },
  });
};

// Хук для массового обновления позиций
export const useBulkUpdateInventoryItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, items }: { inventoryId: number; items: Array<{ id: number; actualQuantity: number; notes?: string }> }) =>
      inventoryApi.bulkUpdateInventoryItems(inventoryId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.inventoryId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.analysis(variables.inventoryId) });
      toast.success(`Обновлено ${variables.items.length} позиций`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при массовом обновлении');
    },
  });
};

// Хук для анализа расхождений
export const useAnalyzeVariances = (inventoryId: number, varianceThreshold?: number) => {
  return useQuery({
    queryKey: inventoryKeys.analysis(inventoryId),
    queryFn: () => inventoryApi.analyzeVariances(inventoryId, varianceThreshold),
    enabled: !!inventoryId,
    staleTime: 1 * 60 * 1000, // 1 минута
  });
};

// Хук для создания корректировочных документов
export const useCreateAdjustmentDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.createAdjustmentDocuments,
    onSuccess: (data, inventoryId) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(inventoryId) });
      if (Array.isArray(data) && data.length > 0) {
        toast.success(`Создано ${data.length} корректировочных документов`);
      } else {
        toast.info(data.message || 'Корректировочные документы не требуются');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при создании корректировочных документов');
    },
  });
};

// Хук для утверждения инвентаризации
export const useApproveInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.approveInventory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) });
      toast.success(`Инвентаризация ${data.number} утверждена`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при утверждении инвентаризации');
    },
  });
};
