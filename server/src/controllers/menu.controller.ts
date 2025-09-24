import { Request, Response } from 'express';
import { MenuService, MenuCategoryFilters, MenuItemFilters, PaginationOptions } from '@/services/menu.service';
import { logger } from '@/utils/logger';

const menuService = new MenuService();

export class MenuController {
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
        isActive: req.query.isActive !== 'false',
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
      const menuItem = await menuService.createMenuItem(req.body);
      
      res.status(201).json({
        success: true,
        data: menuItem,
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
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        recipeId: req.query.recipeId ? parseInt(req.query.recipeId as string) : undefined,
        isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
        isActive: req.query.isActive !== 'false',
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
      const menuItem = await menuService.getMenuItemById(id);
      
      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: 'Позиция меню не найдена',
        });
        return;
      }

      res.json({
        success: true,
        data: menuItem,
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
      const menuItem = await menuService.updateMenuItem(id, req.body);
      
      res.json({
        success: true,
        data: menuItem,
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

  // === НАСТРОЙКИ МЕНЮ ПО СКЛАДАМ ===

  async setWarehouseMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const warehouseMenuItem = await menuService.setWarehouseMenuItem(req.body);
      
      res.json({
        success: true,
        data: warehouseMenuItem,
        message: 'Настройка позиции меню для склада успешно сохранена',
      });
    } catch (error) {
      logger.error('Error setting warehouse menu item', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка настройки позиции меню для склада',
      });
    }
  }

  async getWarehouseMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const items = await menuService.getWarehouseMenuItems(warehouseId);
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      logger.error('Error fetching warehouse menu items', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения настроек меню для склада',
      });
    }
  }

  async removeWarehouseMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const menuItemId = parseInt(req.params.menuItemId);
      
      await menuService.removeWarehouseMenuItem(warehouseId, menuItemId);
      
      res.json({
        success: true,
        message: 'Настройка позиции меню для склада успешно удалена',
      });
    } catch (error) {
      logger.error('Error removing warehouse menu item', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления настройки позиции меню для склада',
      });
    }
  }

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);
      const menu = await menuService.getAvailableMenu(warehouseId);
      
      res.json({
        success: true,
        data: menu,
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
      const warehouseId = parseInt(req.params.warehouseId);
      const quantity = req.query.quantity ? parseFloat(req.query.quantity as string) : 1;

      const availability = await menuService.checkMenuItemAvailability(menuItemId, warehouseId, quantity);
      
      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      logger.error('Error checking menu item availability', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка проверки доступности блюда',
      });
    }
  }
}

export const menuController = new MenuController();
