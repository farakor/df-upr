# 📁 Структура проекта

## 📋 Обзор

Данный документ описывает детальную структуру проекта DF-UPR, организацию файлов, соглашения по именованию и архитектурные принципы.

## 🏗 Общая архитектура

```
df-upr/
├── client/                 # React Frontend
├── server/                 # Node.js Backend  
├── shared/                 # Общие типы и утилиты
├── docs/                   # Документация проекта
├── database/              # SQL скрипты и миграции
├── scripts/               # Скрипты автоматизации
├── .github/               # GitHub Actions и шаблоны
├── docker/                # Docker конфигурации (будущее)
└── README.md              # Основная документация
```

---

## 🖥 Frontend структура (client/)

### Общая организация
```
client/
├── public/                 # Статические файлы
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── index.html
├── src/                   # Исходный код
│   ├── components/        # Переиспользуемые компоненты
│   ├── pages/            # Страницы приложения
│   ├── hooks/            # Кастомные React хуки
│   ├── services/         # API сервисы и HTTP клиенты
│   ├── store/            # Управление состоянием (Redux/Zustand)
│   ├── utils/            # Утилиты и хелперы
│   ├── types/            # TypeScript типы
│   ├── constants/        # Константы приложения
│   ├── styles/           # Глобальные стили и темы
│   ├── assets/           # Изображения, иконки, шрифты
│   ├── App.tsx           # Главный компонент приложения
│   ├── main.tsx          # Точка входа
│   └── vite-env.d.ts     # Типы для Vite
├── package.json          # Зависимости и скрипты
├── vite.config.ts        # Конфигурация Vite
├── tsconfig.json         # Конфигурация TypeScript
├── tsconfig.node.json    # TypeScript для Node.js скриптов
├── .eslintrc.cjs         # Конфигурация ESLint
├── .env                  # Переменные окружения
└── .env.example          # Пример переменных окружения
```

### Детальная структура компонентов
```
src/components/
├── common/               # Общие UI компоненты
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   ├── Table/
│   ├── Layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout.tsx
│   └── index.ts          # Barrel exports
├── forms/                # Специализированные формы
│   ├── ProductForm/
│   ├── RecipeForm/
│   ├── SaleForm/
│   └── index.ts
├── charts/               # Графики и диаграммы
│   ├── SalesChart/
│   ├── StockChart/
│   ├── ProfitabilityChart/
│   └── index.ts
├── tables/               # Специализированные таблицы
│   ├── ProductsTable/
│   ├── SalesTable/
│   ├── StockMovementsTable/
│   └── index.ts
└── widgets/              # Виджеты для дашборда
    ├── SalesWidget/
    ├── StockWidget/
    ├── AlertsWidget/
    └── index.ts
```

### Структура страниц
```
src/pages/
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── Dashboard.test.tsx
│   ├── components/       # Компоненты специфичные для дашборда
│   │   ├── KPICards/
│   │   ├── SalesChart/
│   │   └── RecentActivity/
│   ├── hooks/           # Хуки специфичные для дашборда
│   │   └── useDashboardData.ts
│   └── index.ts
├── Products/
│   ├── ProductsList.tsx
│   ├── ProductDetails.tsx
│   ├── ProductForm.tsx
│   ├── components/
│   │   ├── ProductCard/
│   │   ├── CategoryTree/
│   │   └── ImportDialog/
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   └── useCategories.ts
│   └── index.ts
├── Recipes/
├── Menu/
├── Warehouse/
├── Inventory/
├── Sales/
├── Reports/
├── Settings/
└── Auth/
    ├── Login.tsx
    ├── Register.tsx
    └── index.ts
```

### Сервисы и API
```
src/services/
├── api/                  # HTTP клиенты
│   ├── client.ts         # Базовый Axios клиент
│   ├── auth.ts           # Аутентификация API
│   ├── products.ts       # Товары API
│   ├── recipes.ts        # Рецепты API
│   ├── warehouse.ts      # Склад API
│   ├── sales.ts          # Продажи API
│   ├── reports.ts        # Отчеты API
│   └── index.ts
├── storage/              # Локальное хранение
│   ├── localStorage.ts
│   ├── sessionStorage.ts
│   └── index.ts
├── notifications/        # Уведомления
│   ├── toast.ts
│   ├── push.ts
│   └── index.ts
└── validation/           # Валидация форм
    ├── schemas/
    │   ├── product.ts
    │   ├── recipe.ts
    │   └── sale.ts
    └── index.ts
```

