interface TokenData {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'df_upr_access_token';
const REFRESH_TOKEN_KEY = 'df_upr_refresh_token';

export class TokenStorage {
  /**
   * Сохранение токенов в localStorage
   */
  setTokens(tokens: TokenData): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Ошибка при сохранении токенов:', error);
    }
  }

  /**
   * Получение токенов из localStorage
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    try {
      return {
        accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
        refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
      };
    } catch (error) {
      console.error('Ошибка при получении токенов:', error);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }

  /**
   * Получение только access токена
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка при получении access токена:', error);
      return null;
    }
  }

  /**
   * Получение только refresh токена
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка при получении refresh токена:', error);
      return null;
    }
  }

  /**
   * Обновление access токена
   */
  setAccessToken(accessToken: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } catch (error) {
      console.error('Ошибка при сохранении access токена:', error);
    }
  }

  /**
   * Очистка всех токенов
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка при очистке токенов:', error);
    }
  }

  /**
   * Проверка наличия токенов
   */
  hasTokens(): boolean {
    const tokens = this.getTokens();
    return !!(tokens.accessToken && tokens.refreshToken);
  }

  /**
   * Проверка валидности токена (базовая проверка формата JWT)
   */
  isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Проверяем, что можем декодировать payload
      const payload = JSON.parse(atob(parts[1]));
      return !!(payload && payload.exp);
    } catch (error) {
      return false;
    }
  }

  /**
   * Проверка истечения токена
   */
  isTokenExpired(token: string): boolean {
    try {
      if (!this.isValidJWT(token)) {
        return true;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Получение времени истечения токена
   */
  getTokenExpiration(token: string): Date | null {
    try {
      if (!this.isValidJWT(token)) {
        return null;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Получение данных пользователя из токена
   */
  getUserFromToken(token: string): any {
    try {
      if (!this.isValidJWT(token)) {
        return null;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Проверка необходимости обновления токена (обновляем за 5 минут до истечения)
   */
  shouldRefreshToken(token: string): boolean {
    try {
      if (!this.isValidJWT(token)) {
        return true;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Обновляем токен за 5 минут до истечения
      return timeUntilExpiry < 300; // 300 секунд = 5 минут
    } catch (error) {
      return true;
    }
  }
}

// Экспорт единственного экземпляра
export const tokenStorage = new TokenStorage();
