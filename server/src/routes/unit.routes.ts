import { Router } from 'express';
import { unitController } from '../controllers/unit.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, idParamSchema } from '../middleware/validation.middleware';
import { 
  unitCreateSchema, 
  unitUpdateSchema, 
  unitConversionSchema,
  unitTypeParamSchema
} from '../validation/unit.validation';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authenticateToken);

// CRUD операции для единиц измерения
router.post('/', 
  validate({ body: unitCreateSchema }), 
  unitController.createUnit.bind(unitController)
);

router.get('/', 
  unitController.getUnits.bind(unitController)
);

router.get('/base', 
  unitController.getBaseUnits.bind(unitController)
);

router.get('/type/:type', 
  validate({ params: unitTypeParamSchema }), 
  unitController.getUnitsByType.bind(unitController)
);

router.get('/:id', 
  validate({ params: idParamSchema }), 
  unitController.getUnitById.bind(unitController)
);

router.put('/:id', 
  validate({ params: idParamSchema, body: unitUpdateSchema }), 
  unitController.updateUnit.bind(unitController)
);

router.delete('/:id', 
  validate({ params: idParamSchema }), 
  unitController.deleteUnit.bind(unitController)
);

// Дополнительные маршруты
router.post('/convert', 
  validate({ body: unitConversionSchema }), 
  unitController.convertQuantity.bind(unitController)
);

router.get('/:id/conversion-chain', 
  validate({ params: idParamSchema }), 
  unitController.getConversionChain.bind(unitController)
);

router.post('/create-defaults', 
  unitController.createDefaultUnits.bind(unitController)
);

export default router;
