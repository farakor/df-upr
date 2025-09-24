import Joi from 'joi';

// Схема для создания инвентаризации
export const createInventorySchema = Joi.object({
  warehouseId: Joi.number().integer().positive().required(),
  date: Joi.date().required(),
  responsiblePersonId: Joi.number().integer().positive().optional(),
  notes: Joi.string().max(1000).optional().allow(''),
});

// Схема для обновления инвентаризации
export const updateInventorySchema = Joi.object({
  date: Joi.date().optional(),
  responsiblePersonId: Joi.number().integer().positive().optional(),
  notes: Joi.string().max(1000).optional().allow(''),
  status: Joi.string().valid('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED').optional(),
});

// Схема для создания позиции инвентаризации
export const createInventoryItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  expectedQuantity: Joi.number().min(0).required(),
  actualQuantity: Joi.number().min(0).optional(),
  price: Joi.number().min(0).required(),
  notes: Joi.string().max(500).optional().allow(''),
});

// Схема для обновления позиции инвентаризации
export const updateInventoryItemSchema = Joi.object({
  actualQuantity: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional().allow(''),
});

// Схема для массового обновления позиций
export const bulkUpdateInventoryItemsSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      actualQuantity: Joi.number().min(0).required(),
      notes: Joi.string().max(500).optional().allow(''),
    })
  ).min(1).required(),
});

// Схема для генерации инвентаризационной ведомости
export const generateInventorySheetSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().required(),
  categoryIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  productIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  includeZeroBalances: Joi.boolean().default(false),
});

// Схема для фильтрации инвентаризаций
export const getInventoriesSchema = Joi.object({
  warehouseId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED').optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  responsiblePersonId: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Схема для анализа расхождений
export const analyzeVariancesSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  varianceThreshold: Joi.number().min(0).default(0),
  includeZeroVariances: Joi.boolean().default(false),
});
