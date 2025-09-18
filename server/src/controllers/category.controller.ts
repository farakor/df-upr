import { Request, Response } from 'express';
import { categoryService, CategoryCreateInput, CategoryUpdateInput } from '../services/category.service';
import { logger } from '../utils/logger';

export class CategoryController {
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData: CategoryCreateInput = req.body;
      const category = await categoryService.createCategory(categoryData);
      
      logger.info('Category created', { categoryId: category.id, name: category.name });
      res.status(201).json({
        success: true,
        data: category,
        message: 'Категория успешно создана',
      });
    } catch (error) {
      logger.error('Error creating category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания категории',
      });
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoryService.getCategories(includeInactive);
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error fetching categories', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка категорий',
      });
    }
  }

  async getCategoryTree(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categoryTree = await categoryService.getCategoryTree(includeInactive);
      
      res.json({
        success: true,
        data: categoryTree,
      });
    } catch (error) {
      logger.error('Error fetching category tree', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения дерева категорий',
      });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.getCategoryById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error fetching category', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения категории',
      });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: CategoryUpdateInput = req.body;
      
      const category = await categoryService.updateCategory(id, updateData);
      
      logger.info('Category updated', { categoryId: category.id, name: category.name });
      res.json({
        success: true,
        data: category,
        message: 'Категория успешно обновлена',
      });
    } catch (error) {
      logger.error('Error updating category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления категории',
      });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await categoryService.deleteCategory(id);
      
      logger.info('Category deleted', { categoryId: id });
      res.json({
        success: true,
        message: 'Категория успешно удалена',
      });
    } catch (error) {
      logger.error('Error deleting category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления категории',
      });
    }
  }

  async getCategoryPath(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const path = await categoryService.getCategoryPath(id);
      
      res.json({
        success: true,
        data: path,
      });
    } catch (error) {
      logger.error('Error fetching category path', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения пути категории',
      });
    }
  }

  async moveCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { parentId } = req.body;
      
      const category = await categoryService.moveCategory(id, parentId);
      
      logger.info('Category moved', { categoryId: category.id, newParentId: parentId });
      res.json({
        success: true,
        data: category,
        message: 'Категория успешно перемещена',
      });
    } catch (error) {
      logger.error('Error moving category', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка перемещения категории',
      });
    }
  }

  async reorderCategories(req: Request, res: Response): Promise<void> {
    try {
      const { categoryOrders } = req.body;
      
      if (!Array.isArray(categoryOrders)) {
        res.status(400).json({
          success: false,
          message: 'Необходимо передать массив порядка категорий',
        });
        return;
      }

      await categoryService.reorderCategories(categoryOrders);
      
      logger.info('Categories reordered', { count: categoryOrders.length });
      res.json({
        success: true,
        message: 'Порядок категорий успешно изменен',
      });
    } catch (error) {
      logger.error('Error reordering categories', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка изменения порядка категорий',
      });
    }
  }
}

export const categoryController = new CategoryController();
