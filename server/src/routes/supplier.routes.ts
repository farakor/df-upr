import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validation.middleware';
import { 
  createSupplierSchema, 
  updateSupplierSchema,
  supplierQuerySchema,
  supplierDocumentsQuerySchema
} from '../validation/supplier.validation';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/suppliers - получить всех поставщиков
router.get(
  '/',
  validateMiddleware(supplierQuerySchema, 'query'),
  supplierController.getAll
);

// GET /api/suppliers/:id - получить поставщика по ID
router.get('/:id', supplierController.getById);

// POST /api/suppliers - создать нового поставщика
router.post(
  '/',
  validateMiddleware(createSupplierSchema),
  supplierController.create
);

// PUT /api/suppliers/:id - обновить поставщика
router.put(
  '/:id',
  validateMiddleware(updateSupplierSchema),
  supplierController.update
);

// DELETE /api/suppliers/:id - удалить поставщика
router.delete('/:id', supplierController.delete);

// GET /api/suppliers/:id/documents - получить документы поставщика
router.get(
  '/:id/documents',
  validateMiddleware(supplierDocumentsQuerySchema, 'query'),
  supplierController.getDocuments
);

export default router;
