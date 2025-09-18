import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsApi } from '@/services/api/units';
import type {
  Unit,
  UnitType,
  CreateUnitData,
  UpdateUnitData,
  UnitConversion,
} from '@/types/nomenclature';
import toast from 'react-hot-toast';

// Ключи для кеширования
export const unitKeys = {
  all: ['units'] as const,
  lists: () => [...unitKeys.all, 'list'] as const,
  list: () => [...unitKeys.lists()] as const,
  base: () => [...unitKeys.all, 'base'] as const,
  byType: (type: UnitType) => [...unitKeys.all, 'type', type] as const,
  details: () => [...unitKeys.all, 'detail'] as const,
  detail: (id: number) => [...unitKeys.details(), id] as const,
  conversionChain: (id: number) => [...unitKeys.all, 'conversion-chain', id] as const,
};

// Хук для получения списка единиц измерения
export const useUnits = () => {
  return useQuery({
    queryKey: unitKeys.list(),
    queryFn: () => unitsApi.getUnits(),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Хук для получения базовых единиц измерения
export const useBaseUnits = () => {
  return useQuery({
    queryKey: unitKeys.base(),
    queryFn: () => unitsApi.getBaseUnits(),
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Хук для получения единиц измерения по типу
export const useUnitsByType = (type: UnitType, enabled = true) => {
  return useQuery({
    queryKey: unitKeys.byType(type),
    queryFn: () => unitsApi.getUnitsByType(type),
    enabled: enabled && !!type,
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Хук для получения единицы измерения по ID
export const useUnit = (id: number, enabled = true) => {
  return useQuery({
    queryKey: unitKeys.detail(id),
    queryFn: () => unitsApi.getUnit(id),
    enabled: enabled && !!id,
    staleTime: 20 * 60 * 1000, // 20 минут
  });
};

// Хук для получения цепочки конвертации единицы
export const useConversionChain = (id: number, enabled = true) => {
  return useQuery({
    queryKey: unitKeys.conversionChain(id),
    queryFn: () => unitsApi.getConversionChain(id),
    enabled: enabled && !!id,
    staleTime: 20 * 60 * 1000, // 20 минут
  });
};

// Хук для создания единицы измерения
export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitData) => unitsApi.createUnit(data),
    onSuccess: (newUnit) => {
      // Инвалидируем кеш списков единиц
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitKeys.base() });
      queryClient.invalidateQueries({ queryKey: unitKeys.byType(newUnit.type) });
      
      // Добавляем новую единицу в кеш
      queryClient.setQueryData(unitKeys.detail(newUnit.id), newUnit);
      
      toast.success('Единица измерения успешно создана');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка создания единицы измерения');
    },
  });
};

// Хук для обновления единицы измерения
export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitData }) =>
      unitsApi.updateUnit(id, data),
    onSuccess: (updatedUnit) => {
      // Обновляем кеш единицы
      queryClient.setQueryData(unitKeys.detail(updatedUnit.id), updatedUnit);
      
      // Инвалидируем кеш списков единиц
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitKeys.base() });
      queryClient.invalidateQueries({ queryKey: unitKeys.byType(updatedUnit.type) });
      
      toast.success('Единица измерения успешно обновлена');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка обновления единицы измерения');
    },
  });
};

// Хук для удаления единицы измерения
export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unitsApi.deleteUnit(id),
    onSuccess: (_, deletedId) => {
      // Удаляем единицу из кеша
      queryClient.removeQueries({ queryKey: unitKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: unitKeys.conversionChain(deletedId) });
      
      // Инвалидируем кеш списков единиц
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitKeys.base() });
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
      
      toast.success('Единица измерения успешно удалена');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка удаления единицы измерения');
    },
  });
};

// Хук для конвертации количества между единицами
export const useConvertQuantity = () => {
  return useMutation({
    mutationFn: (data: UnitConversion) => unitsApi.convertQuantity(data),
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка конвертации количества');
    },
  });
};

// Хук для создания стандартных единиц измерения
export const useCreateDefaultUnits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unitsApi.createDefaultUnits(),
    onSuccess: () => {
      // Инвалидируем весь кеш единиц
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
      
      toast.success('Стандартные единицы измерения созданы');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка создания стандартных единиц');
    },
  });
};
