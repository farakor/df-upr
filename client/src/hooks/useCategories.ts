import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api/categories';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
  MoveCategoryData,
  ReorderCategoriesData,
} from '@/types/nomenclature';
import toast from 'react-hot-toast';

// Ключи для кеширования
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  tree: (filters?: CategoryFilters) => [...categoryKeys.all, 'tree', filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
  path: (id: number) => [...categoryKeys.all, 'path', id] as const,
};

// Хук для получения списка категорий
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoriesApi.getCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения дерева категорий
export const useCategoryTree = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: categoryKeys.tree(filters),
    queryFn: () => categoriesApi.getCategoryTree(filters),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения категории по ID
export const useCategory = (id: number, enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getCategory(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Хук для получения пути к категории
export const useCategoryPath = (id: number, enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.path(id),
    queryFn: () => categoriesApi.getCategoryPath(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 минут
  });
};

// Хук для создания категории
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoriesApi.createCategory(data),
    onSuccess: (newCategory) => {
      // Инвалидируем кеш списков и дерева категорий
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      // Добавляем новую категорию в кеш
      queryClient.setQueryData(categoryKeys.detail(newCategory.id), newCategory);
      
      toast.success('Категория успешно создана');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка создания категории');
    },
  });
};

// Хук для обновления категории
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryData }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Обновляем кеш категории
      queryClient.setQueryData(categoryKeys.detail(updatedCategory.id), updatedCategory);
      
      // Инвалидируем кеш списков и дерева категорий
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      toast.success('Категория успешно обновлена');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка обновления категории');
    },
  });
};

// Хук для удаления категории
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Удаляем категорию из кеша
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: categoryKeys.path(deletedId) });
      
      // Инвалидируем кеш списков и дерева категорий
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      toast.success('Категория успешно удалена');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка удаления категории');
    },
  });
};

// Хук для перемещения категории
export const useMoveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MoveCategoryData }) =>
      categoriesApi.moveCategory(id, data),
    onSuccess: (movedCategory) => {
      // Обновляем кеш категории
      queryClient.setQueryData(categoryKeys.detail(movedCategory.id), movedCategory);
      
      // Инвалидируем кеш списков и дерева категорий
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      toast.success('Категория успешно перемещена');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка перемещения категории');
    },
  });
};

// Хук для изменения порядка категорий
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderCategoriesData) => categoriesApi.reorderCategories(data),
    onSuccess: () => {
      // Инвалидируем кеш списков и дерева категорий
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      toast.success('Порядок категорий успешно изменен');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка изменения порядка категорий');
    },
  });
};
