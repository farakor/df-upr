import Joi from 'joi';
import { UnitType } from '@prisma/client';

export const productCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Название товара не может быть пустым',
      'string.min': 'Название товара должно содержать минимум 1 символ',
      'string.max': 'Название товара не может превышать 255 символов',
      'any.required': 'Название товара обязательно для заполнения',
    }),

  article: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Артикул не может превышать 50 символов',
    }),

  barcode: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Штрихкод не может превышать 50 символов',
    }),

  categoryId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID категории должно быть числом',
      'number.integer': 'ID категории должно быть целым числом',
      'number.positive': 'ID категории должно быть положительным числом',
    }),

  unitId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID единицы измерения должно быть числом',
      'number.integer': 'ID единицы измерения должно быть целым числом',
      'number.positive': 'ID единицы измерения должно быть положительным числом',
      'any.required': 'Единица измерения обязательна для заполнения',
    }),

  isDish: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Поле "Блюдо" должно быть булевым значением',
    }),

  recipeId: Joi.number()
    .integer()
    .positive()
    .when('isDish', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'number.base': 'ID рецепта должно быть числом',
      'number.integer': 'ID рецепта должно быть целым числом',
      'number.positive': 'ID рецепта должно быть положительным числом',
      'any.required': 'Для блюда обязательно указать рецептуру',
    }),

  shelfLifeDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Срок годности должен быть числом',
      'number.integer': 'Срок годности должен быть целым числом',
      'number.min': 'Срок годности не может быть отрицательным',
    }),

  storageTemperatureMin: Joi.number()
    .min(-100)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Минимальная температура хранения должна быть числом',
      'number.min': 'Минимальная температура не может быть меньше -100°C',
      'number.max': 'Минимальная температура не может быть больше 100°C',
    }),

  storageTemperatureMax: Joi.number()
    .min(-100)
    .max(100)
    .optional()
    .when('storageTemperatureMin', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('storageTemperatureMin')),
    })
    .messages({
      'number.base': 'Максимальная температура хранения должна быть числом',
      'number.min': 'Максимальная температура не может быть меньше -100°C',
      'number.max': 'Максимальная температура не может быть больше 100°C',
      'number.greater': 'Максимальная температура должна быть больше минимальной',
    }),

  storageConditions: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Условия хранения не могут превышать 500 символов',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
    }),

  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Название товара не может быть пустым',
      'string.min': 'Название товара должно содержать минимум 1 символ',
      'string.max': 'Название товара не может превышать 255 символов',
    }),

  article: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Артикул не может превышать 50 символов',
    }),

  barcode: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Штрихкод не может превышать 50 символов',
    }),

  categoryId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID категории должно быть числом',
      'number.integer': 'ID категории должно быть целым числом',
      'number.positive': 'ID категории должно быть положительным числом',
    }),

  unitId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID единицы измерения должно быть числом',
      'number.integer': 'ID единицы измерения должно быть целым числом',
      'number.positive': 'ID единицы измерения должно быть положительным числом',
    }),

  isDish: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Поле "Блюдо" должно быть булевым значением',
    }),

  recipeId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .when('isDish', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null),
    })
    .messages({
      'number.base': 'ID рецепта должно быть числом',
      'number.integer': 'ID рецепта должно быть целым числом',
      'number.positive': 'ID рецепта должно быть положительным числом',
      'any.required': 'Для блюда обязательно указать рецептуру',
    }),

  shelfLifeDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Срок годности должен быть числом',
      'number.integer': 'Срок годности должен быть целым числом',
      'number.min': 'Срок годности не может быть отрицательным',
    }),

  storageTemperatureMin: Joi.number()
    .min(-100)
    .max(100)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Минимальная температура хранения должна быть числом',
      'number.min': 'Минимальная температура не может быть меньше -100°C',
      'number.max': 'Минимальная температура не может быть больше 100°C',
    }),

  storageTemperatureMax: Joi.number()
    .min(-100)
    .max(100)
    .optional()
    .allow(null)
    .when('storageTemperatureMin', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('storageTemperatureMin')),
    })
    .messages({
      'number.base': 'Максимальная температура хранения должна быть числом',
      'number.min': 'Максимальная температура не может быть меньше -100°C',
      'number.max': 'Максимальная температура не может быть больше 100°C',
      'number.greater': 'Максимальная температура должна быть больше минимальной',
    }),

  storageConditions: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Условия хранения не могут превышать 500 символов',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),
});

export const productFiltersSchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(255)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Поисковый запрос не может превышать 255 символов',
    }),

  categoryId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID категории должно быть числом',
      'number.integer': 'ID категории должно быть целым числом',
      'number.positive': 'ID категории должно быть положительным числом',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),

  unitId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID единицы измерения должно быть числом',
      'number.integer': 'ID единицы измерения должно быть целым числом',
      'number.positive': 'ID единицы измерения должно быть положительным числом',
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть больше 0',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Лимит записей должен быть числом',
      'number.integer': 'Лимит записей должен быть целым числом',
      'number.min': 'Лимит записей должен быть больше 0',
      'number.max': 'Лимит записей не может превышать 100',
    }),

  sortBy: Joi.string()
    .valid('name', 'article', 'createdAt', 'updatedAt')
    .optional()
    .messages({
      'any.only': 'Сортировка возможна только по полям: name, article, createdAt, updatedAt',
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .messages({
      'any.only': 'Порядок сортировки может быть только asc или desc',
    }),
});

export const bulkProductCreateSchema = Joi.object({
  products: Joi.array()
    .items(productCreateSchema)
    .min(1)
    .max(1000)
    .required()
    .messages({
      'array.base': 'Список товаров должен быть массивом',
      'array.min': 'Необходимо передать минимум 1 товар',
      'array.max': 'Нельзя создать более 1000 товаров за раз',
      'any.required': 'Список товаров обязателен для заполнения',
    }),
});
