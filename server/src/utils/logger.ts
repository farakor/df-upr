import winston from 'winston';
import { config } from '@/config/app';

// Определение уровней логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Определение цветов для консоли
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Формат для консоли
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Формат для файла
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Определение транспортов
const transports = [
  // Консоль
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Файл для всех логов
  new winston.transports.File({
    filename: config.logFile,
    format: fileFormat,
  }),
  
  // Отдельный файл для ошибок
  new winston.transports.File({
    filename: config.logFile.replace('.log', '-error.log'),
    level: 'error',
    format: fileFormat,
  }),
];

// Создание логгера
export const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Функция для логирования HTTP запросов
export const httpLogger = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Функция для структурированного логирования
export const logWithContext = (
  level: keyof typeof levels,
  message: string,
  context?: Record<string, any>
) => {
  logger.log(level, message, context);
};

export default logger;
