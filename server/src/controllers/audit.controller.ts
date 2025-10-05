import { Request, Response, NextFunction } from 'express';
import auditService from '../services/audit.service';

export class AuditController {
  // Получить все записи аудита
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        entityType,
        entityId,
        action,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const result = await auditService.getAuditLogs({
        userId: userId ? parseInt(userId as string) : undefined,
        entityType: entityType as string,
        entityId: entityId ? parseInt(entityId as string) : undefined,
        action: action as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Получить записи аудита по пользователю
  async getUserAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const result = await auditService.getUserAuditLogs(userId, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Получить записи аудита по сущности
  async getEntityAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const result = await auditService.getEntityAuditLogs(
        entityType,
        parseInt(entityId),
        page,
        limit
      );
      
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику по аудиту
  async getAuditStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await auditService.getAuditStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // Очистить старые записи аудита
  async cleanOldLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const daysToKeep = req.body.daysToKeep || 90;
      const result = await auditService.cleanOldLogs(daysToKeep);
      res.json({
        success: true,
        message: `Удалено ${result.deletedCount} записей`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuditController();

