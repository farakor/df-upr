# 🛠 Техническая спецификация

## 📋 Обзор

Данный документ описывает техническую архитектуру системы управленческого учета сети столовых DF-UPR.

## 🏗 Архитектура системы

### Общая архитектура
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Express API   │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Технологический стек

#### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.x | Основной UI фреймворк |
| TypeScript | 5.x | Типизация |
| Vite | 4.x | Сборщик и dev сервер |
| Material-UI | 5.x | UI компоненты |
| React Router | 6.x | Маршрутизация |
| React Query | 4.x | Управление состоянием сервера |
| React Hook Form | 7.x | Управление формами |
| Chart.js | 4.x | Графики и диаграммы |
| Axios | 1.x | HTTP клиент |

#### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 18.x | Runtime окружение |
| Express.js | 4.x | Web фреймворк |
| TypeScript | 5.x | Типизация |
| Prisma | 5.x | ORM |
| JWT | 9.x | Аутентификация |
| Bcrypt | 5.x | Хеширование паролей |
| Multer | 1.x | Загрузка файлов |
| Joi | 17.x | Валидация данных |

#### База данных
| Технология | Версия | Назначение |
|------------|--------|------------|
| PostgreSQL | 14.x | Основная БД |
| Redis | 7.x | Кеширование (опционально) |

#### Инструменты разработки
| Технология | Версия | Назначение |
|------------|--------|------------|
| ESLint | 8.x | Линтер |
| Prettier | 3.x | Форматирование кода |
| Jest | 29.x | Тестирование |
| Husky | 8.x | Git hooks |
| Docker | 24.x | Контейнеризация (будущее) |

## 🔧 Конфигурация окружения

### Переменные окружения

#### Backend (.env)
```env
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/dfupr"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Сервер
PORT=3001
NODE_ENV="development"

# Файлы
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="10mb"

# Email (опционально)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Frontend (.env)
```env
# API
VITE_API_URL="http://localhost:3001/api"

# Приложение
VITE_APP_NAME="DF-UPR"
VITE_APP_VERSION="1.0.0"

# Настройки
VITE_ITEMS_PER_PAGE=20
VITE_MAX_UPLOAD_SIZE="10485760"
```

## 📁 Структура проекта

### Frontend структура
```
client/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── common/         # Общие компоненты
│   │   ├── forms/          # Формы
│   │   ├── tables/         # Таблицы
│   │   └── charts/         # Графики
│   ├── pages/              # Страницы приложения
│   │   ├── Dashboard/
│   │   ├── Products/
│   │   ├── Recipes/
│   │   ├── Menu/
│   │   ├── Warehouse/
│   │   ├── Inventory/
│   │   ├── Sales/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── hooks/              # Кастомные хуки
│   ├── services/           # API сервисы
│   ├── utils/              # Утилиты
│   ├── types/              # TypeScript типы
│   ├── constants/          # Константы
│   ├── styles/             # Стили
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env
```

### Backend структура
```
server/
├── src/
│   ├── controllers/        # Контроллеры API
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── recipes.controller.ts
│   │   ├── warehouse.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── sales.controller.ts
│   │   └── reports.controller.ts
│   ├── middleware/         # Middleware функции
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/             # Маршруты API
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── recipes.routes.ts
│   │   ├── warehouse.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── sales.routes.ts
│   │   └── reports.routes.ts
│   ├── services/           # Бизнес-логика
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── recipes.service.ts
│   │   ├── warehouse.service.ts
│   │   ├── inventory.service.ts
│   │   ├── sales.service.ts
│   │   └── reports.service.ts
│   ├── utils/              # Утилиты
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/              # TypeScript типы
│   ├── config/             # Конфигурация
│   │   ├── database.ts
│   │   └── app.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── uploads/                # Загруженные файлы
├── package.json
├── tsconfig.json
└── .env
```

## 🔐 Безопасность

### Аутентификация и авторизация
- JWT токены для аутентификации
- Refresh токены для обновления сессий
- Роли пользователей (admin, manager, operator, viewer)
- Middleware для проверки прав доступа

### Валидация данных
- Joi схемы для валидации входящих данных
- Sanitization пользовательского ввода
- Проверка типов данных на уровне TypeScript

### Защита API
- Rate limiting для предотвращения DDoS
- CORS настройки
- Helmet.js для безопасности заголовков
- Валидация файлов при загрузке

## 📊 Производительность

### Оптимизация Frontend
- Code splitting по маршрутам
- Lazy loading компонентов
- Мемоизация тяжелых вычислений
- Виртуализация больших списков
- Оптимизация изображений

### Оптимизация Backend
- Индексы в базе данных
- Пагинация для больших выборок
- Кеширование частых запросов
- Connection pooling для БД
- Сжатие ответов

### Мониторинг
- Логирование ошибок и операций
- Метрики производительности
- Health check endpoints
- Мониторинг использования ресурсов

## 🧪 Тестирование

### Frontend тестирование
- Unit тесты с Jest и React Testing Library
- Integration тесты для ключевых флоу
- E2E тесты с Playwright (планируется)

### Backend тестирование
- Unit тесты для сервисов и утилит
- Integration тесты для API endpoints
- Тесты базы данных с тестовой схемой

### Покрытие тестами
- Минимум 70% покрытия для критического функционала
- 100% покрытие для утилит и хелперов
- Обязательные тесты для API endpoints

## 🚀 Развертывание

### Development
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### Production
```bash
# Сборка frontend
cd client
npm run build

# Запуск backend
cd server
npm run build
npm start
```

### Переменные окружения Production
- Использование внешней PostgreSQL
- Настройка HTTPS
- Конфигурация reverse proxy (nginx)
- Настройка логирования

## 📈 Масштабирование

### Горизонтальное масштабирование
- Stateless backend для возможности репликации
- Внешнее хранение сессий (Redis)
- CDN для статических файлов
- Load balancer для распределения нагрузки

### Вертикальное масштабирование
- Оптимизация запросов к БД
- Увеличение ресурсов сервера
- Настройка пулов соединений
- Кеширование на разных уровнях

## 🔧 Инструменты разработки

### IDE настройки
- VS Code с расширениями для React/TypeScript
- Настройки ESLint и Prettier
- Snippets для ускорения разработки
- Debugger конфигурации

### Git workflow
- Feature branches для новых функций
- Pull requests для code review
- Conventional commits
- Автоматические проверки при коммитах

### CI/CD (планируется)
- GitHub Actions для автоматизации
- Автоматические тесты при PR
- Автоматическое развертывание
- Уведомления о статусе сборки
