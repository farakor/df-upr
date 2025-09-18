import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';
import { tokenStorage } from '@/services/storage/tokenStorage';
import toast from 'react-hot-toast';

// Создание экземпляра axios
const createApiClient = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Интерцептор запросов для добавления токена
  client.interceptors.request.use(
    (config) => {
      const tokens = tokenStorage.getTokens();
      
      if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Интерцептор ответов для обработки ошибок
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Обработка ошибки 401 (неавторизован)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const tokens = tokenStorage.getTokens();
          
          if (tokens.refreshToken) {
            // Попытка обновить токен
            const refreshResponse = await axios.post(`${baseURL}/v1/auth/refresh`, {
              refreshToken: tokens.refreshToken,
            });

            const { accessToken, refreshToken } = refreshResponse.data.data;
            
            // Сохранение новых токенов
            tokenStorage.setTokens({ accessToken, refreshToken });
            
            // Повторный запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Ошибка обновления токена - перенаправление на логин
          tokenStorage.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Обработка других ошибок
      const apiError: ApiError = {
        code: error.response?.data?.error?.code || 'NETWORK_ERROR',
        message: error.response?.data?.error?.message || 'Ошибка сети',
        details: error.response?.data?.error?.details,
      };

      // Показ уведомления об ошибке (кроме некоторых случаев)
      if (error.response?.status !== 401 && !originalRequest.skipErrorToast) {
        toast.error(apiError.message);
      }

      return Promise.reject({ ...error, apiError });
    }
  );

  return client;
};

// Экспорт единственного экземпляра клиента
export const apiClient = createApiClient();

// Типизированные методы для удобства использования
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Метод для загрузки файлов
  async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  }

  // Метод для скачивания файлов
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Экспорт экземпляра для использования
export const api = new ApiClient();
