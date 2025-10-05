import { Router } from 'express';
import systemSettingsController from '../controllers/systemSettings.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// Получить все настройки
router.get('/', auditLog('settings', 'LIST'), systemSettingsController.getAllSettings);

// Получить все категории
router.get('/categories', auditLog('settings', 'LIST_CATEGORIES'), systemSettingsController.getCategories);

// Экспорт настроек
router.get('/export', auditLog('settings', 'EXPORT'), systemSettingsController.exportSettings);

// Получить настройки по категории
router.get('/category/:category', auditLog('settings', 'LIST_BY_CATEGORY'), systemSettingsController.getSettingsByCategory);

// Получить настройку по ключу
router.get('/:key', auditLog('settings', 'VIEW'), systemSettingsController.getSettingByKey);

// Создать или обновить настройку
router.post('/', auditLog('settings', 'UPSERT'), systemSettingsController.upsertSetting);

// Обновить значение настройки
router.put('/:key', auditLog('settings', 'UPDATE'), systemSettingsController.updateValue);

// Обновить несколько настроек
router.put('/', auditLog('settings', 'UPDATE_MULTIPLE'), systemSettingsController.updateMultiple);

// Импорт настроек
router.post('/import', auditLog('settings', 'IMPORT'), systemSettingsController.importSettings);

// Сброс настроек к значениям по умолчанию
router.post('/reset', auditLog('settings', 'RESET'), systemSettingsController.resetToDefaults);

// Удалить настройку
router.delete('/:key', auditLog('settings', 'DELETE'), systemSettingsController.deleteSetting);

export default router;

