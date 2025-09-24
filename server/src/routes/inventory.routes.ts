import { Router } from 'express';
import {
  createInventory,
  createInventoryFromBalances,
  getInventories,
  getInventoryById,
  updateInventory,
  generateInventorySheet,
  addInventoryItem,
  updateInventoryItem,
  bulkUpdateInventoryItems,
  analyzeVariances,
  createAdjustmentDocuments,
  approveInventory,
  deleteInventory,
} from '../controllers/inventory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createInventorySchema,
  updateInventorySchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  bulkUpdateInventoryItemsSchema,
  generateInventorySheetSchema,
  getInventoriesSchema,
  analyzeVariancesSchema,
} from '../validation/inventory.validation';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authMiddleware);

// Маршруты для инвентаризаций
router.get('/', validateRequest(getInventoriesSchema, 'query'), getInventories);
router.post('/', validateRequest(createInventorySchema), createInventory);
router.post('/from-balances', validateRequest(generateInventorySheetSchema), createInventoryFromBalances);
router.post('/generate-sheet', validateRequest(generateInventorySheetSchema), generateInventorySheet);

// Маршруты для конкретной инвентаризации
router.get('/:id', getInventoryById);
router.put('/:id', validateRequest(updateInventorySchema), updateInventory);
router.delete('/:id', deleteInventory);

// Операции с инвентаризацией
router.post('/:id/approve', approveInventory);
router.get('/:id/analyze', validateRequest(analyzeVariancesSchema, 'query'), analyzeVariances);
router.post('/:id/create-adjustments', createAdjustmentDocuments);

// Маршруты для позиций инвентаризации
router.post('/:id/items', validateRequest(createInventoryItemSchema), addInventoryItem);
router.put('/items/:itemId', validateRequest(updateInventoryItemSchema), updateInventoryItem);
router.put('/:id/items/bulk', validateRequest(bulkUpdateInventoryItemsSchema), bulkUpdateInventoryItems);

export default router;
