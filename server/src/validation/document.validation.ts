import Joi from 'joi';

export const createDocumentSchema = Joi.object({
  type: Joi.string().valid('RECEIPT', 'TRANSFER', 'WRITEOFF', 'INVENTORY_ADJUSTMENT').required().messages({
    'any.only': 'Тип документа должен быть одним из: RECEIPT, TRANSFER, WRITEOFF, INVENTORY_ADJUSTMENT',
    'any.required': 'Тип документа обязателен'
  }),
  
  date: Joi.date().iso().required().messages({
    'date.base': 'Дата должна быть корректной датой',
    'date.format': 'Дата должна быть в формате ISO',
    'any.required': 'Дата документа обязательна'
  }),
  
  supplierId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID поставщика должен быть числом',
    'number.integer': 'ID поставщика должен быть целым числом',
    'number.positive': 'ID поставщика должен быть положительным числом'
  }),
  
  warehouseFromId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID склада отправителя должен быть числом',
    'number.integer': 'ID склада отправителя должен быть целым числом',
    'number.positive': 'ID склада отправителя должен быть положительным числом'
  }),
  
  warehouseToId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID склада получателя должен быть числом',
    'number.integer': 'ID склада получателя должен быть целым числом',
    'number.positive': 'ID склада получателя должен быть положительным числом'
  }),
  
  notes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Примечания не должны превышать 1000 символов'
  })
}).custom((value, helpers) => {
  // Валидация в зависимости от типа документа
  switch (value.type) {
    case 'RECEIPT':
      if (!value.supplierId || !value.warehouseToId) {
        return helpers.error('custom.receipt');
      }
      break;
    case 'TRANSFER':
      if (!value.warehouseFromId || !value.warehouseToId) {
        return helpers.error('custom.transfer');
      }
      if (value.warehouseFromId === value.warehouseToId) {
        return helpers.error('custom.sameWarehouse');
      }
      break;
    case 'WRITEOFF':
      if (!value.warehouseFromId) {
        return helpers.error('custom.writeoff');
      }
      break;
  }
  return value;
}, 'Document type validation').messages({
  'custom.receipt': 'Для документа прихода обязательны поставщик и склад получатель',
  'custom.transfer': 'Для документа перемещения обязательны склад отправитель и склад получатель',
  'custom.writeoff': 'Для документа списания обязателен склад отправитель',
  'custom.sameWarehouse': 'Склад отправитель и склад получатель не могут быть одинаковыми'
});

export const updateDocumentSchema = Joi.object({
  date: Joi.date().iso().optional().messages({
    'date.base': 'Дата должна быть корректной датой',
    'date.format': 'Дата должна быть в формате ISO'
  }),
  
  supplierId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID поставщика должен быть числом',
    'number.integer': 'ID поставщика должен быть целым числом',
    'number.positive': 'ID поставщика должен быть положительным числом'
  }),
  
  warehouseFromId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID склада отправителя должен быть числом',
    'number.integer': 'ID склада отправителя должен быть целым числом',
    'number.positive': 'ID склада отправителя должен быть положительным числом'
  }),
  
  warehouseToId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'ID склада получателя должен быть числом',
    'number.integer': 'ID склада получателя должен быть целым числом',
    'number.positive': 'ID склада получателя должен быть положительным числом'
  }),
  
  notes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Примечания не должны превышать 1000 символов'
  })
});

export const addDocumentItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID товара должен быть числом',
    'number.integer': 'ID товара должен быть целым числом',
    'number.positive': 'ID товара должен быть положительным числом',
    'any.required': 'ID товара обязателен'
  }),
  
  quantity: Joi.number().positive().precision(4).required().messages({
    'number.base': 'Количество должно быть числом',
    'number.positive': 'Количество должно быть положительным числом',
    'any.required': 'Количество обязательно'
  }),
  
  unitId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID единицы измерения должен быть числом',
    'number.integer': 'ID единицы измерения должен быть целым числом',
    'number.positive': 'ID единицы измерения должен быть положительным числом',
    'any.required': 'ID единицы измерения обязателен'
  }),
  
  price: Joi.number().positive().precision(4).required().messages({
    'number.base': 'Цена должна быть числом',
    'number.positive': 'Цена должна быть положительным числом',
    'any.required': 'Цена обязательна'
  }),
  
  expiryDate: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'Срок годности должен быть корректной датой',
    'date.format': 'Срок годности должен быть в формате ISO'
  }),
  
  batchNumber: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Номер партии не должен превышать 50 символов'
  })
});

export const documentQuerySchema = Joi.object({
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
  }),
  
  warehouseId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID склада должен быть числом',
    'number.integer': 'ID склада должен быть целым числом',
    'number.positive': 'ID склада должен быть положительным числом'
  }),
  
  supplierId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID поставщика должен быть числом',
    'number.integer': 'ID поставщика должен быть целым числом',
    'number.positive': 'ID поставщика должен быть положительным числом'
  }),
  
  dateFrom: Joi.date().iso().optional().messages({
    'date.base': 'Дата начала должна быть корректной датой',
    'date.format': 'Дата начала должна быть в формате ISO'
  }),
  
  dateTo: Joi.date().iso().optional().messages({
    'date.base': 'Дата окончания должна быть корректной датой',
    'date.format': 'Дата окончания должна быть в формате ISO'
  })
});

export interface CreateDocumentDto {
  type: string;
  date: string;
  supplierId?: number;
  warehouseFromId?: number;
  warehouseToId?: number;
  notes?: string;
}

export interface UpdateDocumentDto {
  date?: string;
  supplierId?: number;
  warehouseFromId?: number;
  warehouseToId?: number;
  notes?: string;
}

export interface AddDocumentItemDto {
  productId: number;
  quantity: number;
  unitId: number;
  price: number;
  expiryDate?: string;
  batchNumber?: string;
}
