import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  // Создать запись в журнале аудита
  async log(data: {
    userId?: number;
    action: string;
    entityType: string;
    entityId?: number;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.auditLog.create({
      data,
    });
  }

  // Получить все записи аудита с фильтрацией
  async getAuditLogs(params?: {
    userId?: number;
    entityType?: string;
    entityId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.userId) where.userId = params.userId;
    if (params?.entityType) where.entityType = params.entityType;
    if (params?.entityId) where.entityId = params.entityId;
    if (params?.action) where.action = { contains: params.action };

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Получить записи аудита по пользователю
  async getUserAuditLogs(userId: number, page: number = 1, limit: number = 50) {
    return this.getAuditLogs({ userId, page, limit });
  }

  // Получить записи аудита по сущности
  async getEntityAuditLogs(entityType: string, entityId: number, page: number = 1, limit: number = 50) {
    return this.getAuditLogs({ entityType, entityId, page, limit });
  }

  // Получить статистику по аудиту
  async getAuditStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, byAction, byEntityType, byUser] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      byAction: byAction.map(item => ({ action: item.action, count: item._count })),
      byEntityType: byEntityType.map(item => ({ entityType: item.entityType, count: item._count })),
      topUsers: byUser.map(item => ({ userId: item.userId, count: item._count })),
    };
  }

  // Очистить старые записи аудита
  async cleanOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return { deletedCount: result.count };
  }
}

export default new AuditService();

