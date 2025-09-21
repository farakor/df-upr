import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import { CreateDocumentDto, UpdateDocumentDto, AddDocumentItemDto } from '../validation/document.validation';

export const documentController = {
  // Получить все документы
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        status, 
        warehouseId, 
        supplierId,
        dateFrom,
        dateTo
      } = req.query;
      
      const result = await documentService.getAll({
        page: Number(page),
        limit: Number(limit),
        type: type as string,
        status: status as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении списка документов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Получить документ по ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const document = await documentService.getById(Number(id));
      
      if (!document) {
        res.status(404).json({ message: 'Документ не найден' });
        return;
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при получении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Создать новый документ
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateDocumentDto = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
      }
      
      const document = await documentService.create(data, userId);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при создании документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Обновить документ
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateDocumentDto = req.body;
      
      const document = await documentService.update(Number(id), data);
      
      if (!document) {
        res.status(404).json({ message: 'Документ не найден' });
        return;
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при обновлении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Удалить документ
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await documentService.delete(Number(id));
      
      if (!success) {
        res.status(404).json({ message: 'Документ не найден или не может быть удален' });
        return;
      }
      
      res.json({ message: 'Документ успешно удален' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при удалении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Добавить позицию в документ
  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: AddDocumentItemDto = req.body;
      
      const item = await documentService.addItem(Number(id), data);
      
      if (!item) {
        res.status(404).json({ message: 'Документ не найден или не может быть изменен' });
        return;
      }
      
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при добавлении позиции в документ',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Удалить позицию из документа
  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const success = await documentService.removeItem(Number(id), Number(itemId));
      
      if (!success) {
        res.status(404).json({ message: 'Позиция не найдена или не может быть удалена' });
        return;
      }
      
      res.json({ message: 'Позиция успешно удалена' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при удалении позиции из документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Провести документ
  async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
      }
      
      const document = await documentService.approve(Number(id), userId);
      
      if (!document) {
        res.status(404).json({ message: 'Документ не найден или не может быть проведен' });
        return;
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при проведении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  },

  // Отменить проведение документа
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const document = await documentService.cancel(Number(id));
      
      if (!document) {
        res.status(404).json({ message: 'Документ не найден или не может быть отменен' });
        return;
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ 
        message: 'Ошибка при отмене проведения документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
};
