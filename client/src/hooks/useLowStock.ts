import { useQuery } from '@tanstack/react-query';
import { lowStockApi, LowStockItem } from '@/services/api/lowStock';

// Получить товары с низкими остатками
export const useLowStock = (threshold?: number) => {
  return useQuery({
    queryKey: ['lowStock', threshold],
    queryFn: () => lowStockApi.getLowStockItems(threshold),
    staleTime: 60000, // 1 минута
    refetchInterval: 300000, // Обновляем каждые 5 минут
  });
};

// Экспорт типов
export type { LowStockItem };
