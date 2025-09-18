import Joi from 'joi';

export const categoryCreateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Название категории не может быть пустым',
      'string.min': 'Название категории должно содержать минимум 1 символ',
      'string.max': 'Название категории не может превышать 255 символов',
      'any.required': 'Название категории обязательно для заполнения',
    }),

  parentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID родительской категории должно быть числом',
      'number.integer': 'ID родительской категории должно быть целым числом',
      'number.positive': 'ID родительской категории должно быть положительным числом',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
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

export const categoryUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Название категории не может быть пустым',
      'string.min': 'Название категории должно содержать минимум 1 символ',
      'string.max': 'Название категории не может превышать 255 символов',
    }),

  parentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID родительской категории должно быть числом',
      'number.integer': 'ID родительской категории должно быть целым числом',
      'number.positive': 'ID родительской категории должно быть положительным числом',
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Описание не может превышать 1000 символов',
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

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Статус активности должен быть булевым значением',
    }),
});

export const categoryMoveSchema = Joi.object({
  parentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID родительской категории должно быть числом',
      'number.integer': 'ID родительской категории должно быть целым числом',
      'number.positive': 'ID родительской категории должно быть положительным числом',
    }),
});

export const categoryReorderSchema = Joi.object({
  categoryOrders: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'ID категории должно быть числом',
            'number.integer': 'ID категории должно быть целым числом',
            'number.positive': 'ID категории должно быть положительным числом',
            'any.required': 'ID категории обязательно для заполнения',
          }),

        sortOrder: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'Порядок сортировки должен быть числом',
            'number.integer': 'Порядок сортировки должен быть целым числом',
            'number.min': 'Порядок сортировки не может быть отрицательным',
            'any.required': 'Порядок сортировки обязателен для заполнения',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Список порядка категорий должен быть массивом',
      'array.min': 'Необходимо передать минимум 1 категорию',
      'any.required': 'Список порядка категорий обязателен для заполнения',
    }),
});

export const categoryFiltersSchema = Joi.object({
  includeInactive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Параметр включения неактивных категорий должен быть булевым значением',
    }),
});
