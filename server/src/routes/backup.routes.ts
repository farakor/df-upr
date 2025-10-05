import { Router } from 'express';
import backupController from '../controllers/backup.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// Получить список резервных копий
router.get('/', auditLog('backup', 'LIST'), backupController.getBackups);

// Получить статистику по резервным копиям
router.get('/stats', auditLog('backup', 'STATS'), backupController.getBackupStats);

// Получить информацию о резервной копии
router.get('/:id', auditLog('backup', 'VIEW'), backupController.getBackupInfo);

// Создать резервную копию
router.post('/', auditLog('backup', 'CREATE'), backupController.createBackup);

// Восстановить из резервной копии
router.post('/:id/restore', auditLog('backup', 'RESTORE'), backupController.restoreBackup);

// Очистить старые резервные копии
router.post('/clean', auditLog('backup', 'CLEAN'), backupController.cleanOldBackups);

// Удалить резервную копию
router.delete('/:id', auditLog('backup', 'DELETE'), backupController.deleteBackup);

export default router;

