import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError, ForbiddenError } from './error.middleware';

// Расширение типа Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'passwordHash'>;
    }
  }
}

/**
 * Middleware для проверки аутентификации
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Токен доступа не предоставлен');
    }

    // Верификация токена и получение пользователя
    const user = await AuthService.verifyTokenAndGetUser(token);
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware для проверки ролей пользователя
 */
export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Недостаточно прав для выполнения этого действия');
    }

    next();
  };
};

/**
 * Middleware для проверки конкретной роли
 */
export const requireRole = (role: UserRole) => {
  return requireRoles(role);
};

/**
 * Middleware для проверки роли администратора
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware для проверки роли менеджера или выше
 */
export const requireManager = requireRoles(UserRole.ADMIN, UserRole.MANAGER);

/**
 * Middleware для проверки роли оператора или выше
 */
export const requireOperator = requireRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR);

/**
 * Middleware для проверки активности пользователя
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new UnauthorizedError('Пользователь не аутентифицирован');
  }

  if (!req.user.isActive) {
    throw new ForbiddenError('Аккаунт заблокирован');
  }

  next();
};

/**
 * Middleware для проверки владельца ресурса или администратора
 */
export const requireOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    const resourceUserId = parseInt(req.params[userIdParam], 10);
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isAdmin && currentUserId !== resourceUserId) {
      throw new ForbiddenError('Доступ запрещен');
    }

    next();
  };
};

/**
 * Опциональная аутентификация (не выбрасывает ошибку если токен отсутствует)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await AuthService.verifyTokenAndGetUser(token);
      req.user = user;
    }

    next();
  } catch (error) {
    // Игнорируем ошибки аутентификации для опциональной авторизации
    next();
  }
};

// Алиас для совместимости
export const authMiddleware = authenticateToken;

/**
 * Проверка разрешений на основе кастомной логики
 */
export const requirePermission = (
  permissionCheck: (user: Omit<User, 'passwordHash'>, req: Request) => boolean,
  errorMessage: string = 'Недостаточно прав доступа'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    if (!permissionCheck(req.user, req)) {
      throw new ForbiddenError(errorMessage);
    }

    next();
  };
};
