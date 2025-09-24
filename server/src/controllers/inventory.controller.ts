import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { logger } from '../utils/logger';

// Создание инвентаризации
export const createInventory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const inventoryData = {
      ...req.body,
      createdById: userId,
    };

    const inventory = await inventoryService.createInventory(inventoryData);
    res.status(201).json(inventory);
  } catch (error) {
    logger.error('Ошибка при создании инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Создание инвентаризации с позициями из остатков
export const createInventoryFromBalances = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = {
      ...req.body,
      createdById: userId,
    };

    const inventory = await inventoryService.createInventoryFromBalances(data);
    res.status(201).json(inventory);
  } catch (error) {
    logger.error('Ошибка при создании инвентаризации с позициями:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании инвентаризации с позициями',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Получение списка инвентаризаций
export const getInventories = async (req: Request, res: Response) => {
  try {
    const filters = {
      warehouseId: req.query.warehouseId ? Number(req.query.warehouseId) : undefined,
      status: req.query.status as any,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      responsiblePersonId: req.query.responsiblePersonId ? Number(req.query.responsiblePersonId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await inventoryService.getInventories(filters);
    res.json(result);
  } catch (error) {
    logger.error('Ошибка при получении списка инвентаризаций:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении списка инвентаризаций',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Получение инвентаризации по ID
export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inventory = await inventoryService.getInventoryById(Number(id));
    
    if (!inventory) {
      res.status(404).json({ message: 'Инвентаризация не найдена' });
      return;
    }

    res.json(inventory);
  } catch (error) {
    logger.error('Ошибка при получении инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Обновление инвентаризации
export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryService.updateInventory(Number(id), req.body);
    res.json(inventory);
  } catch (error) {
    logger.error('Ошибка при обновлении инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Генерация инвентаризационной ведомости
export const generateInventorySheet = async (req: Request, res: Response) => {
  try {
    const sheet = await inventoryService.generateInventorySheet(req.body);
    res.json(sheet);
  } catch (error) {
    logger.error('Ошибка при генерации инвентаризационной ведомости:', error);
    res.status(500).json({ 
      message: 'Ошибка при генерации инвентаризационной ведомости',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Добавление позиции в инвентаризацию
export const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await inventoryService.addInventoryItem(Number(id), req.body);
    res.status(201).json(item);
  } catch (error) {
    logger.error('Ошибка при добавлении позиции в инвентаризацию:', error);
    res.status(500).json({ 
      message: 'Ошибка при добавлении позиции в инвентаризацию',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Обновление позиции инвентаризации
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    
    const updateData = {
      ...req.body,
      countedById: userId,
    };

    const item = await inventoryService.updateInventoryItem(Number(itemId), updateData);
    res.json(item);
  } catch (error) {
    logger.error('Ошибка при обновлении позиции инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении позиции инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Массовое обновление позиций
export const bulkUpdateInventoryItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items } = req.body;
    
    const itemsWithUser = items.map((item: any) => ({
      ...item,
      countedById: userId,
    }));

    const result = await inventoryService.bulkUpdateInventoryItems(itemsWithUser);
    res.json(result);
  } catch (error) {
    logger.error('Ошибка при массовом обновлении позиций:', error);
    res.status(500).json({ 
      message: 'Ошибка при массовом обновлении позиций',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Анализ расхождений
export const analyzeVariances = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { varianceThreshold } = req.query;
    
    const analysis = await inventoryService.analyzeVariances(
      Number(id), 
      varianceThreshold ? Number(varianceThreshold) : 0
    );
    
    res.json(analysis);
  } catch (error) {
    logger.error('Ошибка при анализе расхождений:', error);
    res.status(500).json({ 
      message: 'Ошибка при анализе расхождений',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Создание корректировочных документов
export const createAdjustmentDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const documents = await inventoryService.createAdjustmentDocuments(Number(id), userId);
    res.json(documents);
  } catch (error) {
    logger.error('Ошибка при создании корректировочных документов:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании корректировочных документов',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Утверждение инвентаризации
export const approveInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const inventory = await inventoryService.approveInventory(Number(id), userId);
    res.json(inventory);
  } catch (error) {
    logger.error('Ошибка при утверждении инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при утверждении инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};

// Удаление инвентаризации
export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteInventory(Number(id));
    res.status(204).send();
  } catch (error) {
    logger.error('Ошибка при удалении инвентаризации:', error);
    res.status(500).json({ 
      message: 'Ошибка при удалении инвентаризации',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
};
