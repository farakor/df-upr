import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export interface ValidationOptions {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Валидация тела запроса
    if (options.body) {
      const { error } = options.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    // Валидация параметров запроса
    if (options.query) {
      const { error } = options.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    // Валидация параметров маршрута
    if (options.params) {
      const { error } = options.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed', { 
        url: req.url, 
        method: req.method, 
        errors 
      });
      
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors,
      });
      return;
    }

    next();
  };
};

// Схема для валидации ID в параметрах
export const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID должно быть числом',
      'number.integer': 'ID должно быть целым числом',
      'number.positive': 'ID должно быть положительным числом',
      'any.required': 'ID обязательно для заполнения',
    }),
});

// Схема для валидации артикула в параметрах
export const articleParamSchema = Joi.object({
  article: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Артикул не может быть пустым',
      'string.min': 'Артикул должен содержать минимум 1 символ',
      'string.max': 'Артикул не может превышать 50 символов',
      'any.required': 'Артикул обязателен для заполнения',
    }),
});

// Схема для валидации ID категории в параметрах
export const categoryIdParamSchema = Joi.object({
  categoryId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID категории должно быть числом',
      'number.integer': 'ID категории должно быть целым числом',
      'number.positive': 'ID категории должно быть положительным числом',
      'any.required': 'ID категории обязательно для заполнения',
    }),
});
