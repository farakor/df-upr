import { api } from './client';
import { LoginCredentials, AuthResponse, User, RefreshTokenResponse } from '@/types/auth';

export class AuthApi {
  /**
   * Вход в систему
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/v1/auth/login', credentials);
    return response.data!;
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
    const response = await api.post<AuthResponse>('/v1/auth/register', userData);
    return response.data!;
  }

  /**
   * Обновление токена
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/v1/auth/refresh', {
      refreshToken,
    });
    return response.data!;
  }

  /**
   * Выход из системы
   */
  static async logout(refreshToken?: string): Promise<void> {
    await api.post('/v1/auth/logout', { refreshToken });
  }

  /**
   * Выход из всех устройств
   */
  static async logoutAll(): Promise<void> {
    await api.post('/v1/auth/logout-all');
  }

  /**
   * Получение профиля пользователя
   */
  static async getProfile(): Promise<User> {
    const response = await api.get<User>('/v1/auth/profile');
    return response.data!;
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    const response = await api.put<User>('/v1/auth/profile', data);
    return response.data!;
  }

  /**
   * Изменение пароля
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.put('/v1/auth/change-password', data);
  }

  /**
   * Проверка состояния аутентификации
   */
  static async checkAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const response = await api.get<{ isAuthenticated: boolean; user: User | null }>('/v1/auth/check');
    return response.data!;
  }
}

export const authApi = AuthApi;
