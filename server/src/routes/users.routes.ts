import { Router } from 'express';
import usersController from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// Получить всех пользователей
router.get('/', auditLog('users', 'LIST'), usersController.getAllUsers);

// Получить статистику по пользователям
router.get('/stats', auditLog('users', 'STATS'), usersController.getUsersStats);

// Получить пользователя по ID
router.get('/:id', auditLog('users', 'VIEW'), usersController.getUserById);

// Создать пользователя
router.post('/', auditLog('users', 'CREATE'), usersController.createUser);

// Обновить пользователя
router.put('/:id', auditLog('users', 'UPDATE'), usersController.updateUser);

// Изменить пароль
router.put('/:id/password', auditLog('users', 'CHANGE_PASSWORD'), usersController.changePassword);

// Деактивировать пользователя
router.put('/:id/deactivate', auditLog('users', 'DEACTIVATE'), usersController.deactivateUser);

// Активировать пользователя
router.put('/:id/activate', auditLog('users', 'ACTIVATE'), usersController.activateUser);

// Удалить пользователя
router.delete('/:id', auditLog('users', 'DELETE'), usersController.deleteUser);

export default router;

