import Joi from 'joi';

export const createSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Название поставщика обязательно',
    'string.min': 'Название поставщика должно содержать минимум 2 символа',
    'string.max': 'Название поставщика не должно превышать 100 символов',
    'any.required': 'Название поставщика обязательно'
  }),
  
  legalName: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Юридическое название не должно превышать 255 символов'
  }),
  
  inn: Joi.string().pattern(/^\d{10}$|^\d{12}$/).optional().allow('').messages({
    'string.pattern.base': 'ИНН должен содержать 10 или 12 цифр'
  }),
  
  kpp: Joi.string().pattern(/^\d{9}$/).optional().allow('').messages({
    'string.pattern.base': 'КПП должен содержать 9 цифр'
  }),
  
  address: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Адрес не должен превышать 500 символов'
  }),
  
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).max(20).optional().allow('').messages({
    'string.pattern.base': 'Некорректный формат телефона',
    'string.max': 'Телефон не должен превышать 20 символов'
  }),
  
  email: Joi.string().email().max(100).optional().allow('').messages({
    'string.email': 'Некорректный формат email',
    'string.max': 'Email не должен превышать 100 символов'
  }),
  
  contactPerson: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Контактное лицо не должно превышать 100 символов'
  }),
  
  paymentTerms: Joi.number().integer().min(0).max(365).optional().messages({
    'number.base': 'Условия оплаты должны быть числом',
    'number.integer': 'Условия оплаты должны быть целым числом',
    'number.min': 'Условия оплаты не могут быть отрицательными',
    'number.max': 'Условия оплаты не должны превышать 365 дней'
  })
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.empty': 'Название поставщика не может быть пустым',
    'string.min': 'Название поставщика должно содержать минимум 2 символа',
    'string.max': 'Название поставщика не должно превышать 100 символов'
  }),
  
  legalName: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Юридическое название не должно превышать 255 символов'
  }),
  
  inn: Joi.string().pattern(/^\d{10}$|^\d{12}$/).optional().allow('').messages({
    'string.pattern.base': 'ИНН должен содержать 10 или 12 цифр'
  }),
  
  kpp: Joi.string().pattern(/^\d{9}$/).optional().allow('').messages({
    'string.pattern.base': 'КПП должен содержать 9 цифр'
  }),
  
  address: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Адрес не должен превышать 500 символов'
  }),
  
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).max(20).optional().allow('').messages({
    'string.pattern.base': 'Некорректный формат телефона',
    'string.max': 'Телефон не должен превышать 20 символов'
  }),
  
  email: Joi.string().email().max(100).optional().allow('').messages({
    'string.email': 'Некорректный формат email',
    'string.max': 'Email не должен превышать 100 символов'
  }),
  
  contactPerson: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Контактное лицо не должно превышать 100 символов'
  }),
  
  paymentTerms: Joi.number().integer().min(0).max(365).optional().messages({
    'number.base': 'Условия оплаты должны быть числом',
    'number.integer': 'Условия оплаты должны быть целым числом',
    'number.min': 'Условия оплаты не могут быть отрицательными',
    'number.max': 'Условия оплаты не должны превышать 365 дней'
  })
});

export const supplierQuerySchema = Joi.object({
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
  }),
  
  isActive: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'Статус активности должен быть true или false'
  })
});

export const supplierDocumentsQuerySchema = Joi.object({
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
  
  type: Joi.string().valid('RECEIPT', 'TRANSFER', 'WRITEOFF', 'INVENTORY_ADJUSTMENT').optional().messages({
    'any.only': 'Тип документа должен быть одним из: RECEIPT, TRANSFER, WRITEOFF, INVENTORY_ADJUSTMENT'
  }),
  
  status: Joi.string().valid('DRAFT', 'APPROVED', 'CANCELLED').optional().messages({
    'any.only': 'Статус документа должен быть одним из: DRAFT, APPROVED, CANCELLED'
  })
});

export interface CreateSupplierDto {
  name: string;
  legalName?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  paymentTerms?: number;
}

export interface UpdateSupplierDto {
  name?: string;
  legalName?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  paymentTerms?: number;
}
