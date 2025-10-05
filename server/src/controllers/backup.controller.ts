import { Request, Response, NextFunction } from 'express';
import { BackupType } from '@prisma/client';
import backupService from '../services/backup.service';

export class BackupController {
  // Создать резервную копию
  async createBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const type = (req.body.type as BackupType) || BackupType.MANUAL;

      const backup = await backupService.createBackup(userId, type);
      
      res.status(201).json({
        success: true,
        message: 'Резервная копия успешно создана',
        data: backup,
      });
    } catch (error) {
      next(error);
    }
  }

  // Восстановить из резервной копии
  async restoreBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const backupId = parseInt(req.params.id);
      const result = await backupService.restoreBackup(backupId);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить список резервных копий
  async getBackups(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await backupService.getBackups(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Получить информацию о резервной копии
  async getBackupInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const backupId = parseInt(req.params.id);
      const backup = await backupService.getBackupInfo(backupId);

      if (!backup) {
        res.status(404).json({
          success: false,
          message: 'Резервная копия не найдена',
        });
        return;
      }

      res.json({ success: true, data: backup });
    } catch (error) {
      next(error);
    }
  }

  // Удалить резервную копию
  async deleteBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const backupId = parseInt(req.params.id);
      await backupService.deleteBackup(backupId);
      
      res.json({
        success: true,
        message: 'Резервная копия удалена',
      });
    } catch (error) {
      next(error);
    }
  }

  // Очистить старые резервные копии
  async cleanOldBackups(req: Request, res: Response, next: NextFunction) {
    try {
      const daysToKeep = req.body.daysToKeep || 30;
      const result = await backupService.cleanOldBackups(daysToKeep);
      
      res.json({
        success: true,
        message: `Удалено ${result.deletedCount} резервных копий`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику по резервным копиям
  async getBackupStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await backupService.getBackupStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new BackupController();

