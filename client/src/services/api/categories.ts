import { api } from './client';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
  MoveCategoryData,
  ReorderCategoriesData,
} from '@/types/nomenclature';

export class CategoriesApi {
  private readonly basePath = '/v1/categories';

  // Получить список категорий
  async getCategories(filters?: CategoryFilters): Promise<Category[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await api.get<Category[]>(url);
    return response.data;
  }

  // Получить дерево категорий
  async getCategoryTree(filters?: CategoryFilters): Promise<Category[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}/tree?${queryString}` : `${this.basePath}/tree`;
    
    const response = await api.get<Category[]>(url);
    return response.data;
  }

  // Получить категорию по ID
  async getCategory(id: number): Promise<Category> {
    const response = await api.get<Category>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Получить путь к категории
  async getCategoryPath(id: number): Promise<Category[]> {
    const response = await api.get<Category[]>(`${this.basePath}/${id}/path`);
    return response.data;
  }

  // Создать категорию
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<Category>(this.basePath, data);
    return response.data;
  }

  // Обновить категорию
  async updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put<Category>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  // Удалить категорию
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Переместить категорию
  async moveCategory(id: number, data: MoveCategoryData): Promise<Category> {
    const response = await api.patch<Category>(`${this.basePath}/${id}/move`, data);
    return response.data;
  }

  // Изменить порядок категорий
  async reorderCategories(data: ReorderCategoriesData): Promise<void> {
    await api.patch(`${this.basePath}/reorder`, data);
  }
}

export const categoriesApi = new CategoriesApi();
