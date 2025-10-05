import Joi from 'joi';

// === СХЕМЫ ДЛЯ МЕНЮ ===

// Схема для создания меню
export const menuCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Название меню не может быть пустым',
    'string.max': 'Название меню не может превышать 100 символов',
    'any.required': 'Название меню обязательно',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 1000 символов',
  }),
  startDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Дата начала должна быть валидной датой',
  }),
  endDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Дата окончания должна быть валидной датой',
  }),
});

// Схема для обновления меню
export const menuUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.empty': 'Название меню не может быть пустым',
    'string.max': 'Название меню не может превышать 100 символов',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 1000 символов',
  }),
  startDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Дата начала должна быть валидной датой',
  }),
  endDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Дата окончания должна быть валидной датой',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Статус активности должен быть булевым значением',
  }),
});

// Схема для фильтров меню
export const menuFiltersSchema = Joi.object({
  search: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Поисковый запрос не может превышать 100 символов',
  }),
  isActive: Joi.boolean().truthy('true').falsy('false').optional().messages({
    'boolean.base': 'Фильтр активности должен быть булевым значением',
  }),
  dateFrom: Joi.date().optional().messages({
    'date.base': 'Дата начала должна быть валидной датой',
  }),
  dateTo: Joi.date().optional().messages({
    'date.base': 'Дата окончания должна быть валидной датой',
  }),
  sortBy: Joi.string().valid('name', 'createdAt', 'startDate', 'endDate').optional().messages({
    'any.only': 'Сортировка возможна только по полям: name, createdAt, startDate, endDate',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Порядок сортировки может быть только asc или desc',
  }),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Номер страницы должен быть числом',
    'number.integer': 'Номер страницы должен быть целым числом',
    'number.min': 'Номер страницы должен быть больше 0',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Лимит должен быть числом',
    'number.integer': 'Лимит должен быть целым числом',
    'number.min': 'Лимит должен быть больше 0',
    'number.max': 'Лимит не может превышать 100',
  }),
});

// === СХЕМЫ ДЛЯ КАТЕГОРИЙ МЕНЮ ===

// Схема для создания категории меню
export const menuCategoryCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Название категории не может быть пустым',
    'string.max': 'Название категории не может превышать 100 символов',
    'any.required': 'Название категории обязательно',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Описание не может превышать 500 символов',
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Порядок сортировки должен быть числом',
    'number.integer': 'Порядок сортировки должен быть целым числом',
    'number.min': 'Порядок сортировки не может быть отрицательным',
  }),
});

// Схема для обновления категории меню
export const menuCategoryUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.empty': 'Название категории не может быть пустым',
    'string.max': 'Название категории не может превышать 100 символов',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Описание не может превышать 500 символов',
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Порядок сортировки должен быть числом',
    'number.integer': 'Порядок сортировки должен быть целым числом',
    'number.min': 'Порядок сортировки не может быть отрицательным',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Статус активности должен быть булевым значением',
  }),
});

// Схема для фильтров категорий меню
export const menuCategoryFiltersSchema = Joi.object({
  search: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Поисковый запрос не может превышать 100 символов',
  }),
  isActive: Joi.boolean().truthy('true').falsy('false').optional().messages({
    'boolean.base': 'Фильтр активности должен быть булевым значением',
  }),
  sortBy: Joi.string().valid('name', 'sortOrder', 'createdAt').optional().messages({
    'any.only': 'Сортировка возможна только по полям: name, sortOrder, createdAt',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Порядок сортировки может быть только asc или desc',
  }),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Номер страницы должен быть числом',
    'number.integer': 'Номер страницы должен быть целым числом',
    'number.min': 'Номер страницы должен быть больше 0',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Лимит должен быть числом',
    'number.integer': 'Лимит должен быть целым числом',
    'number.min': 'Лимит должен быть больше 0',
    'number.max': 'Лимит не может превышать 100',
  }),
});

// === СХЕМЫ ДЛЯ ПОЗИЦИЙ МЕНЮ ===

// Схема для создания позиции меню
export const menuItemCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Название позиции не может быть пустым',
    'string.max': 'Название позиции не может превышать 100 символов',
    'any.required': 'Название позиции обязательно',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 1000 символов',
  }),
  menuId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID меню должен быть числом',
    'number.integer': 'ID меню должен быть целым числом',
    'number.positive': 'ID меню должен быть положительным числом',
  }),
  productId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID продукта должен быть числом',
    'number.integer': 'ID продукта должен быть целым числом',
    'number.positive': 'ID продукта должен быть положительным числом',
    'any.required': 'ID продукта обязателен',
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID категории должен быть числом',
    'number.integer': 'ID категории должен быть целым числом',
    'number.positive': 'ID категории должен быть положительным числом',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Цена должна быть числом',
    'number.positive': 'Цена должна быть положительным числом',
    'any.required': 'Цена обязательна',
  }),
  costPrice: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Себестоимость должна быть числом',
    'number.positive': 'Себестоимость должна быть положительным числом',
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'URL изображения должен быть валидным',
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Порядок сортировки должен быть числом',
    'number.integer': 'Порядок сортировки должен быть целым числом',
    'number.min': 'Порядок сортировки не может быть отрицательным',
  }),
});

