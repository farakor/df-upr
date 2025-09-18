import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products';
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  BulkCreateProductsData,
} from '@/types/nomenclature';
import toast from 'react-hot-toast';

// Ключи для кеширования
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  byArticle: (article: string) => [...productKeys.all, 'article', article] as const,
  byCategory: (categoryId: number) => [...productKeys.all, 'category', categoryId] as const,
};

// Хук для получения списка товаров
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения товара по ID
export const useProduct = (id: number, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения товара по артикулу
export const useProductByArticle = (article: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.byArticle(article),
    queryFn: () => productsApi.getProductByArticle(article),
    enabled: enabled && !!article,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения товаров категории
export const useProductsByCategory = (categoryId: number, enabled = true) => {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productsApi.getProductsByCategory(categoryId),
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для создания товара
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.createProduct(data),
    onSuccess: (newProduct) => {
      // Инвалидируем кеш списков товаров
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Добавляем новый товар в кеш
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);
      
      toast.success('Товар успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка создания товара');
    },
  });
};

// Хук для обновления товара
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Обновляем кеш товара
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct);
      
      // Инвалидируем кеш списков товаров
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Товар успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка обновления товара');
    },
  });
};

// Хук для удаления товара
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Удаляем товар из кеша
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
      
      // Инвалидируем кеш списков товаров
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Товар успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка удаления товара');
    },
  });
};

// Хук для массового создания товаров
export const useBulkCreateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateProductsData) => productsApi.bulkCreateProducts(data),
    onSuccess: (result) => {
      // Инвалидируем кеш списков товаров
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      if (result.errors.length > 0) {
        toast.success(
          `Создано товаров: ${result.created}. Ошибок: ${result.errors.length}`
        );
      } else {
        toast.success(`Успешно создано товаров: ${result.created}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка массового создания товаров');
    },
  });
};

// Хук для экспорта товаров
export const useExportProducts = () => {
  return useMutation({
    mutationFn: (filters?: ProductFilters) => productsApi.exportToExcel(filters),
    onSuccess: () => {
      toast.success('Экспорт товаров начат');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка экспорта товаров');
    },
  });
};

// Хук для импорта товаров
export const useImportProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => productsApi.importFromExcel(file),
    onSuccess: (result) => {
      // Инвалидируем кеш списков товаров
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      if (result.errors.length > 0) {
        toast.success(
          `Импортировано товаров: ${result.created}. Ошибок: ${result.errors.length}`
        );
      } else {
        toast.success(`Успешно импортировано товаров: ${result.created}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка импорта товаров');
    },
  });
};