### Утилиты и хелперы
```
src/utils/
├── formatters/           # Форматирование данных
│   ├── currency.ts
│   ├── date.ts
│   ├── number.ts
│   └── index.ts
├── validators/           # Валидация
│   ├── email.ts
│   ├── phone.ts
│   └── index.ts
├── helpers/              # Вспомогательные функции
│   ├── calculations.ts
│   ├── sorting.ts
│   ├── filtering.ts
│   └── index.ts
├── constants/            # Константы
│   ├── api.ts
│   ├── routes.ts
│   ├── roles.ts
│   └── index.ts
└── types/                # Общие типы
    ├── api.ts
    ├── user.ts
    ├── product.ts
    ├── recipe.ts
    └── index.ts
```

---

## 🔧 Backend структура (server/)

### Общая организация
```
server/
├── src/                  # Исходный код
│   ├── controllers/      # Контроллеры API
│   ├── services/         # Бизнес-логика
│   ├── models/          # Модели данных (если не используется ORM)
│   ├── routes/          # Маршруты API
│   ├── middleware/      # Middleware функции
│   ├── utils/           # Утилиты и хелперы
│   ├── types/           # TypeScript типы
│   ├── config/          # Конфигурация приложения
│   ├── validators/      # Схемы валидации
│   ├── jobs/            # Фоновые задачи
│   └── app.ts           # Главный файл приложения
├── prisma/              # Prisma ORM
│   ├── schema.prisma    # Схема базы данных
│   ├── migrations/      # Миграции БД
│   └── seed.ts          # Начальные данные
├── uploads/             # Загруженные файлы
├── logs/                # Логи приложения
├── tests/               # Тесты
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json         # Зависимости и скрипты
├── tsconfig.json        # Конфигурация TypeScript
├── .eslintrc.js         # Конфигурация ESLint
├── .env                 # Переменные окружения
├── .env.example         # Пример переменных
└── Dockerfile           # Docker конфигурация (будущее)
```

### Контроллеры
```
src/controllers/
├── auth.controller.ts    # Аутентификация
├── users.controller.ts   # Пользователи
├── products.controller.ts # Товары
├── categories.controller.ts # Категории
├── recipes.controller.ts # Рецепты
├── menu.controller.ts    # Меню
├── warehouses.controller.ts # Склады
├── suppliers.controller.ts # Поставщики
├── documents.controller.ts # Документы
├── inventory.controller.ts # Инвентаризация
├── sales.controller.ts   # Продажи
├── reports.controller.ts # Отчеты
├── settings.controller.ts # Настройки
└── index.ts             # Barrel exports
```

### Сервисы (бизнес-логика)
```
src/services/
├── auth.service.ts       # Аутентификация и авторизация
├── products.service.ts   # Управление товарами
├── recipes.service.ts    # Управление рецептами
├── warehouse.service.ts  # Складские операции
├── inventory.service.ts  # Инвентаризация
├── sales.service.ts      # Продажи
├── reports.service.ts    # Генерация отчетов
├── notifications.service.ts # Уведомления
├── email.service.ts      # Email рассылка
├── file.service.ts       # Работа с файлами
├── calculation.service.ts # Расчеты себестоимости
└── index.ts
```

### Маршруты API
```
src/routes/
├── api/
│   ├── v1/              # Версия API v1
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── recipes.routes.ts
│   │   ├── warehouse.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── sales.routes.ts
│   │   ├── reports.routes.ts
│   │   ├── settings.routes.ts
│   │   └── index.ts
│   └── index.ts
├── health.routes.ts     # Health check endpoints
└── index.ts
```

### Middleware
```
src/middleware/
├── auth.middleware.ts    # Проверка аутентификации
├── roles.middleware.ts   # Проверка ролей
├── validation.middleware.ts # Валидация запросов
├── error.middleware.ts   # Обработка ошибок
├── logging.middleware.ts # Логирование запросов
├── cors.middleware.ts    # CORS настройки
├── rateLimit.middleware.ts # Rate limiting
├── upload.middleware.ts  # Загрузка файлов
└── index.ts
```

