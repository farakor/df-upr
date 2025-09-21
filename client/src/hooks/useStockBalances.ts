import { useQuery } from '@tanstack/react-query';
import { stockBalancesApi, StockBalance, StockBalancesQuery } from '@/services/api/stockBalances';

// Получить остатки по складу
export const useStockBalances = (warehouseId: number, params?: StockBalancesQuery) => {
  return useQuery({
    queryKey: ['stockBalances', warehouseId, params],
    queryFn: () => stockBalancesApi.getByWarehouse(warehouseId, params),
    enabled: !!warehouseId,
    staleTime: 30000, // 30 секунд
  });
};

// Экспорт типов
export type { StockBalance, StockBalancesQuery };
