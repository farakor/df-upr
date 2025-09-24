import { Router } from 'express';
import Joi from 'joi';
import { menuController } from '@/controllers/menu.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  menuCategoryCreateSchema,
  menuCategoryUpdateSchema,
  menuCategoryFiltersSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  menuItemFiltersSchema,
  warehouseMenuItemSchema,
  idParamSchema,
} from '@/validation/menu.validation';

const router = Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// === МАРШРУТЫ ДЛЯ КАТЕГОРИЙ МЕНЮ ===

// POST /api/menu/categories - создание категории меню
router.post(
  '/categories',
  validate({ body: menuCategoryCreateSchema }),
  menuController.createMenuCategory.bind(menuController)
);

// GET /api/menu/categories - получение списка категорий меню
router.get(
  '/categories',
  validate({ query: menuCategoryFiltersSchema }),
  menuController.getMenuCategories.bind(menuController)
);

// GET /api/menu/categories/:id - получение категории меню по ID
router.get(
  '/categories/:id',
  validate({ params: idParamSchema }),
  menuController.getMenuCategoryById.bind(menuController)
);

// PUT /api/menu/categories/:id - обновление категории меню
router.put(
  '/categories/:id',
  validate({ params: idParamSchema, body: menuCategoryUpdateSchema }),
  menuController.updateMenuCategory.bind(menuController)
);

// DELETE /api/menu/categories/:id - удаление категории меню
router.delete(
  '/categories/:id',
  validate({ params: idParamSchema }),
  menuController.deleteMenuCategory.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ ПОЗИЦИЙ МЕНЮ ===

// POST /api/menu/items - создание позиции меню
router.post(
  '/items',
  validate({ body: menuItemCreateSchema }),
  menuController.createMenuItem.bind(menuController)
);

// GET /api/menu/items - получение списка позиций меню
router.get(
  '/items',
  validate({ query: menuItemFiltersSchema }),
  menuController.getMenuItems.bind(menuController)
);

// GET /api/menu/items/:id - получение позиции меню по ID
router.get(
  '/items/:id',
  validate({ params: idParamSchema }),
  menuController.getMenuItemById.bind(menuController)
);

// PUT /api/menu/items/:id - обновление позиции меню
router.put(
  '/items/:id',
  validate({ params: idParamSchema, body: menuItemUpdateSchema }),
  menuController.updateMenuItem.bind(menuController)
);

// DELETE /api/menu/items/:id - удаление позиции меню
router.delete(
  '/items/:id',
  validate({ params: idParamSchema }),
  menuController.deleteMenuItem.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ НАСТРОЕК МЕНЮ ПО СКЛАДАМ ===

// POST /api/menu/warehouse-items - настройка позиции меню для склада
router.post(
  '/warehouse-items',
  validate({ body: warehouseMenuItemSchema }),
  menuController.setWarehouseMenuItem.bind(menuController)
);

// GET /api/menu/warehouses/:warehouseId/items - получение настроек меню для склада
router.get(
  '/warehouses/:warehouseId/items',
  validate({ params: Joi.object({ warehouseId: Joi.number().integer().positive().required() }) }),
  menuController.getWarehouseMenuItems.bind(menuController)
);

// DELETE /api/menu/warehouses/:warehouseId/items/:menuItemId - удаление настройки позиции меню для склада
router.delete(
  '/warehouses/:warehouseId/items/:menuItemId',
  validate({ 
    params: Joi.object({ 
      warehouseId: Joi.number().integer().positive().required(),
      menuItemId: Joi.number().integer().positive().required()
    }) 
  }),
  menuController.removeWarehouseMenuItem.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ ПОЛУЧЕНИЯ ДОСТУПНОГО МЕНЮ ===

// GET /api/menu/warehouses/:warehouseId/available - получение доступного меню для склада
router.get(
  '/warehouses/:warehouseId/available',
  validate({ params: Joi.object({ warehouseId: Joi.number().integer().positive().required() }) }),
  menuController.getAvailableMenu.bind(menuController)
);

// GET /api/menu/items/:menuItemId/availability/:warehouseId - проверка доступности блюда
router.get(
  '/items/:menuItemId/availability/:warehouseId',
  validate({ 
    params: Joi.object({ 
      menuItemId: Joi.number().integer().positive().required(),
      warehouseId: Joi.number().integer().positive().required()
    }),
    query: Joi.object({
      quantity: Joi.number().positive().optional()
    })
  }),
  menuController.checkMenuItemAvailability.bind(menuController)
);

export default router;
