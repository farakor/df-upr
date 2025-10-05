import { Request, Response } from 'express';
import { MenuService, MenuFilters, MenuCategoryFilters, MenuItemFilters, PaginationOptions } from '@/services/menu.service';
import { logger } from '@/utils/logger';

const menuService = new MenuService();

export class MenuController {
  // === МЕНЮ ===

  async createMenu(req: Request, res: Response): Promise<void> {
    try {
      const menu = await menuService.createMenu(req.body);
      
      res.status(201).json({
        success: true,
        data: menu,
        message: 'Меню успешно создано',
      });
    } catch (error) {
      logger.error('Error creating menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания меню',
      });
    }
  }

  async getMenus(req: Request, res: Response): Promise<void> {
    try {
      const filters: MenuFilters = {
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await menuService.getMenus(filters, pagination);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching menus', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка меню',
      });
    }
  }

  async getMenuById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const menu = await menuService.getMenuById(id);
      
      if (!menu) {
        res.status(404).json({
          success: false,
          message: 'Меню не найдено',
        });
        return;
      }

      res.json({
        success: true,
        data: menu,
      });
    } catch (error) {
      logger.error('Error fetching menu', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения меню',
      });
    }
  }

  async updateMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const menu = await menuService.updateMenu(id, req.body);
      
      res.json({
        success: true,
        data: menu,
        message: 'Меню успешно обновлено',
      });
    } catch (error) {
      logger.error('Error updating menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления меню',
      });
    }
  }

  async deleteMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await menuService.deleteMenu(id);
      
      res.json({
        success: true,
        message: 'Меню успешно удалено',
      });
    } catch (error) {
      logger.error('Error deleting menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления меню',
      });
    }
  }

  // === КАТЕГОРИИ МЕНЮ ===

  async createMenuCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await menuService.createMenuCategory(req.body);
      
      res.status(201).json({
        success: true,
        data: category,
        message: 'Категория меню успешно создана',
      });
    } catch (error) {
      logger.error('Error creating menu category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания категории меню',
      });
    }
  }

  async getMenuCategories(req: Request, res: Response): Promise<void> {
    try {
      const filters: MenuCategoryFilters = {
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'sortOrder',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await menuService.getMenuCategories(filters, pagination);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching menu categories', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка категорий меню',
      });
    }
  }

  async getMenuCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const category = await menuService.getMenuCategoryById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Категория меню не найдена',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error fetching menu category', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения категории меню',
      });
    }
  }

  async updateMenuCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const category = await menuService.updateMenuCategory(id, req.body);
      
      res.json({
        success: true,
        data: category,
        message: 'Категория меню успешно обновлена',
      });
    } catch (error) {
      logger.error('Error updating menu category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления категории меню',
      });
    }
  }

  async deleteMenuCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await menuService.deleteMenuCategory(id);
      
      res.json({
        success: true,
        message: 'Категория меню успешно удалена',
      });
    } catch (error) {
      logger.error('Error deleting menu category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления категории меню',
      });
    }
  }

  // === ПОЗИЦИИ МЕНЮ ===

  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const item = await menuService.createMenuItem(req.body);
      
      res.status(201).json({
        success: true,
        data: item,
        message: 'Позиция меню успешно создана',
      });
    } catch (error) {
      logger.error('Error creating menu item', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания позиции меню',
      });
    }
  }

  async getMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const filters: MenuItemFilters = {
        search: req.query.search as string,
        menuId: req.query.menuId ? parseInt(req.query.menuId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId as string) : undefined,
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'sortOrder',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await menuService.getMenuItems(filters, pagination);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching menu items', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка позиций меню',
      });
    }
  }

  async getMenuItemById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const item = await menuService.getMenuItemById(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Позиция меню не найдена',
        });
        return;
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      logger.error('Error fetching menu item', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения позиции меню',
      });
    }
  }

  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const item = await menuService.updateMenuItem(id, req.body);
      
      res.json({
        success: true,
        data: item,
        message: 'Позиция меню успешно обновлена',
      });
    } catch (error) {
      logger.error('Error updating menu item', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления позиции меню',
      });
    }
  }

  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await menuService.deleteMenuItem(id);
      
      res.json({
        success: true,
        message: 'Позиция меню успешно удалена',
      });
    } catch (error) {
      logger.error('Error deleting menu item', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления позиции меню',
      });
    }
  }

  // === ПРИВЯЗКА МЕНЮ К СКЛАДАМ ===

  async addWarehouseMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseMenu = await menuService.addWarehouseMenu(req.body);
      
      res.status(201).json({
        success: true,
        data: warehouseMenu,
        message: 'Меню успешно привязано к складу',
      });
    } catch (error) {
      logger.error('Error adding warehouse menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка привязки меню к складу',
      });
    }
  }

  async updateWarehouseMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const menuId = parseInt(req.params.menuId);
      
      const warehouseMenu = await menuService.updateWarehouseMenu(
        warehouseId,
        menuId,
        req.body
      );
      
      res.json({
        success: true,
        data: warehouseMenu,
        message: 'Привязка меню к складу успешно обновлена',
      });
    } catch (error) {
      logger.error('Error updating warehouse menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления привязки меню к складу',
      });
    }
  }

  async removeWarehouseMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const menuId = parseInt(req.params.menuId);
      
      await menuService.removeWarehouseMenu(warehouseId, menuId);
      
      res.json({
        success: true,
        message: 'Меню успешно отвязано от склада',
      });
    } catch (error) {
      logger.error('Error removing warehouse menu', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка отвязки меню от склада',
      });
    }
  }

  async getWarehouseMenus(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const menus = await menuService.getWarehouseMenus(warehouseId);
      
      res.json({
        success: true,
        data: menus,
      });
    } catch (error) {
      logger.error('Error fetching warehouse menus', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения меню склада',
      });
    }
  }

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const result = await menuService.getAvailableMenu(warehouseId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching available menu', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения доступного меню',
      });
    }
  }

  // === ПРОВЕРКА ДОСТУПНОСТИ БЛЮД ===

  async checkMenuItemAvailability(req: Request, res: Response): Promise<void> {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const warehouseId = parseInt(req.query.warehouseId as string);
      const quantity = req.query.quantity ? parseInt(req.query.quantity as string) : 1;
      
      if (!warehouseId) {
        res.status(400).json({
          success: false,
          message: 'Не указан ID склада',
        });
        return;
      }

      const result = await menuService.checkMenuItemAvailability(menuItemId, warehouseId, quantity);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error checking menu item availability', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка проверки доступности блюда',
      });
    }
  }
}

export const menuController = new MenuController();