### Утилиты
```
src/utils/
├── database/
│   ├── connection.ts     # Подключение к БД
│   ├── migrations.ts     # Утилиты миграций
│   └── seeds.ts          # Утилиты для seed данных
├── logger/
│   ├── logger.ts         # Настройка логгера
│   ├── transports.ts     # Транспорты логов
│   └── formatters.ts     # Форматтеры логов
├── validation/
│   ├── schemas/          # Joi схемы валидации
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   ├── recipe.schema.ts
│   │   └── index.ts
│   └── validators.ts     # Кастомные валидаторы
├── helpers/
│   ├── password.ts       # Хеширование паролей
│   ├── jwt.ts            # JWT утилиты
│   ├── email.ts          # Email утилиты
│   ├── file.ts           # Файловые утилиты
│   └── calculations.ts   # Математические расчеты
├── constants/
│   ├── errors.ts         # Коды ошибок
│   ├── roles.ts          # Роли пользователей
│   ├── statuses.ts       # Статусы документов
│   └── index.ts
└── types/
    ├── express.d.ts      # Расширения Express типов
    ├── api.ts            # API типы
    ├── database.ts       # Типы БД
    └── index.ts
```

---

## 📊 Shared структура (shared/)

```
shared/
├── types/                # Общие TypeScript типы
│   ├── api/
│   │   ├── requests.ts
│   │   ├── responses.ts
│   │   └── index.ts
│   ├── entities/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── recipe.ts
│   │   ├── sale.ts
│   │   └── index.ts
│   └── index.ts
├── constants/            # Общие константы
│   ├── roles.ts
│   ├── statuses.ts
│   ├── errors.ts
│   └── index.ts
├── utils/                # Общие утилиты
│   ├── validation.ts
│   ├── formatting.ts
│   ├── calculations.ts
│   └── index.ts
├── schemas/              # Схемы валидации (Zod/Joi)
│   ├── product.schema.ts
│   ├── recipe.schema.ts
│   └── index.ts
└── package.json          # Если shared как отдельный пакет
```

---

## 📚 Документация (docs/)

```
docs/
├── README.md                    # Основная документация
├── TECHNICAL_SPECIFICATION.md  # Техническая спецификация
├── DATABASE_SCHEMA.md           # Схема базы данных
├── API_DOCUMENTATION.md         # Документация API
├── MODULES_SPECIFICATION.md     # Спецификация модулей
├── DEVELOPMENT_PLAN.md          # План разработки
├── PROJECT_STRUCTURE.md         # Структура проекта (этот файл)
├── DEPLOYMENT_GUIDE.md          # Руководство по развертыванию
├── USER_MANUAL.md               # Руководство пользователя
├── CONTRIBUTING.md              # Руководство для разработчиков
├── CHANGELOG.md                 # История изменений
├── assets/                      # Изображения для документации
│   ├── screenshots/
│   ├── diagrams/
│   └── logos/
└── api/                         # Автогенерируемая API документация
    ├── openapi.yaml
    └── swagger.json
```

---

## 🗄 База данных (database/)

```
database/
├── migrations/           # SQL миграции (если не используется Prisma)
│   ├── 001_initial_schema.sql
│   ├── 002_add_recipes.sql
│   └── ...
├── seeds/               # Начальные данные
│   ├── users.sql
│   ├── categories.sql
│   ├── products.sql
│   └── ...
├── scripts/             # Утилитарные скрипты
│   ├── backup.sh
│   ├── restore.sh
│   └── cleanup.sh
├── views/               # SQL представления
│   ├── current_stock.sql
│   ├── sales_analytics.sql
│   └── ...
└── functions/           # Хранимые процедуры и функции
    ├── calculate_recipe_cost.sql
    ├── update_stock_balance.sql
    └── ...
```

---

## 🔧 Скрипты автоматизации (scripts/)

