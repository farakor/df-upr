import { Request, Response } from 'express';
import { lowStockService } from '../services/lowStock.service';

export const lowStockController = {
  // Получить товары с низкими остатками
  async getLowStockItems(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 10 } = req.query;
      
      const result = await lowStockService.getLowStockItems(Number(threshold));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении товаров с низкими остатками',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
};
