import { Request, Response, NextFunction } from 'express';
import auditService from '../services/audit.service';

// Middleware для автоматического логирования действий
export const auditLog = (entityType: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Сохраняем оригинальную функцию json
    const originalJson = res.json;

    // Переопределяем функцию json для перехвата ответа
    res.json = function (body: any) {
      // Создаем запись в аудите после успешного ответа
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = body?.id || body?.data?.id || req.params.id;

        auditService
          .log({
            userId: req.user?.id,
            action,
            entityType,
            entityId: entityId ? parseInt(entityId) : undefined,
            changes: {
              method: req.method,
              url: req.url,
              body: req.body,
              params: req.params,
              query: req.query,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch(error => {
            console.error('Ошибка при создании записи аудита:', error);
          });
      }

      // Вызываем оригинальную функцию
      return originalJson.call(this, body);
    };

    next();
  };
};

// Middleware для логирования ошибок
export const auditError = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await auditService.log({
      userId: req.user?.id,
      action: 'ERROR',
      entityType: 'system',
      changes: {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        body: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (auditError) {
    console.error('Ошибка при логировании ошибки в аудит:', auditError);
  }

  next(error);
};

// Middleware для логирования входа/выхода
export const auditAuth = (action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 || action === 'LOGIN_FAILED') {
        const userId = action === 'LOGIN_FAILED' ? undefined : (body?.user?.id || req.user?.id);

        auditService
          .log({
            userId,
            action,
            entityType: 'auth',
            changes: {
              email: req.body?.email,
              success: res.statusCode >= 200 && res.statusCode < 300,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch(error => {
            console.error('Ошибка при логировании аутентификации:', error);
          });
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

export default {
  auditLog,
  auditError,
  auditAuth,
};

