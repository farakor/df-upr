import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// Получить все записи аудита
router.get('/', auditController.getAuditLogs);

// Получить статистику по аудиту
router.get('/stats', auditController.getAuditStats);

// Получить записи аудита по пользователю
router.get('/user/:userId', auditController.getUserAuditLogs);

// Получить записи аудита по сущности
router.get('/entity/:entityType/:entityId', auditController.getEntityAuditLogs);

// Очистить старые записи аудита
router.post('/clean', auditController.cleanOldLogs);

export default router;

