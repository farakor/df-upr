import Joi from 'joi';

export const createSaleSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID склада должно быть числом',
      'number.integer': 'ID склада должно быть целым числом',
      'number.positive': 'ID склада должно быть положительным числом',
      'any.required': 'ID склада обязательно для заполнения'
    }),
  
  customerName: Joi.string().max(255).optional()
    .messages({
      'string.max': 'Имя клиента не должно превышать 255 символов'
    }),
  
  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'TRANSFER', 'MIXED')
    .default('CASH')
    .messages({
      'any.only': 'Способ оплаты должен быть одним из: CASH, CARD, TRANSFER, MIXED'
    }),
  
  discountAmount: Joi.number().min(0).default(0)
    .messages({
      'number.base': 'Сумма скидки должна быть числом',
      'number.min': 'Сумма скидки не может быть отрицательной'
    }),
  
  notes: Joi.string().max(1000).optional()
    .messages({
      'string.max': 'Примечания не должны превышать 1000 символов'
    }),
  
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID позиции меню должно быть числом',
          'number.integer': 'ID позиции меню должно быть целым числом',
          'number.positive': 'ID позиции меню должно быть положительным числом',
          'any.required': 'ID позиции меню обязательно для заполнения'
        }),
      
      quantity: Joi.number().positive().required()
        .messages({
          'number.base': 'Количество должно быть числом',
          'number.positive': 'Количество должно быть положительным числом',
          'any.required': 'Количество обязательно для заполнения'
        }),
      
      price: Joi.number().positive().optional()
        .messages({
          'number.base': 'Цена должна быть числом',
          'number.positive': 'Цена должна быть положительным числом'
        }),
      
      discountPercent: Joi.number().min(0).max(100).default(0)
        .messages({
          'number.base': 'Процент скидки должен быть числом',
          'number.min': 'Процент скидки не может быть отрицательным',
          'number.max': 'Процент скидки не может превышать 100%'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'Должна быть хотя бы одна позиция в чеке',
      'any.required': 'Позиции чека обязательны для заполнения'
    })
});

export const getSalesSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID склада должно быть числом',
      'number.integer': 'ID склада должно быть целым числом',
      'number.positive': 'ID склада должно быть положительным числом'
    }),
  
  dateFrom: Joi.date().optional()
    .messages({
      'date.base': 'Дата начала должна быть корректной датой'
    }),
  
  dateTo: Joi.date().optional()
    .messages({
      'date.base': 'Дата окончания должна быть корректной датой'
    }),
  
  cashierId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID кассира должно быть числом',
      'number.integer': 'ID кассира должно быть целым числом',
      'number.positive': 'ID кассира должно быть положительным числом'
    }),
  
  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'TRANSFER', 'MIXED')
    .optional()
    .messages({
      'any.only': 'Способ оплаты должен быть одним из: CASH, CARD, TRANSFER, MIXED'
    }),
  
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть больше 0'
    }),
  
  limit: Joi.number().integer().min(1).max(100).default(20)
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 100'
    })
});

export const getSaleByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID продажи должно быть числом',
      'number.integer': 'ID продажи должно быть целым числом',
      'number.positive': 'ID продажи должно быть положительным числом',
      'any.required': 'ID продажи обязательно для заполнения'
    })
});

export const getSalesStatsSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID склада должно быть числом',
      'number.integer': 'ID склада должно быть целым числом',
      'number.positive': 'ID склада должно быть положительным числом'
    }),
  
  dateFrom: Joi.date().required()
    .messages({
      'date.base': 'Дата начала должна быть корректной датой',
      'any.required': 'Дата начала обязательна для заполнения'
    }),
  
  dateTo: Joi.date().required()
    .messages({
      'date.base': 'Дата окончания должна быть корректной датой',
      'any.required': 'Дата окончания обязательна для заполнения'
    }),
  
  groupBy: Joi.string()
    .valid('day', 'week', 'month', 'cashier', 'menuItem')
    .default('day')
    .messages({
      'any.only': 'Группировка должна быть одной из: day, week, month, cashier, menuItem'
    })
});

export const createProductionLogSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID склада должно быть числом',
      'number.integer': 'ID склада должно быть целым числом',
      'number.positive': 'ID склада должно быть положительным числом',
      'any.required': 'ID склада обязательно для заполнения'
    }),
  
  recipeId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID рецепта должно быть числом',
      'number.integer': 'ID рецепта должно быть целым числом',
      'number.positive': 'ID рецепта должно быть положительным числом',
      'any.required': 'ID рецепта обязательно для заполнения'
    }),
  
  quantity: Joi.number().positive().required()
    .messages({
      'number.base': 'Количество должно быть числом',
      'number.positive': 'Количество должно быть положительным числом',
      'any.required': 'Количество обязательно для заполнения'
    }),
  
  producedAt: Joi.date().default(() => new Date())
    .messages({
      'date.base': 'Дата производства должна быть корректной датой'
    })
});
