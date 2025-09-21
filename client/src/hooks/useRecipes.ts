import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '@/services/api/recipes';
import type {
  Recipe,
  CreateRecipeData,
  UpdateRecipeData,
  RecipeFilters,
  RecipeScaleData,
  IngredientAvailabilityCheck,
  RecipeIngredientInput,
} from '@/types/recipes';
import toast from 'react-hot-toast';

// Ключи для кеширования
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters?: RecipeFilters) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: number) => [...recipeKeys.details(), id] as const,
  profitability: () => [...recipeKeys.all, 'profitability'] as const,
  techCard: (id: number) => [...recipeKeys.all, 'tech-card', id] as const,
  availability: (id: number, warehouseId: number, portions?: number) => 
    [...recipeKeys.all, 'availability', id, warehouseId, portions] as const,
};

// Хук для получения списка рецептов
export const useRecipes = (filters?: RecipeFilters) => {
  return useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: () => recipesApi.getRecipes(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения рецепта по ID
export const useRecipe = (id: number, enabled = true) => {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipesApi.getRecipe(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для создания рецепта
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecipeData) => recipesApi.createRecipe(data),
    onSuccess: (newRecipe) => {
      // Инвалидируем кеш списков рецептов
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      
      // Добавляем новый рецепт в кеш
      queryClient.setQueryData(recipeKeys.detail(newRecipe.id), newRecipe);
      
      toast.success('Рецепт успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка создания рецепта');
    },
  });
};

// Хук для обновления рецепта
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecipeData }) =>
      recipesApi.updateRecipe(id, data),
    onSuccess: (updatedRecipe) => {
      // Обновляем кеш рецепта
      queryClient.setQueryData(recipeKeys.detail(updatedRecipe.id), updatedRecipe);
      
      // Инвалидируем кеш списков рецептов
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      
      toast.success('Рецепт успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка обновления рецепта');
    },
  });
};

// Хук для удаления рецепта
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipesApi.deleteRecipe(id),
    onSuccess: (_, deletedId) => {
      // Удаляем рецепт из кеша
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
      
      // Инвалидируем кеш списков рецептов
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      
      toast.success('Рецепт успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка удаления рецепта');
    },
  });
};

// Хук для расчета стоимости рецепта
export const useCalculateRecipeCost = () => {
  return useMutation({
    mutationFn: (ingredients: RecipeIngredientInput[]) =>
      recipesApi.calculateRecipeCost(ingredients),
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка расчета стоимости рецепта');
    },
  });
};

// Хук для масштабирования рецепта
export const useScaleRecipe = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecipeScaleData }) =>
      recipesApi.scaleRecipe(id, data),
    onSuccess: (result) => {
      toast.success(`Рецепт масштабирован с коэффициентом ${result.scaleFactor}`);
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка масштабирования рецепта');
    },
  });
};

// Хук для проверки наличия ингредиентов
export const useCheckIngredientAvailability = (
  id: number,
  warehouseId: number,
  portions?: number,
  enabled = true
) => {
  return useQuery({
    queryKey: recipeKeys.availability(id, warehouseId, portions),
    queryFn: () => recipesApi.checkIngredientAvailability(id, { warehouseId, portions }),
    enabled: enabled && !!id && !!warehouseId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для получения анализа рентабельности
export const useRecipeProfitability = () => {
  return useQuery({
    queryKey: recipeKeys.profitability(),
    queryFn: () => recipesApi.getRecipeProfitability(),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения технологической карты
export const useTechCard = (id: number, enabled = true) => {
  return useQuery({
    queryKey: recipeKeys.techCard(id),
    queryFn: () => recipesApi.generateTechCard(id),
    enabled: enabled && !!id,
    staleTime: 30 * 60 * 1000, // 30 минут
  });
};

// Хук для экспорта технологической карты в PDF
export const useExportTechCard = () => {
  return useMutation({
    mutationFn: (id: number) => recipesApi.exportTechCardToPdf(id),
    onSuccess: () => {
      toast.success('Технологическая карта экспортирована');
    },
    onError: (error: any) => {
      toast.error(error.apiError?.message || 'Ошибка экспорта технологической карты');
    },
  });
};
