import { Router } from 'express';
import Joi from 'joi';
import { menuController } from '@/controllers/menu.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  menuCreateSchema,
  menuUpdateSchema,
  menuFiltersSchema,
  menuCategoryCreateSchema,
  menuCategoryUpdateSchema,
  menuCategoryFiltersSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  menuItemFiltersSchema,
  warehouseMenuItemSchema,
  warehouseMenuItemUpdateSchema,
  idParamSchema,
} from '@/validation/menu.validation';

const router = Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

// === МАРШРУТЫ ДЛЯ МЕНЮ ===

// POST /api/menu - создание меню
router.post(
  '/',
  validate({ body: menuCreateSchema }),
  menuController.createMenu.bind(menuController)
);

// GET /api/menu - получение списка меню
router.get(
  '/',
  validate({ query: menuFiltersSchema }),
  menuController.getMenus.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ КАТЕГОРИЙ МЕНЮ (ДОЛЖНЫ БЫТЬ ПЕРЕД :id) ===

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

// === МАРШРУТЫ ДЛЯ ПОЗИЦИЙ МЕНЮ (ДОЛЖНЫ БЫТЬ ПЕРЕД :id) ===

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

// === МАРШРУТЫ ДЛЯ ПРИВЯЗКИ МЕНЮ К СКЛАДАМ ===

// POST /api/menu/warehouse-menus - привязка меню к складу
router.post(
  '/warehouse-menus',
  validate({ body: warehouseMenuItemSchema }),
  menuController.addWarehouseMenu.bind(menuController)
);

// GET /api/menu/warehouses/:warehouseId/menus - получение меню для склада
router.get(
  '/warehouses/:warehouseId/menus',
  validate({ 
    params: Joi.object({ 
      warehouseId: Joi.number().integer().positive().required()
    }) 
  }),
  menuController.getWarehouseMenus.bind(menuController)
);

// PUT /api/menu/warehouses/:warehouseId/menus/:menuId - обновление привязки меню к складу
router.put(
  '/warehouses/:warehouseId/menus/:menuId',
  validate({ 
    params: Joi.object({ 
      warehouseId: Joi.number().integer().positive().required(),
      menuId: Joi.number().integer().positive().required()
    }),
    body: warehouseMenuItemUpdateSchema
  }),
  menuController.updateWarehouseMenu.bind(menuController)
);

// DELETE /api/menu/warehouses/:warehouseId/menus/:menuId - отвязка меню от склада
router.delete(
  '/warehouses/:warehouseId/menus/:menuId',
  validate({ 
    params: Joi.object({ 
      warehouseId: Joi.number().integer().positive().required(),
      menuId: Joi.number().integer().positive().required()
    }) 
  }),
  menuController.removeWarehouseMenu.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ ПОЛУЧЕНИЯ ДОСТУПНОГО МЕНЮ ===

// GET /api/menu/warehouses/:warehouseId/available - получение доступного меню для склада
router.get(
  '/warehouses/:warehouseId/available',
  validate({ params: Joi.object({ warehouseId: Joi.number().integer().positive().required() }) }),
  menuController.getAvailableMenu.bind(menuController)
);

// GET /api/menu/items/:menuItemId/availability - проверка доступности блюда
router.get(
  '/items/:menuItemId/availability',
  validate({ 
    params: Joi.object({ 
      menuItemId: Joi.number().integer().positive().required()
    }),
    query: Joi.object({
      warehouseId: Joi.number().integer().positive().required(),
      quantity: Joi.number().positive().optional()
    })
  }),
  menuController.checkMenuItemAvailability.bind(menuController)
);

// === МАРШРУТЫ ДЛЯ МЕНЮ С ПАРАМЕТРОМ :id (ДОЛЖНЫ БЫТЬ В КОНЦЕ) ===

// GET /api/menu/:id - получение меню по ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  menuController.getMenuById.bind(menuController)
);

// PUT /api/menu/:id - обновление меню
router.put(
  '/:id',
  validate({ params: idParamSchema, body: menuUpdateSchema }),
  menuController.updateMenu.bind(menuController)
);

// DELETE /api/menu/:id - удаление меню
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  menuController.deleteMenu.bind(menuController)
);

export default router;