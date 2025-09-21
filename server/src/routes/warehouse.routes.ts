import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller';
import { stockMovementController } from '../controllers/stockMovement.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validation.middleware';
import { 
  createWarehouseSchema, 
  updateWarehouseSchema,
  stockBalancesQuerySchema
} from '../validation/warehouse.validation';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/warehouses - получить все склады
router.get('/', warehouseController.getAll);

// GET /api/warehouses/:id - получить склад по ID
router.get('/:id', warehouseController.getById);

// POST /api/warehouses - создать новый склад
router.post(
  '/',
  validateMiddleware(createWarehouseSchema),
  warehouseController.create
);

// PUT /api/warehouses/:id - обновить склад
router.put(
  '/:id',
  validateMiddleware(updateWarehouseSchema),
  warehouseController.update
);

// DELETE /api/warehouses/:id - удалить склад
router.delete('/:id', warehouseController.delete);

// GET /api/warehouses/:id/stock-balances - получить остатки по складу
router.get(
  '/:id/stock-balances',
  validateMiddleware(stockBalancesQuerySchema, 'query'),
  warehouseController.getStockBalances
);

// GET /api/warehouses/:id/stock-movements - получить движения по складу
router.get('/:id/stock-movements', stockMovementController.getByWarehouse);

export default router;
