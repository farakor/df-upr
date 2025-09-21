import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler } from '@/middleware/error.middleware';
import { notFoundHandler } from '@/middleware/notFound.middleware';
import { logger } from '@/utils/logger';
import { config } from '@/config/app';

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Базовые middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// CORS настройки
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);
    
    // Проверяем, есть ли origin в списке разрешенных
    if (Array.isArray(config.corsOrigin)) {
      if (config.corsOrigin.includes(origin)) {
        return callback(null, true);
      }
    } else if (config.corsOrigin === origin) {
      return callback(null, true);
    }
    
    // В режиме разработки разрешаем все localhost порты
    if (config.nodeEnv === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // максимум 1000 запросов с одного IP
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API маршруты
import apiRoutes from '@/routes/index';
app.use('/api/v1', apiRoutes);

// Обработка 404
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

const PORT = config.port || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Сервер запущен на порту ${PORT}`);
  logger.info(`🌍 Окружение: ${config.nodeEnv}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM получен, закрываю сервер...');
  server.close(() => {
    logger.info('Сервер закрыт');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT получен, закрываю сервер...');
  server.close(() => {
    logger.info('Сервер закрыт');
    process.exit(0);
  });
});

export default app;
