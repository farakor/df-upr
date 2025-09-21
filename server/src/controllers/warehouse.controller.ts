import { Request, Response } from 'express';
import { warehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../validation/warehouse.validation';

export const warehouseController = {
  // Получить все склады
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const warehouses = await warehouseService.getAll();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении списка складов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить склад по ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const warehouse = await warehouseService.getById(Number(id));
      
      if (!warehouse) {
        res.status(404).json({ message: 'Склад не найден' });
        return;
      }
      
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Создать новый склад
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateWarehouseDto = req.body;
      const warehouse = await warehouseService.create(data);
      res.status(201).json(warehouse);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при создании склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Обновить склад
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateWarehouseDto = req.body;
      
      const warehouse = await warehouseService.update(Number(id), data);
      
      if (!warehouse) {
        res.status(404).json({ message: 'Склад не найден' });
        return;
      }
      
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при обновлении склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Удалить склад (мягкое удаление)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await warehouseService.delete(Number(id));
      
      if (!success) {
        res.status(404).json({ message: 'Склад не найден' });
        return;
      }
      
      res.json({ message: 'Склад успешно удален' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при удалении склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить остатки по складу
  async getStockBalances(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, search } = req.query;
      
      const result = await warehouseService.getStockBalances(
        Number(id),
        {
          page: Number(page),
          limit: Number(limit),
          search: search as string
        }
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении остатков склада',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
};
