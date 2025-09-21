import { Request, Response } from 'express';
import { stockMovementService } from '../services/stockMovement.service';

export const stockMovementController = {
  // Получить все движения товаров
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        warehouseId, 
        productId,
        type,
        dateFrom,
        dateTo
      } = req.query;
      
      const result = await stockMovementService.getAll({
        page: Number(page),
        limit: Number(limit),
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        productId: productId ? Number(productId) : undefined,
        type: type as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении движений товаров',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить движения по товару
  async getByProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, warehouseId, type, dateFrom, dateTo } = req.query;
      
      const result = await stockMovementService.getAll({
        page: Number(page),
        limit: Number(limit),
        productId: Number(id),
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        type: type as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении движений товара',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить движения по складу
  async getByWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, productId, type, dateFrom, dateTo } = req.query;
      
      const result = await stockMovementService.getAll({
        page: Number(page),
        limit: Number(limit),
        warehouseId: Number(id),
        productId: productId ? Number(productId) : undefined,
        type: type as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении движений склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
};
