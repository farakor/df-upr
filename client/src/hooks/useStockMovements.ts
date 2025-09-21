import { useQuery } from '@tanstack/react-query';
import { stockMovementsApi, StockMovement, StockMovementsQuery } from '@/services/api/stockMovements';

// Получить все движения товаров
export const useStockMovements = (params?: StockMovementsQuery) => {
  return useQuery({
    queryKey: ['stockMovements', params],
    queryFn: () => stockMovementsApi.getAll(params),
    staleTime: 30000, // 30 секунд
  });
};

// Получить движения по товару
export const useStockMovementsByProduct = (productId: number, params?: StockMovementsQuery) => {
  return useQuery({
    queryKey: ['stockMovements', 'product', productId, params],
    queryFn: () => stockMovementsApi.getByProduct(productId, params),
    enabled: !!productId,
    staleTime: 30000,
  });
};

// Получить движения по складу
export const useStockMovementsByWarehouse = (warehouseId: number, params?: StockMovementsQuery) => {
  return useQuery({
    queryKey: ['stockMovements', 'warehouse', warehouseId, params],
    queryFn: () => stockMovementsApi.getByWarehouse(warehouseId, params),
    enabled: !!warehouseId,
    staleTime: 30000,
  });
};

// Экспорт типов
export type { StockMovement, StockMovementsQuery };
