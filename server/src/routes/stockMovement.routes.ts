import { Router } from 'express';
import { stockMovementController } from '../controllers/stockMovement.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/stock-movements - получить все движения товаров
router.get('/', stockMovementController.getAll);

export default router;
