import { Request, Response } from 'express';
import { supplierService } from '../services/supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../validation/supplier.validation';

export const supplierController = {
  // Получить всех поставщиков
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, search, isActive } = req.query;
      
      const result = await supplierService.getAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении списка поставщиков',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить поставщика по ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getById(Number(id));
      
      if (!supplier) {
        res.status(404).json({ message: 'Поставщик не найден' });
        return;
      }
      
      res.json({
        data: supplier
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении поставщика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Создать нового поставщика
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSupplierDto = req.body;
      const supplier = await supplierService.create(data);
      res.status(201).json({
        data: supplier,
        message: 'Поставщик успешно создан'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при создании поставщика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Обновить поставщика
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSupplierDto = req.body;
      
      const supplier = await supplierService.update(Number(id), data);
      
      if (!supplier) {
        res.status(404).json({ message: 'Поставщик не найден' });
        return;
      }
      
      res.json({
        data: supplier,
        message: 'Поставщик успешно обновлен'
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при обновлении поставщика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Удалить поставщика (мягкое удаление)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await supplierService.delete(Number(id));
      
      if (!success) {
        res.status(404).json({ message: 'Поставщик не найден' });
        return;
      }
      
      res.json({ message: 'Поставщик успешно удален' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при удалении поставщика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить документы поставщика
  async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, type, status } = req.query;
      
      const result = await supplierService.getDocuments(
        Number(id),
        {
          page: Number(page),
          limit: Number(limit),
          type: type as string,
          status: status as string
        }
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении документов поставщика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
};
