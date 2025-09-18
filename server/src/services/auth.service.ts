import { PrismaClient, User, UserRole } from '@prisma/client';
import { JwtUtils, JwtPayload } from '@/utils/jwt';
import { PasswordUtils } from '@/utils/password';
import { 
  CustomError, 
  UnauthorizedError, 
  ValidationError, 
  NotFoundError 
} from '@/middleware/error.middleware';

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Вход в систему
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Аккаунт заблокирован');
    }

    // Проверка пароля
    const isPasswordValid = await PasswordUtils.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Генерация токенов
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = JwtUtils.generateTokenPair(tokenPayload);

    // Сохранение refresh токена в БД
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    });

    // Обновление времени последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Удаление пароля из ответа
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Регистрация нового пользователя
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, firstName, lastName, role = UserRole.OPERATOR, phone } = data;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError('Пользователь с таким email уже существует');
    }

    // Валидация пароля
    const passwordValidation = PasswordUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Слабый пароль', passwordValidation.errors);
    }

    // Хеширование пароля
    const passwordHash = await PasswordUtils.hashPassword(password);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        phone,
      },
    });

    // Генерация токенов
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = JwtUtils.generateTokenPair(tokenPayload);

    // Сохранение refresh токена
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Обновление токена
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Проверка токена в БД
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Недействительный refresh токен');
    }

    if (session.expiresAt < new Date()) {
      // Удаление истекшего токена
      await prisma.userSession.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError('Refresh токен истек');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedError('Аккаунт заблокирован');
    }

    // Верификация токена
    try {
      JwtUtils.verifyToken(refreshToken);
    } catch (error) {
      await prisma.userSession.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError('Недействительный refresh токен');
    }

    // Генерация новых токенов
    const tokenPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      JwtUtils.generateTokenPair(tokenPayload);

    // Обновление refresh токена в БД
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Выход из системы
   */
  static async logout(refreshToken: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { refreshToken },
    });
  }

  /**
   * Выход из всех устройств
   */
  static async logoutAll(userId: number): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  /**
   * Получение профиля пользователя
   */
  static async getProfile(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Аккаунт заблокирован');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfile(
    userId: number, 
    data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Изменение пароля
   */
  static async changePassword(
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Проверка текущего пароля
    const isCurrentPasswordValid = await PasswordUtils.comparePassword(
      currentPassword, 
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new ValidationError('Неверный текущий пароль');
    }

    // Валидация нового пароля
    const passwordValidation = PasswordUtils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Слабый пароль', passwordValidation.errors);
    }

    // Хеширование нового пароля
    const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

    // Обновление пароля
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Выход из всех устройств кроме текущего (опционально)
    // await this.logoutAll(userId);
  }

  /**
   * Верификация токена и получение пользователя
   */
  static async verifyTokenAndGetUser(token: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      const payload = JwtUtils.verifyToken(token);
      
      if (payload.type !== 'access') {
        throw new UnauthorizedError('Недействительный тип токена');
      }

      const user = await this.getProfile(payload.userId);
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new UnauthorizedError('Недействительный токен');
    }
  }

  /**
   * Очистка истекших сессий
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
