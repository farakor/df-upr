import { api } from './client';
import type {
  Recipe,
  CreateRecipeData,
  UpdateRecipeData,
  RecipeFilters,
  RecipesResponse,
  RecipeCostCalculation,
  RecipeScaleData,
  ScaledRecipeResult,
  IngredientAvailabilityCheck,
  IngredientAvailability,
  RecipeProfitability,
  TechCard,
  RecipeIngredientInput,
} from '@/types/recipes';

export class RecipesApi {
  private readonly basePath = '/recipes';

  // Получить список рецептов с фильтрацией и пагинацией
  async getRecipes(filters?: RecipeFilters): Promise<RecipesResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await api.get<RecipesResponse>(url);
    return response.data || { recipes: [], total: 0, page: 1, totalPages: 0 };
  }

  // Получить рецепт по ID
  async getRecipe(id: number): Promise<Recipe> {
    const response = await api.get<Recipe>(`${this.basePath}/${id}`);
    return response.data!;
  }

  // Создать рецепт
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    const response = await api.post<Recipe>(this.basePath, data);
    return response.data!;
  }

  // Обновить рецепт
  async updateRecipe(id: number, data: UpdateRecipeData): Promise<Recipe> {
    const response = await api.put<Recipe>(`${this.basePath}/${id}`, data);
    return response.data!;
  }

  // Удалить рецепт (мягкое удаление)
  async deleteRecipe(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Рассчитать стоимость рецепта
  async calculateRecipeCost(ingredients: RecipeIngredientInput[]): Promise<RecipeCostCalculation> {
    const response = await api.post<RecipeCostCalculation>(
      `${this.basePath}/calculate-cost`,
      { ingredients }
    );
    return response.data!;
  }

  // Масштабировать рецепт
  async scaleRecipe(id: number, data: RecipeScaleData): Promise<ScaledRecipeResult> {
    const response = await api.post<ScaledRecipeResult>(
      `${this.basePath}/${id}/scale`,
      data
    );
    return response.data!;
  }

  // Проверить наличие ингредиентов на складе
  async checkIngredientAvailability(
    id: number, 
    check: IngredientAvailabilityCheck
  ): Promise<IngredientAvailability> {
    const params = new URLSearchParams();
    params.append('warehouseId', String(check.warehouseId));
    if (check.portions) {
      params.append('portions', String(check.portions));
    }

    const response = await api.get<IngredientAvailability>(
      `${this.basePath}/${id}/availability?${params.toString()}`
    );
    return response.data!;
  }

  // Получить анализ рентабельности рецептов
  async getRecipeProfitability(): Promise<RecipeProfitability[]> {
    const response = await api.get<RecipeProfitability[]>(
      `${this.basePath}/analytics/profitability`
    );
    return response.data!;
  }

  // Сгенерировать технологическую карту
  async generateTechCard(id: number): Promise<TechCard> {
    const response = await api.get<TechCard>(`${this.basePath}/${id}/tech-card`);
    return response.data!;
  }

  // Экспорт технологической карты в PDF (будущая функциональность)
  async exportTechCardToPdf(id: number): Promise<void> {
    const filename = `tech_card_${id}_${new Date().toISOString().split('T')[0]}.pdf`;
    await api.downloadFile(`${this.basePath}/${id}/tech-card/pdf`, filename);
  }
}

export const recipesApi = new RecipesApi();
