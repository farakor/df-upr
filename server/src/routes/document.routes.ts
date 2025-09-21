import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validation.middleware';
import { 
  createDocumentSchema, 
  updateDocumentSchema,
  addDocumentItemSchema,
  documentQuerySchema
} from '../validation/document.validation';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/documents - получить все документы
router.get(
  '/',
  validateMiddleware(documentQuerySchema, 'query'),
  documentController.getAll
);

// GET /api/documents/:id - получить документ по ID
router.get('/:id', documentController.getById);

// POST /api/documents - создать новый документ
router.post(
  '/',
  validateMiddleware(createDocumentSchema),
  documentController.create
);

// PUT /api/documents/:id - обновить документ
router.put(
  '/:id',
  validateMiddleware(updateDocumentSchema),
  documentController.update
);

// DELETE /api/documents/:id - удалить документ
router.delete('/:id', documentController.delete);

// POST /api/documents/:id/items - добавить позицию в документ
router.post(
  '/:id/items',
  validateMiddleware(addDocumentItemSchema),
  documentController.addItem
);

// DELETE /api/documents/:id/items/:itemId - удалить позицию из документа
router.delete('/:id/items/:itemId', documentController.removeItem);

// POST /api/documents/:id/approve - провести документ
router.post('/:id/approve', documentController.approve);

// POST /api/documents/:id/cancel - отменить проведение документа
router.post('/:id/cancel', documentController.cancel);

export default router;
