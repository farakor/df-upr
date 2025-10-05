import { Request, Response, NextFunction } from 'express';
import systemSettingsService from '../services/systemSettings.service';

export class SystemSettingsController {
  // Получить все настройки
  async getAllSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const includePrivate = req.query.includePrivate === 'true';
      const settings = await systemSettingsService.getAllSettings(includePrivate);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  // Получить настройки по категории
  async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const includePrivate = req.query.includePrivate === 'true';
      
      const settings = await systemSettingsService.getSettingsByCategory(
        category,
        includePrivate
      );
      
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  // Получить настройку по ключу
  async getSettingByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const setting = await systemSettingsService.getSettingByKey(key);

      if (!setting) {
        res.status(404).json({
          success: false,
          message: 'Настройка не найдена',
        });
        return;
      }

      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  }

  // Создать или обновить настройку
  async upsertSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value, category, description, isPublic } = req.body;
      const updatedBy = req.user?.id;

      const setting = await systemSettingsService.upsertSetting(
        key,
        value,
        category,
        description,
        isPublic,
        updatedBy
      );

      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  }

  // Обновить значение настройки
  async updateValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const updatedBy = req.user?.id;

      const setting = await systemSettingsService.updateValue(
        key,
        value,
        updatedBy
      );

      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  }

  // Обновить несколько настроек
  async updateMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      const updatedBy = req.user?.id;

      const result = await systemSettingsService.updateMultiple(
        settings,
        updatedBy
      );

      res.json({
        success: true,
        message: `Обновлено ${result.length} настроек`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить настройку
  async deleteSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      await systemSettingsService.deleteSetting(key);
      res.json({ success: true, message: 'Настройка удалена' });
    } catch (error) {
      next(error);
    }
  }

  // Получить все категории
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await systemSettingsService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  // Экспорт настроек
  async exportSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemSettingsService.exportSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  // Импорт настроек
  async importSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      const updatedBy = req.user?.id;

      const result = await systemSettingsService.importSettings(
        settings,
        updatedBy
      );

      res.json({
        success: true,
        message: `Импортировано ${result.length} настроек`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Сброс настроек к значениям по умолчанию
  async resetToDefaults(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.body;
      const result = await systemSettingsService.resetToDefaults(category);
      
      res.json({
        success: true,
        message: `Сброшено ${result.length} настроек`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SystemSettingsController();