```
scripts/
├── dev/                 # Скрипты для разработки
│   ├── setup.sh         # Первоначальная настройка
│   ├── start-dev.sh     # Запуск в режиме разработки
│   ├── reset-db.sh      # Сброс базы данных
│   └── generate-types.sh # Генерация TypeScript типов
├── build/               # Скрипты сборки
│   ├── build-client.sh
│   ├── build-server.sh
│   └── build-all.sh
├── deploy/              # Скрипты развертывания
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   └── rollback.sh
├── maintenance/         # Скрипты обслуживания
│   ├── backup-db.sh
│   ├── cleanup-logs.sh
│   └── update-deps.sh
└── utils/               # Утилитарные скрипты
    ├── generate-docs.sh
    ├── run-tests.sh
    └── check-health.sh
```

---

## 🐙 GitHub конфигурация (.github/)

```
.github/
├── workflows/           # GitHub Actions
│   ├── ci.yml           # Continuous Integration
│   ├── cd.yml           # Continuous Deployment
│   ├── test.yml         # Автоматическое тестирование
│   └── docs.yml         # Генерация документации
├── ISSUE_TEMPLATE/      # Шаблоны issues
│   ├── bug_report.md
│   ├── feature_request.md
│   └── question.md
├── PULL_REQUEST_TEMPLATE.md # Шаблон PR
├── CODEOWNERS           # Владельцы кода
└── dependabot.yml       # Настройки Dependabot
```

---

## 📝 Соглашения по именованию

### Файлы и папки
- **Компоненты React**: PascalCase (`ProductForm.tsx`)
- **Хуки**: camelCase с префиксом `use` (`useProducts.ts`)
- **Утилиты**: camelCase (`formatCurrency.ts`)
- **Константы**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Типы**: PascalCase (`User.ts`, `ProductResponse.ts`)
- **Папки**: kebab-case (`user-management/`)

### Переменные и функции
- **Переменные**: camelCase (`userName`, `productList`)
- **Константы**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- **Функции**: camelCase (`calculateTotal`, `validateEmail`)
- **Классы**: PascalCase (`UserService`, `ProductController`)
- **Интерфейсы**: PascalCase с префиксом `I` (`IUser`, `IProductService`)
- **Типы**: PascalCase (`UserRole`, `ProductStatus`)

### База данных
- **Таблицы**: snake_case во множественном числе (`users`, `product_categories`)
- **Колонки**: snake_case (`first_name`, `created_at`)
- **Индексы**: `idx_table_column` (`idx_users_email`)
- **Внешние ключи**: `fk_table_referenced_table` (`fk_products_categories`)

### API Endpoints
- **Ресурсы**: kebab-case во множественном числе (`/api/products`, `/api/menu-items`)
- **Действия**: глаголы в конце (`/api/products/1/activate`)
- **Версионирование**: `/api/v1/products`

---

## 🔒 Безопасность файловой структуры

### Защищенные файлы
```
# Не должны попадать в git
.env
.env.local
.env.production
/uploads/*
/logs/*
/node_modules/
/dist/
/build/
```

### Конфиденциальные данные
- Все секреты в переменных окружения
- Файлы конфигурации с примерами (`.env.example`)
- Отдельные конфигурации для разных сред

---

## 📦 Управление зависимостями

### Package.json структура
```json
{
  "name": "df-upr",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:server && npm run build:client",
    "test": "npm run test:server && npm run test:client",
    "lint": "npm run lint:server && npm run lint:client"
  },
  "workspaces": [
    "client",
    "server",
    "shared"
  ]
}
```

### Монорепозиторий vs отдельные репозитории
**Текущий выбор**: Монорепозиторий с workspace
- Упрощенная синхронизация изменений
- Общие типы и утилиты
- Единые CI/CD пайплайны
- Возможность атомарных изменений

---

## 🚀 Масштабирование структуры

### При росте команды
- Разделение по доменам (`/domains/products/`, `/domains/sales/`)
- Микрофронтенды для больших команд
- Отдельные репозитории для независимых модулей

### При росте функционала
- Плагинная архитектура для новых модулей
- Отдельные сервисы для тяжелых операций
- Микросервисная архитектура при необходимости

Эта структура обеспечивает четкую организацию кода, упрощает навигацию и поддержку проекта, а также позволяет легко масштабировать систему по мере роста требований.