// Схема для обновления позиции меню
export const menuItemUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.empty': 'Название позиции не может быть пустым',
    'string.max': 'Название позиции не может превышать 100 символов',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 1000 символов',
  }),
  menuId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID меню должен быть числом',
    'number.integer': 'ID меню должен быть целым числом',
    'number.positive': 'ID меню должен быть положительным числом',
  }),
  productId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID продукта должен быть числом',
    'number.integer': 'ID продукта должен быть целым числом',
    'number.positive': 'ID продукта должен быть положительным числом',
  }),
  categoryId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID категории должен быть числом',
    'number.integer': 'ID категории должен быть целым числом',
    'number.positive': 'ID категории должен быть положительным числом',
  }),
  price: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Цена должна быть числом',
    'number.positive': 'Цена должна быть положительным числом',
  }),
  costPrice: Joi.number().positive().precision(2).optional().allow(null).messages({
    'number.base': 'Себестоимость должна быть числом',
    'number.positive': 'Себестоимость должна быть положительным числом',
  }),
  imageUrl: Joi.string().uri().optional().allow('', null).messages({
    'string.uri': 'URL изображения должен быть валидным',
  }),
  isAvailable: Joi.boolean().optional().messages({
    'boolean.base': 'Доступность должна быть булевым значением',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Статус активности должен быть булевым значением',
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Порядок сортировки должен быть числом',
    'number.integer': 'Порядок сортировки должен быть целым числом',
    'number.min': 'Порядок сортировки не может быть отрицательным',
  }),
});

// Схема для фильтров позиций меню
export const menuItemFiltersSchema = Joi.object({
  search: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Поисковый запрос не может превышать 100 символов',
  }),
  menuId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID меню должен быть числом',
    'number.integer': 'ID меню должен быть целым числом',
    'number.positive': 'ID меню должен быть положительным числом',
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID категории должен быть числом',
    'number.integer': 'ID категории должен быть целым числом',
    'number.positive': 'ID категории должен быть положительным числом',
  }),
  productId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID продукта должен быть числом',
    'number.integer': 'ID продукта должен быть целым числом',
    'number.positive': 'ID продукта должен быть положительным числом',
  }),
  isAvailable: Joi.boolean().truthy('true').falsy('false').optional().messages({
    'boolean.base': 'Фильтр доступности должен быть булевым значением',
  }),
  isActive: Joi.boolean().truthy('true').falsy('false').optional().messages({
    'boolean.base': 'Фильтр активности должен быть булевым значением',
  }),
  priceMin: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Минимальная цена должна быть числом',
    'number.positive': 'Минимальная цена должна быть положительным числом',
  }),
  priceMax: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Максимальная цена должна быть числом',
    'number.positive': 'Максимальная цена должна быть положительным числом',
  }),
  warehouseId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID склада должен быть числом',
    'number.integer': 'ID склада должен быть целым числом',
    'number.positive': 'ID склада должен быть положительным числом',
  }),
  sortBy: Joi.string().valid('name', 'price', 'sortOrder', 'createdAt').optional().messages({
    'any.only': 'Сортировка возможна только по полям: name, price, sortOrder, createdAt',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Порядок сортировки может быть только asc или desc',
  }),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Номер страницы должен быть числом',
    'number.integer': 'Номер страницы должен быть целым числом',
    'number.min': 'Номер страницы должен быть больше 0',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Лимит должен быть числом',
    'number.integer': 'Лимит должен быть целым числом',
    'number.min': 'Лимит должен быть больше 0',
    'number.max': 'Лимит не может превышать 100',
  }),
});

// === СХЕМЫ ДЛЯ ПРИВЯЗКИ МЕНЮ К СКЛАДАМ ===

// Схема для привязки меню к складу
export const warehouseMenuItemSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID склада должен быть числом',
    'number.integer': 'ID склада должен быть целым числом',
    'number.positive': 'ID склада должен быть положительным числом',
    'any.required': 'ID склада обязателен',
  }),
  menuId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID меню должен быть числом',
    'number.integer': 'ID меню должен быть целым числом',
    'number.positive': 'ID меню должен быть положительным числом',
    'any.required': 'ID меню обязателен',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Активность должна быть булевым значением',
  }),
});

// Схема для обновления привязки меню к складу
export const warehouseMenuItemUpdateSchema = Joi.object({
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'Активность должна быть булевым значением',
  }),
});

// === ОБЩИЕ СХЕМЫ ===

// Общая схема для ID параметра
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID должен быть числом',
    'number.integer': 'ID должен быть целым числом',
    'number.positive': 'ID должен быть положительным числом',
    'any.required': 'ID обязателен',
  }),
});