import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, idParamSchema, articleParamSchema, categoryIdParamSchema } from '../middleware/validation.middleware';
import { 
  productCreateSchema, 
  productUpdateSchema, 
  productFiltersSchema,
  bulkProductCreateSchema 
} from '../validation/product.validation';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authenticateToken);

// CRUD операции для товаров
router.post('/', 
  validate({ body: productCreateSchema }), 
  productController.createProduct.bind(productController)
);

router.get('/', 
  validate({ query: productFiltersSchema }), 
  productController.getProducts.bind(productController)
);

router.get('/:id', 
  validate({ params: idParamSchema }), 
  productController.getProductById.bind(productController)
);

router.put('/:id', 
  validate({ params: idParamSchema, body: productUpdateSchema }), 
  productController.updateProduct.bind(productController)
);

router.delete('/:id', 
  validate({ params: idParamSchema }), 
  productController.deleteProduct.bind(productController)
);

// Дополнительные маршруты
router.get('/article/:article', 
  validate({ params: articleParamSchema }), 
  productController.getProductByArticle.bind(productController)
);

router.get('/category/:categoryId', 
  validate({ params: categoryIdParamSchema }), 
  productController.getProductsByCategory.bind(productController)
);

router.post('/bulk', 
  validate({ body: bulkProductCreateSchema }), 
  productController.bulkCreateProducts.bind(productController)
);

// Экспорт и импорт
router.get('/export', 
  validate({ query: productFiltersSchema }), 
  productController.exportToExcel.bind(productController)
);

// TODO: Добавить middleware для загрузки файлов (multer)
// router.post('/import', 
//   upload.single('file'),
//   productController.importFromExcel.bind(productController)
// );

export default router;
