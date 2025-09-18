import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@/middleware/error.middleware';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Маршрут ${req.method} ${req.path} не найден`);
  next(error);
};
