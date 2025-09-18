import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config/app';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Предопределенные ошибки
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Требуется авторизация') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Недостаточно прав доступа') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Ресурс не найден') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

// Middleware для обработки ошибок
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Внутренняя ошибка сервера';
  let details = error.details;

  // Обработка специфичных ошибок
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Недействительный токен';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Токен истек';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Недействительный ID';
  }

  // Логирование ошибки
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger.log(logLevel, `${req.method} ${req.path} - ${statusCode} - ${message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: (req as any).user?.id,
  });

  // Формирование ответа
  const response: any = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Добавление деталей в режиме разработки или для ошибок валидации
  if (config.nodeEnv === 'development' || statusCode === 400) {
    if (details) {
      response.error.details = details;
    }
    if (config.nodeEnv === 'development' && error.stack) {
      response.error.stack = error.stack;
    }
  }

  // Добавление requestId для отслеживания
  if ((req as any).requestId) {
    response.error.requestId = (req as any).requestId;
  }

  res.status(statusCode).json(response);
};

// Middleware для обработки асинхронных ошибок
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
