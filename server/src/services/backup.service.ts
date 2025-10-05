import { PrismaClient, BackupStatus, BackupType } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = process.env.BACKUP_PATH || './backups';
  }

  // Создать резервную копию
  async createBackup(userId?: number, type: BackupType = BackupType.MANUAL) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // Создать запись в логе
    const backupLog = await prisma.backupLog.create({
      data: {
        filename,
        size: 0,
        status: BackupStatus.IN_PROGRESS,
        type,
        createdById: userId,
      },
    });

    try {
      // Создать директорию для бэкапов если её нет
      await fs.mkdir(this.backupDir, { recursive: true });

      // Получить параметры подключения из DATABASE_URL
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL не установлена');
      }

      // Парсинг DATABASE_URL
      const urlParts = new URL(dbUrl);
      const dbUser = urlParts.username;
      const dbPassword = urlParts.password;
      const dbHost = urlParts.hostname;
      const dbPort = urlParts.port || '5432';
      const dbName = urlParts.pathname.slice(1);

      // Выполнить pg_dump
      const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${filepath}"`;
      
      await execAsync(pgDumpCommand);

      // Получить размер файла
      const stats = await fs.stat(filepath);
      const size = stats.size;

      // Обновить запись в логе
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          size,
          status: BackupStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      return {
        id: backupLog.id,
        filename,
        size,
        status: BackupStatus.COMPLETED,
      };
    } catch (error: any) {
      // Обновить запись в логе с ошибкой
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: BackupStatus.FAILED,
          error: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  // Восстановить из резервной копии
  async restoreBackup(backupId: number) {
    const backup = await prisma.backupLog.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('Резервная копия не найдена');
    }

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new Error('Невозможно восстановить из незавершенной резервной копии');
    }

    const filepath = path.join(this.backupDir, backup.filename);

    try {
      // Проверить существование файла
      await fs.access(filepath);

      // Получить параметры подключения
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL не установлена');
      }

      const urlParts = new URL(dbUrl);
      const dbUser = urlParts.username;
      const dbPassword = urlParts.password;
      const dbHost = urlParts.hostname;
      const dbPort = urlParts.port || '5432';
      const dbName = urlParts.pathname.slice(1);

      // Выполнить восстановление
      const psqlCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${filepath}"`;
      
      await execAsync(psqlCommand);

      return {
        success: true,
        message: 'Резервная копия успешно восстановлена',
      };
    } catch (error: any) {
      throw new Error(`Ошибка при восстановлении: ${error.message}`);
    }
  }

  // Получить список резервных копий
  async getBackups(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [backups, total] = await Promise.all([
      prisma.backupLog.findMany({
        include: {
          createdBy: {
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
      prisma.backupLog.count(),
    ]);

    return {
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Получить информацию о резервной копии
  async getBackupInfo(backupId: number) {
    return await prisma.backupLog.findUnique({
      where: { id: backupId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Удалить резервную копию
  async deleteBackup(backupId: number) {
    const backup = await prisma.backupLog.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('Резервная копия не найдена');
    }

    const filepath = path.join(this.backupDir, backup.filename);

    try {
      // Удалить файл
      await fs.unlink(filepath);
    } catch (error) {
      // Файл может не существовать, продолжаем
    }

    // Удалить запись из БД
    await prisma.backupLog.delete({
      where: { id: backupId },
    });

    return { success: true };
  }

  // Очистить старые резервные копии
  async cleanOldBackups(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldBackups = await prisma.backupLog.findMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    let deletedCount = 0;

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id);
        deletedCount++;
      } catch (error) {
        console.error(`Ошибка при удалении резервной копии ${backup.id}:`, error);
      }
    }

    return { deletedCount };
  }

  // Получить статистику по резервным копиям
  async getBackupStats() {
    const [total, completed, failed, inProgress, totalSize] = await Promise.all([
      prisma.backupLog.count(),
      prisma.backupLog.count({ where: { status: BackupStatus.COMPLETED } }),
      prisma.backupLog.count({ where: { status: BackupStatus.FAILED } }),
      prisma.backupLog.count({ where: { status: BackupStatus.IN_PROGRESS } }),
      prisma.backupLog.aggregate({
        where: { status: BackupStatus.COMPLETED },
        _sum: { size: true },
      }),
    ]);

    const lastBackup = await prisma.backupLog.findFirst({
      where: { status: BackupStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
    });

    return {
      total,
      completed,
      failed,
      inProgress,
      totalSize: Number(totalSize._sum.size || 0),
      lastBackup,
    };
  }
}

export default new BackupService();

