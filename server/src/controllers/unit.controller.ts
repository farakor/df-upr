import { Request, Response } from 'express';
import { unitService, UnitCreateInput, UnitUpdateInput } from '../services/unit.service';
import { UnitType } from '@prisma/client';
import { logger } from '../utils/logger';

export class UnitController {
  async createUnit(req: Request, res: Response): Promise<void> {
    try {
      const unitData: UnitCreateInput = req.body;
      const unit = await unitService.createUnit(unitData);
      
      logger.info('Unit created', { unitId: unit.id, name: unit.name });
      res.status(201).json({
        success: true,
        data: unit,
        message: 'Единица измерения успешно создана',
      });
    } catch (error) {
      logger.error('Error creating unit', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания единицы измерения',
      });
    }
  }

  async getUnits(req: Request, res: Response): Promise<void> {
    try {
      const units = await unitService.getUnits();
      
      res.json({
        success: true,
        data: units,
      });
    } catch (error) {
      logger.error('Error fetching units', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка единиц измерения',
      });
    }
  }

  async getUnitsByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as UnitType;
      
      if (!Object.values(UnitType).includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Неверный тип единицы измерения',
        });
        return;
      }

      const units = await unitService.getUnitsByType(type);
      
      res.json({
        success: true,
        data: units,
      });
    } catch (error) {
      logger.error('Error fetching units by type', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения единиц измерения по типу',
      });
    }
  }

  async getUnitById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const unit = await unitService.getUnitById(id);
      
      if (!unit) {
        res.status(404).json({
          success: false,
          message: 'Единица измерения не найдена',
        });
        return;
      }

      res.json({
        success: true,
        data: unit,
      });
    } catch (error) {
      logger.error('Error fetching unit', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения единицы измерения',
      });
    }
  }

  async updateUnit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UnitUpdateInput = req.body;
      
      const unit = await unitService.updateUnit(id, updateData);
      
      logger.info('Unit updated', { unitId: unit.id, name: unit.name });
      res.json({
        success: true,
        data: unit,
        message: 'Единица измерения успешно обновлена',
      });
    } catch (error) {
      logger.error('Error updating unit', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления единицы измерения',
      });
    }
  }

  async deleteUnit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await unitService.deleteUnit(id);
      
      logger.info('Unit deleted', { unitId: id });
      res.json({
        success: true,
        message: 'Единица измерения успешно удалена',
      });
    } catch (error) {
      logger.error('Error deleting unit', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления единицы измерения',
      });
    }
  }

  async getBaseUnits(req: Request, res: Response): Promise<void> {
    try {
      const units = await unitService.getBaseUnits();
      
      res.json({
        success: true,
        data: units,
      });
    } catch (error) {
      logger.error('Error fetching base units', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения базовых единиц измерения',
      });
    }
  }

  async convertQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { fromUnitId, toUnitId, quantity } = req.body;
      
      if (!fromUnitId || !toUnitId || quantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'Необходимо указать исходную единицу, целевую единицу и количество',
        });
        return;
      }

      const result = await unitService.convertQuantity(fromUnitId, toUnitId, quantity);
      
      res.json({
        success: true,
        data: {
          fromUnitId,
          toUnitId,
          originalQuantity: quantity,
          convertedQuantity: result,
        },
      });
    } catch (error) {
      logger.error('Error converting quantity', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка конвертации количества',
      });
    }
  }

  async getConversionChain(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const chain = await unitService.getConversionChain(id);
      
      res.json({
        success: true,
        data: chain,
      });
    } catch (error) {
      logger.error('Error fetching conversion chain', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения цепочки конвертации',
      });
    }
  }

  async createDefaultUnits(req: Request, res: Response): Promise<void> {
    try {
      await unitService.createDefaultUnits();
      
      logger.info('Default units created');
      res.json({
        success: true,
        message: 'Стандартные единицы измерения созданы',
      });
    } catch (error) {
      logger.error('Error creating default units', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка создания стандартных единиц измерения',
      });
    }
  }
}

export const unitController = new UnitController();
