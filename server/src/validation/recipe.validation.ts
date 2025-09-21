import Joi from 'joi';

export const recipeIngredientSchema = Joi.object({
  productId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID продукта должно быть числом',
      'number.integer': 'ID продукта должно быть целым числом',
      'number.positive': 'ID продукта должно быть положительным числом',
      'any.required': 'ID продукта обязателен для заполнения',
    }),

  quantity: Joi.number()
    .positive()
    .precision(4)
    .required()
    .messages({
      'number.base': 'Количество должно быть числом',
      'number.positive': 'Количество должно быть положительным числом',
      'any.required': 'Количество обязательно для заполнения',
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

  costPerUnit: Joi.number()
    .positive()
    .precision(4)
    .optional()
    .messages({
      'number.base': 'Стоимость за единицу должна быть числом',
      'number.positive': 'Стоимость за единицу должна быть положительным числом',
    }),

  isMain: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Признак основного ингредиента должен быть булевым значением',
    }),

  sortOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Порядок сортировки должен быть числом',
      'number.integer': 'Порядок сортировки должен быть целым числом',
      'number.min': 'Порядок сортировки не может быть отрицательным',
    }),
});

export const recipeCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Название рецепта не может быть пустым',
      'string.min': 'Название рецепта должно содержать минимум 1 символ',
      'string.max': 'Название рецепта не может превышать 255 символов',
      'any.required': 'Название рецепта обязательно для заполнения',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
    }),

  portionSize: Joi.number()
    .positive()
    .precision(3)
    .required()
    .messages({
      'number.base': 'Размер порции должен быть числом',
      'number.positive': 'Размер порции должен быть положительным числом',
      'any.required': 'Размер порции обязателен для заполнения',
    }),

  cookingTime: Joi.number()
    .integer()
    .min(1)
    .max(1440) // максимум 24 часа в минутах
    .optional()
    .messages({
      'number.base': 'Время приготовления должно быть числом',
      'number.integer': 'Время приготовления должно быть целым числом',
      'number.min': 'Время приготовления должно быть больше 0 минут',
      'number.max': 'Время приготовления не может превышать 1440 минут (24 часа)',
    }),

  difficultyLevel: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Уровень сложности должен быть числом',
      'number.integer': 'Уровень сложности должен быть целым числом',
      'number.min': 'Уровень сложности должен быть от 1 до 5',
      'number.max': 'Уровень сложности должен быть от 1 до 5',
    }),

  instructions: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Инструкции не могут превышать 5000 символов',
    }),

  marginPercent: Joi.number()
    .min(0)
    .max(1000)
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Процент наценки должен быть числом',
      'number.min': 'Процент наценки не может быть отрицательным',
      'number.max': 'Процент наценки не может превышать 1000%',
    }),

  ingredients: Joi.array()
    .items(recipeIngredientSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.base': 'Список ингредиентов должен быть массивом',
      'array.min': 'Рецепт должен содержать минимум 1 ингредиент',
      'array.max': 'Рецепт не может содержать более 50 ингредиентов',
      'any.required': 'Список ингредиентов обязателен для заполнения',
    }),
});

export const recipeUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Название рецепта не может быть пустым',
      'string.min': 'Название рецепта должно содержать минимум 1 символ',
      'string.max': 'Название рецепта не может превышать 255 символов',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
    }),

  portionSize: Joi.number()
    .positive()
    .precision(3)
    .optional()
    .messages({
      'number.base': 'Размер порции должен быть числом',
      'number.positive': 'Размер порции должен быть положительным числом',
    }),

  cookingTime: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Время приготовления должно быть числом',
      'number.integer': 'Время приготовления должно быть целым числом',
      'number.min': 'Время приготовления должно быть больше 0 минут',
      'number.max': 'Время приготовления не может превышать 1440 минут (24 часа)',
    }),

  difficultyLevel: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Уровень сложности должен быть числом',
      'number.integer': 'Уровень сложности должен быть целым числом',
      'number.min': 'Уровень сложности должен быть от 1 до 5',
      'number.max': 'Уровень сложности должен быть от 1 до 5',
    }),

  instructions: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Инструкции не могут превышать 5000 символов',
    }),

  marginPercent: Joi.number()
    .min(0)
    .max(1000)
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Процент наценки должен быть числом',
      'number.min': 'Процент наценки не может быть отрицательным',
      'number.max': 'Процент наценки не может превышать 1000%',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),

  ingredients: Joi.array()
    .items(recipeIngredientSchema)
    .min(1)
    .max(50)
    .optional()
    .messages({
      'array.base': 'Список ингредиентов должен быть массивом',
      'array.min': 'Рецепт должен содержать минимум 1 ингредиент',
      'array.max': 'Рецепт не может содержать более 50 ингредиентов',
    }),
});

export const recipeFiltersSchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(255)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Поисковый запрос не может превышать 255 символов',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),

  difficultyLevel: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Уровень сложности должен быть числом',
      'number.integer': 'Уровень сложности должен быть целым числом',
      'number.min': 'Уровень сложности должен быть от 1 до 5',
      'number.max': 'Уровень сложности должен быть от 1 до 5',
    }),

  cookingTimeMax: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .messages({
      'number.base': 'Максимальное время приготовления должно быть числом',
      'number.integer': 'Максимальное время приготовления должно быть целым числом',
      'number.min': 'Максимальное время приготовления должно быть больше 0 минут',
      'number.max': 'Максимальное время приготовления не может превышать 1440 минут',
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
    .valid('name', 'costPrice', 'cookingTime', 'difficultyLevel', 'createdAt', 'updatedAt')
    .optional()
    .messages({
      'any.only': 'Сортировка возможна только по полям: name, costPrice, cookingTime, difficultyLevel, createdAt, updatedAt',
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .messages({
      'any.only': 'Порядок сортировки может быть только asc или desc',
    }),
});

export const recipeScaleSchema = Joi.object({
  scaleFactor: Joi.number()
    .positive()
    .min(0.1)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Коэффициент масштабирования должен быть числом',
      'number.positive': 'Коэффициент масштабирования должен быть положительным числом',
      'number.min': 'Коэффициент масштабирования должен быть больше 0.1',
      'number.max': 'Коэффициент масштабирования не может превышать 100',
      'any.required': 'Коэффициент масштабирования обязателен для заполнения',
    }),
});

export const recipeAvailabilitySchema = Joi.object({
  warehouseId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID склада должно быть числом',
      'number.integer': 'ID склада должно быть целым числом',
      'number.positive': 'ID склада должно быть положительным числом',
      'any.required': 'ID склада обязателен для заполнения',
    }),

  portions: Joi.number()
    .integer()
    .positive()
    .max(1000)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Количество порций должно быть числом',
      'number.integer': 'Количество порций должно быть целым числом',
      'number.positive': 'Количество порций должно быть положительным числом',
      'number.max': 'Количество порций не может превышать 1000',
    }),
});
