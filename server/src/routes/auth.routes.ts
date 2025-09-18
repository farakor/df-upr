import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticateToken, requireAdmin } from '@/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting для аутентификации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за 15 минут
  message: {
    error: 'Слишком много попыток входа. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // максимум 3 регистрации за час с одного IP
  message: {
    error: 'Слишком много попыток регистрации. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Публичные маршруты
router.post('/login', authLimiter, AuthController.login);
router.post('/register', registerLimiter, requireAdmin, AuthController.register); // Только админ может регистрировать
router.post('/refresh', AuthController.refreshToken);

// Защищенные маршруты
router.use(authenticateToken); // Все маршруты ниже требуют аутентификации

router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);
router.get('/check', AuthController.checkAuth);

export default router;
