import { Router } from 'express';
import { lowStockController } from '../controllers/lowStock.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/low-stock - получить товары с низкими остатками
router.get('/', lowStockController.getLowStockItems);

export default router;
