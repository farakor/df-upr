import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createSaleSchema,
  getSalesSchema,
  getSaleByIdSchema,
  getSalesStatsSchema,
  createProductionLogSchema
} from '../validation/sales.validation';

const router = Router();
const salesController = new SalesController();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Создание продажи
router.post(
  '/',
  validateRequest(createSaleSchema),
  salesController.createSale.bind(salesController)
);

// Получение списка продаж
router.get(
  '/',
  validateRequest(getSalesSchema, 'query'),
  salesController.getSales.bind(salesController)
);

// Получение продажи по ID
router.get(
  '/:id',
  validateRequest(getSaleByIdSchema, 'params'),
  salesController.getSaleById.bind(salesController)
);

// Получение статистики продаж
router.get(
  '/stats/analytics',
  validateRequest(getSalesStatsSchema, 'query'),
  salesController.getSalesStats.bind(salesController)
);

// Получение дневной сводки
router.get(
  '/stats/daily-summary',
  salesController.getDailySummary.bind(salesController)
);

// Получение доступного меню для склада
router.get(
  '/menu/:warehouseId',
  salesController.getAvailableMenu.bind(salesController)
);

// Создание лога производства
router.post(
  '/production-log',
  validateRequest(createProductionLogSchema),
  salesController.createProductionLog.bind(salesController)
);

export default router;
