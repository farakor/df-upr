import { api } from './client';
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  ProductsResponse,
  BulkCreateProductsData,
  BulkCreateResult,
} from '@/types/nomenclature';

export class ProductsApi {
  private readonly basePath = '/products';

  // Получить список товаров с фильтрацией и пагинацией
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
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
    
    const response = await api.get<ProductsResponse>(url);
    return response.data;
  }

  // Получить товар по ID
  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Получить товар по артикулу
  async getProductByArticle(article: string): Promise<Product> {
    const response = await api.get<Product>(`${this.basePath}/article/${article}`);
    return response.data;
  }

  // Получить товары категории
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(`${this.basePath}/category/${categoryId}`);
    return response.data;
  }

  // Создать товар
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>(this.basePath, data);
    return response.data;
  }

  // Обновить товар
  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    const response = await api.put<Product>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  // Удалить товар (мягкое удаление)
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Массовое создание товаров
  async bulkCreateProducts(data: BulkCreateProductsData): Promise<BulkCreateResult> {
    const response = await api.post<BulkCreateResult>(`${this.basePath}/bulk`, data);
    return response.data;
  }

  // Экспорт товаров в Excel
  async exportToExcel(filters?: ProductFilters): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.basePath}/export?${queryString}` 
      : `${this.basePath}/export`;
    
    const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
    await api.downloadFile(url, filename);
  }

  // Импорт товаров из Excel
  async importFromExcel(file: File): Promise<BulkCreateResult> {
    const response = await api.uploadFile<BulkCreateResult>(
      `${this.basePath}/import`,
      file
    );
    return response.data;
  }
}

export const productsApi = new ProductsApi();
