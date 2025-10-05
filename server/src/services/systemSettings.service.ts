import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SystemSettingsService {
  // Получить все настройки
  async getAllSettings(includePrivate: boolean = false) {
    const where = includePrivate ? {} : { isPublic: true };
    
    return await prisma.systemSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  // Получить настройки по категории
  async getSettingsByCategory(category: string, includePrivate: boolean = false) {
    const where: any = { category };
    if (!includePrivate) where.isPublic = true;

    return await prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  // Получить настройку по ключу
  async getSettingByKey(key: string) {
    return await prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  // Получить значение настройки
  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    const setting = await this.getSettingByKey(key);
    return setting ? (setting.value as T) : (defaultValue as T);
  }

  // Создать или обновить настройку
  async upsertSetting(
    key: string,
    value: any,
    category: string,
    description?: string,
    isPublic: boolean = false,
    updatedBy?: number
  ) {
    return await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        category,
        description,
        isPublic,
        updatedBy,
      },
      create: {
        key,
        value,
        category,
        description,
        isPublic,
        updatedBy,
      },
    });
  }

  // Обновить значение настройки
  async updateValue(key: string, value: any, updatedBy?: number) {
    return await prisma.systemSetting.update({
      where: { key },
      data: {
        value,
        updatedBy,
      },
    });
  }

  // Обновить несколько настроек
  async updateMultiple(
    settings: Array<{ key: string; value: any }>,
    updatedBy?: number
  ) {
    const results = await Promise.all(
      settings.map(setting =>
        this.updateValue(setting.key, setting.value, updatedBy)
      )
    );
    return results;
  }

  // Удалить настройку
  async deleteSetting(key: string) {
    return await prisma.systemSetting.delete({
      where: { key },
    });
  }

  // Получить все категории
  async getCategories() {
    const settings = await prisma.systemSetting.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return settings.map(s => s.category);
  }

  // Экспорт настроек
  async exportSettings() {
    const settings = await this.getAllSettings(true);
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
  }

  // Импорт настроек
  async importSettings(
    settings: Record<string, any>,
    updatedBy?: number
  ) {
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const existing = await this.getSettingByKey(key);
      
      if (existing) {
        const result = await this.updateValue(key, value, updatedBy);
        results.push(result);
      }
    }

    return results;
  }

  // Сброс настроек к значениям по умолчанию
  async resetToDefaults(category?: string) {
    // Здесь можно определить значения по умолчанию
    const defaults: Record<string, any> = {
      'app.name': 'DF-UPR',
      'app.version': '1.0.0',
      'app.timezone': 'UTC',
      'app.language': 'ru',
      'backup.auto_enabled': false,
      'backup.schedule': '0 2 * * *',
      'backup.retention_days': 30,
      'notifications.low_stock_enabled': true,
      'notifications.low_stock_threshold': 10,
      'security.session_timeout': 3600,
      'security.password_min_length': 8,
      'security.max_login_attempts': 5,
    };

    const settingsToReset = category
      ? await this.getSettingsByCategory(category, true)
      : await this.getAllSettings(true);

    const results = [];
    for (const setting of settingsToReset) {
      if (defaults[setting.key]) {
        const result = await this.updateValue(setting.key, defaults[setting.key]);
        results.push(result);
      }
    }

    return results;
  }
}

export default new SystemSettingsService();

