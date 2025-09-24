import Joi from 'joi';

export const reportsValidation = {
  // Валидация для оборотно-сальдовой ведомости
  getTurnoverReport: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
      categoryId: Joi.number().integer().positive().optional(),
    }),
  },

  // Валидация для отчета по рентабельности
  getProfitabilityReport: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
    }),
  },

  // Валидация для ABC анализа
  getAbcAnalysis: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
      analysisType: Joi.string().valid('revenue', 'quantity', 'profit').default('revenue'),
    }),
  },

  // Валидация для XYZ анализа
  getXyzAnalysis: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
    }),
  },

  // Валидация для отчета по продажам
  getSalesReport: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
      groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
    }),
  },

  // Валидация для отчета по остаткам
  getStockReport: {
    query: Joi.object({
      warehouseId: Joi.number().integer().positive().optional(),
      categoryId: Joi.number().integer().positive().optional(),
      lowStock: Joi.boolean().default(false),
    }),
  },

  // Валидация для экспорта отчетов
  exportReport: {
    body: Joi.object({
      reportType: Joi.string().valid(
        'turnover', 
        'profitability', 
        'abc', 
        'xyz', 
        'sales', 
        'stock'
      ).required(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      warehouseId: Joi.number().integer().positive().optional(),
      categoryId: Joi.number().integer().positive().optional(),
      analysisType: Joi.string().valid('revenue', 'quantity', 'profit').optional(),
      groupBy: Joi.string().valid('day', 'week', 'month').optional(),
      lowStock: Joi.boolean().optional(),
    }),
  },
};
