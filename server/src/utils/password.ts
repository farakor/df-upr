import bcrypt from 'bcryptjs';
import { config } from '@/config/app';

export class PasswordUtils {
  /**
   * Хеширование пароля
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(config.bcryptRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error('Ошибка при хешировании пароля');
    }
  }

  /**
   * Проверка пароля
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error('Ошибка при проверке пароля');
    }
  }

  /**
   * Валидация пароля
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Минимальная длина
    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов');
    }

    // Максимальная длина
    if (password.length > 128) {
      errors.push('Пароль не должен превышать 128 символов');
    }

    // Наличие цифр
    if (!/\d/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    // Наличие букв
    if (!/[a-zA-Zа-яА-Я]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну букву');
    }

    // Наличие специальных символов (опционально, для повышенной безопасности)
    // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    //   errors.push('Пароль должен содержать хотя бы один специальный символ');
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Генерация случайного пароля
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Проверка силы пароля
   */
  static getPasswordStrength(password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Длина пароля
    if (password.length >= 8) score += 1;
    else feedback.push('Увеличьте длину пароля до 8+ символов');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push('Рекомендуется 12+ символов для большей безопасности');

    // Разнообразие символов
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Добавьте строчные буквы');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Добавьте заглавные буквы');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Добавьте цифры');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Добавьте специальные символы');

    // Определение уровня
    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 2) level = 'weak';
    else if (score <= 3) level = 'fair';
    else if (score <= 4) level = 'good';
    else level = 'strong';

    return { score, level, feedback };
  }
}
