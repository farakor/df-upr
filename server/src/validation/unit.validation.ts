import Joi from 'joi';
import { UnitType } from '@prisma/client';

export const unitCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Название единицы измерения не может быть пустым',
      'string.min': 'Название единицы измерения должно содержать минимум 1 символ',
      'string.max': 'Название единицы измерения не может превышать 255 символов',
      'any.required': 'Название единицы измерения обязательно для заполнения',
    }),

  shortName: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .required()
    .messages({
      'string.empty': 'Сокращение единицы измерения не может быть пустым',
      'string.min': 'Сокращение единицы измерения должно содержать минимум 1 символ',
      'string.max': 'Сокращение единицы измерения не может превышать 10 символов',
      'any.required': 'Сокращение единицы измерения обязательно для заполнения',
    }),

  type: Joi.string()
    .valid(...Object.values(UnitType))
    .required()
    .messages({
      'any.only': `Тип единицы измерения должен быть одним из: ${Object.values(UnitType).join(', ')}`,
      'any.required': 'Тип единицы измерения обязателен для заполнения',
    }),

  baseUnitId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID базовой единицы должно быть числом',
      'number.integer': 'ID базовой единицы должно быть целым числом',
      'number.positive': 'ID базовой единицы должно быть положительным числом',
    }),

  conversionFactor: Joi.number()
    .positive()
    .precision(4)
    .optional()
    .when('baseUnitId', {
      is: Joi.exist(),
      then: Joi.required(),
    })
    .messages({
      'number.base': 'Коэффициент конвертации должен быть числом',
      'number.positive': 'Коэффициент конвертации должен быть положительным числом',
      'number.precision': 'Коэффициент конвертации может иметь максимум 4 знака после запятой',
      'any.required': 'Коэффициент конвертации обязателен при указании базовой единицы',
    }),
});

export const unitUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Название единицы измерения не может быть пустым',
      'string.min': 'Название единицы измерения должно содержать минимум 1 символ',
      'string.max': 'Название единицы измерения не может превышать 255 символов',
    }),

  shortName: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'string.empty': 'Сокращение единицы измерения не может быть пустым',
      'string.min': 'Сокращение единицы измерения должно содержать минимум 1 символ',
      'string.max': 'Сокращение единицы измерения не может превышать 10 символов',
    }),

  type: Joi.string()
    .valid(...Object.values(UnitType))
    .optional()
    .messages({
      'any.only': `Тип единицы измерения должен быть одним из: ${Object.values(UnitType).join(', ')}`,
    }),

  baseUnitId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID базовой единицы должно быть числом',
      'number.integer': 'ID базовой единицы должно быть целым числом',
      'number.positive': 'ID базовой единицы должно быть положительным числом',
    }),

  conversionFactor: Joi.number()
    .positive()
    .precision(4)
    .optional()
    .when('baseUnitId', {
      is: Joi.exist(),
      then: Joi.required(),
    })
    .messages({
      'number.base': 'Коэффициент конвертации должен быть числом',
      'number.positive': 'Коэффициент конвертации должен быть положительным числом',
      'number.precision': 'Коэффициент конвертации может иметь максимум 4 знака после запятой',
      'any.required': 'Коэффициент конвертации обязателен при указании базовой единицы',
    }),
});

export const unitConversionSchema = Joi.object({
  fromUnitId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID исходной единицы должно быть числом',
      'number.integer': 'ID исходной единицы должно быть целым числом',
      'number.positive': 'ID исходной единицы должно быть положительным числом',
      'any.required': 'ID исходной единицы обязательно для заполнения',
    }),

  toUnitId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID целевой единицы должно быть числом',
      'number.integer': 'ID целевой единицы должно быть целым числом',
      'number.positive': 'ID целевой единицы должно быть положительным числом',
      'any.required': 'ID целевой единицы обязательно для заполнения',
    }),

  quantity: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Количество должно быть числом',
      'number.positive': 'Количество должно быть положительным числом',
      'any.required': 'Количество обязательно для заполнения',
    }),
});

export const unitTypeParamSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(UnitType))
    .required()
    .messages({
      'any.only': `Тип единицы измерения должен быть одним из: ${Object.values(UnitType).join(', ')}`,
      'any.required': 'Тип единицы измерения обязателен для заполнения',
    }),
});
