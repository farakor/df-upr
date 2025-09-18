import { Request, Response } from 'express';
import { AuthService, LoginCredentials, RegisterData } from '@/services/auth.service';
import { ValidationError } from '@/middleware/error.middleware';
import { asyncHandler } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

export class AuthController {
  /**
   * Вход в систему
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginCredentials = req.body;

    // Валидация входных данных
    if (!email || !password) {
      throw new ValidationError('Email и пароль обязательны');
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Некорректный формат email');
    }

    const result = await AuthService.login({ email, password });

    logger.info(`Пользователь ${email} успешно вошел в систему`, {
      userId: result.user.id,
      role: result.user.role,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Успешный вход в систему',
    });
  });

  /**
   * Регистрация нового пользователя
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role, phone }: RegisterData = req.body;

    // Валидация входных данных
    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError('Email, пароль, имя и фамилия обязательны');
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Некорректный формат email');
    }

    // Валидация имени и фамилии
    if (firstName.length < 2 || lastName.length < 2) {
      throw new ValidationError('Имя и фамилия должны содержать минимум 2 символа');
    }

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
    });

    logger.info(`Зарегистрирован новый пользователь ${email}`, {
      userId: result.user.id,
      role: result.user.role,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Пользователь успешно зарегистрирован',
    });
  });

  /**
   * Обновление токена
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh токен обязателен');
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Токен успешно обновлен',
    });
  });

  /**
   * Выход из системы
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    logger.info(`Пользователь вышел из системы`, {
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Успешный выход из системы',
    });
  });

  /**
   * Выход из всех устройств
   */
  static logoutAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError('Пользователь не аутентифицирован');
    }

    await AuthService.logoutAll(req.user.id);

    logger.info(`Пользователь вышел из всех устройств`, {
      userId: req.user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Выход из всех устройств выполнен',
    });
  });

  /**
   * Получение профиля текущего пользователя
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError('Пользователь не аутентифицирован');
    }

    const user = await AuthService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Обновление профиля пользователя
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError('Пользователь не аутентифицирован');
    }

    const { firstName, lastName, phone } = req.body;
    const updateData: any = {};

    if (firstName !== undefined) {
      if (firstName.length < 2) {
        throw new ValidationError('Имя должно содержать минимум 2 символа');
      }
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (lastName.length < 2) {
        throw new ValidationError('Фамилия должна содержать минимум 2 символа');
      }
      updateData.lastName = lastName;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    const user = await AuthService.updateProfile(req.user.id, updateData);

    logger.info(`Пользователь обновил профиль`, {
      userId: req.user.id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'Профиль успешно обновлен',
    });
  });

  /**
   * Изменение пароля
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError('Пользователь не аутентифицирован');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Текущий пароль и новый пароль обязательны');
    }

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    logger.info(`Пользователь изменил пароль`, {
      userId: req.user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Пароль успешно изменен',
    });
  });

  /**
   * Проверка состояния аутентификации
   */
  static checkAuth = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        isAuthenticated: !!req.user,
        user: req.user || null,
      },
    });
  });
}
