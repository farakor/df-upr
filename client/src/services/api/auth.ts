import { api } from './client';
import { LoginCredentials, AuthResponse, User, RefreshTokenResponse } from '@/types/auth';

export class AuthApi {
  /**
   * Вход в систему
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data || response;
  }

  /**
   * Регистрация нового пользователя
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data || response;
  }

  /**
   * Обновление токена
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data || response;
  }

  /**
   * Выход из системы
   */
  static async logout(refreshToken?: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  }

  /**
   * Выход из всех устройств
   */
  static async logoutAll(): Promise<void> {
    await api.post('/auth/logout-all');
  }

  /**
   * Получение профиля пользователя
   */
  static async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data || response;
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    return response.data || response;
  }

  /**
   * Изменение пароля
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.put('/auth/change-password', data);
  }

  /**
   * Проверка состояния аутентификации
   */
  static async checkAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const response = await api.get<{ isAuthenticated: boolean; user: User | null }>('/auth/check');
    return response.data || response;
  }
}

export const authApi = AuthApi;
