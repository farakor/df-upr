import Joi from 'joi';

export const createWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Название склада обязательно',
    'string.min': 'Название склада должно содержать минимум 2 символа',
    'string.max': 'Название склада не должно превышать 100 символов',
    'any.required': 'Название склада обязательно'
  }),
  
  type: Joi.string().valid('MAIN', 'KITCHEN', 'RETAIL').required().messages({
    'any.only': 'Тип склада должен быть одним из: MAIN, KITCHEN, RETAIL',
    'any.required': 'Тип склада обязателен'
  }),
  
  address: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Адрес не должен превышать 255 символов'
  }),
  
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).max(20).optional().allow('').messages({
    'string.pattern.base': 'Некорректный формат телефона',
    'string.max': 'Телефон не должен превышать 20 символов'
  }),
  
  managerId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID менеджера должен быть числом',
    'number.integer': 'ID менеджера должен быть целым числом',
    'number.positive': 'ID менеджера должен быть положительным числом'
  })
});

export const updateWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.empty': 'Название склада не может быть пустым',
    'string.min': 'Название склада должно содержать минимум 2 символа',
    'string.max': 'Название склада не должно превышать 100 символов'
  }),
  
  type: Joi.string().valid('MAIN', 'KITCHEN', 'RETAIL').optional().messages({
    'any.only': 'Тип склада должен быть одним из: MAIN, KITCHEN, RETAIL'
  }),
  
  address: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Адрес не должен превышать 255 символов'
  }),
  
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).max(20).optional().allow('').messages({
    'string.pattern.base': 'Некорректный формат телефона',
    'string.max': 'Телефон не должен превышать 20 символов'
  }),
  
  managerId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID менеджера должен быть числом',
    'number.integer': 'ID менеджера должен быть целым числом',
    'number.positive': 'ID менеджера должен быть положительным числом'
  })
});

export const stockBalancesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Номер страницы должен быть числом',
    'number.integer': 'Номер страницы должен быть целым числом',
    'number.min': 'Номер страницы должен быть больше 0'
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Лимит должен быть числом',
    'number.integer': 'Лимит должен быть целым числом',
    'number.min': 'Лимит должен быть больше 0',
    'number.max': 'Лимит не должен превышать 100'
  }),
  
  search: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Поисковый запрос не должен превышать 100 символов'
  })
});

export interface CreateWarehouseDto {
  name: string;
  type: string;
  address?: string;
  phone?: string;
  managerId?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  type?: string;
  address?: string;
  phone?: string;
  managerId?: number;
}
