import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, idParamSchema } from '../middleware/validation.middleware';
import { 
  categoryCreateSchema, 
  categoryUpdateSchema, 
  categoryFiltersSchema,
  categoryMoveSchema,
  categoryReorderSchema
} from '../validation/category.validation';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authenticateToken);

// CRUD операции для категорий
router.post('/', 
  validate({ body: categoryCreateSchema }), 
  categoryController.createCategory.bind(categoryController)
);

router.get('/', 
  validate({ query: categoryFiltersSchema }), 
  categoryController.getCategories.bind(categoryController)
);

router.get('/tree', 
  validate({ query: categoryFiltersSchema }), 
  categoryController.getCategoryTree.bind(categoryController)
);

router.get('/:id', 
  validate({ params: idParamSchema }), 
  categoryController.getCategoryById.bind(categoryController)
);

router.put('/:id', 
  validate({ params: idParamSchema, body: categoryUpdateSchema }), 
  categoryController.updateCategory.bind(categoryController)
);

router.delete('/:id', 
  validate({ params: idParamSchema }), 
  categoryController.deleteCategory.bind(categoryController)
);

// Дополнительные маршруты
router.get('/:id/path', 
  validate({ params: idParamSchema }), 
  categoryController.getCategoryPath.bind(categoryController)
);

router.patch('/:id/move', 
  validate({ params: idParamSchema, body: categoryMoveSchema }), 
  categoryController.moveCategory.bind(categoryController)
);

router.patch('/reorder', 
  validate({ body: categoryReorderSchema }), 
  categoryController.reorderCategories.bind(categoryController)
);

export default router;
