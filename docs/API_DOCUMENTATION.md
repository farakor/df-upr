# 🔌 API Документация

## 📋 Обзор

REST API для системы управленческого учета сети столовых DF-UPR. API следует принципам RESTful архитектуры и возвращает данные в формате JSON.

## 🌐 Базовая информация

- **Base URL**: `http://localhost:3001/api`
- **Версия API**: `v1`
- **Формат данных**: JSON
- **Аутентификация**: JWT Bearer Token
- **Кодировка**: UTF-8

## 🔐 Аутентификация

### Получение токена
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Иван",
      "lastName": "Иванов",
      "role": "manager"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Обновление токена
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Заголовки для авторизованных запросов
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📦 Номенклатура

### Получить список товаров
```http
GET /api/products?page=1&limit=20&search=молоко&categoryId=5&isActive=true
```

**Параметры запроса:**
- `page` (number, optional) - номер страницы (по умолчанию 1)
- `limit` (number, optional) - количество элементов на странице (по умолчанию 20)
- `search` (string, optional) - поиск по названию
- `categoryId` (number, optional) - фильтр по категории
- `isActive` (boolean, optional) - фильтр по активности

**Ответ:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Молоко 3.2%",
        "article": "MLK001",
        "barcode": "4607025392201",
        "category": {
          "id": 5,
          "name": "Молочные продукты"
        },
        "unit": {
          "id": 2,
          "name": "литр",
          "shortName": "л"
        },
        "shelfLifeDays": 7,
        "storageConditions": "От +2 до +6°C",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Создать товар
```http
POST /api/products
Content-Type: application/json

{
  "name": "Хлеб белый",
  "article": "BRD001",
  "barcode": "4607025392202",
  "categoryId": 3,
  "unitId": 1,
  "shelfLifeDays": 3,
  "storageTemperatureMin": 18,
  "storageTemperatureMax": 25,
  "storageConditions": "Сухое место",
  "description": "Хлеб пшеничный высшего сорта"
}
```

### Получить товар по ID
```http
GET /api/products/1
```

### Обновить товар
```http
PUT /api/products/1
Content-Type: application/json

{
  "name": "Молоко 3.2% обновленное",
  "isActive": false
}
```

### Удалить товар
```http
DELETE /api/products/1
```

### Категории товаров
```http
GET /api/categories
POST /api/categories
GET /api/categories/1
PUT /api/categories/1
DELETE /api/categories/1
```

## 👨‍🍳 Рецептуры

### Получить список рецептов
```http
GET /api/recipes?page=1&limit=20&search=борщ
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Борщ украинский",
        "description": "Традиционный украинский борщ",
        "portionSize": 250,
        "cookingTime": 120,
        "difficultyLevel": 3,
        "costPrice": 85.50,
        "marginPercent": 200,
        "sellingPrice": 256.50,
        "ingredients": [
          {
            "id": 1,
            "product": {
              "id": 10,
              "name": "Свекла"
            },
            "quantity": 100,
            "unit": {
              "id": 4,
              "shortName": "г"
            },
            "costPerUnit": 0.25,
            "isMain": true
          }
        ],
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Создать рецепт
```http
POST /api/recipes
Content-Type: application/json

{
  "name": "Суп куриный",
  "description": "Домашний куриный суп",
  "portionSize": 300,
  "cookingTime": 90,
  "difficultyLevel": 2,
  "marginPercent": 180,
  "instructions": "1. Отварить курицу...",
  "ingredients": [
    {
      "productId": 15,
      "quantity": 150,
      "unitId": 4,
      "isMain": true
    },
    {
      "productId": 20,
      "quantity": 50,
      "unitId": 4,
      "isMain": false
    }
  ]
}
```

### Расчет себестоимости рецепта
```http
GET /api/recipes/1/cost-calculation
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "recipeId": 1,
    "totalCost": 85.50,
    "costPerPortion": 85.50,
    "ingredients": [
      {
        "productId": 10,
        "productName": "Свекла",
        "quantity": 100,
        "unitPrice": 0.25,
        "totalCost": 25.00
      }
    ],
    "calculatedAt": "2024-01-15T15:30:00Z"
  }
}
```

## 🏪 Склад

### Получить список складов
```http
GET /api/warehouses
```

### Остатки на складе
```http
GET /api/warehouses/1/stock?productId=5&lowStock=true
```

**Параметры:**
- `productId` (number, optional) - фильтр по товару
- `lowStock` (boolean, optional) - только товары с низкими остатками

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "productId": 5,
      "productName": "Мука пшеничная",
      "quantity": 25.5,
      "unit": "кг",
      "avgPrice": 45.00,
      "totalValue": 1147.50,
      "lastMovementDate": "2024-01-14T14:20:00Z"
    }
  ]
}
```

### Создать документ прихода
```http
POST /api/documents
Content-Type: application/json

{
  "type": "receipt",
  "number": "ПН-000001",
  "date": "2024-01-15",
  "supplierId": 3,
  "warehouseToId": 1,
  "notes": "Поставка от ООО Продукты",
  "items": [
    {
      "productId": 5,
      "quantity": 50,
      "unitId": 4,
      "price": 45.00,
      "expiryDate": "2024-02-15",
      "batchNumber": "LOT123"
    }
  ]
}
```

### Перемещение между складами
```http
POST /api/documents
Content-Type: application/json

{
  "type": "transfer",
  "number": "ПМ-000001",
  "date": "2024-01-15",
  "warehouseFromId": 1,
  "warehouseToId": 2,
  "items": [
    {
      "productId": 5,
      "quantity": 10,
      "unitId": 4,
      "price": 45.00
    }
  ]
}
```

### История движений товара
```http
GET /api/movements?warehouseId=1&productId=5&dateFrom=2024-01-01&dateTo=2024-01-31
```

## 📋 Инвентаризация

### Создать инвентаризацию
```http
POST /api/inventories
Content-Type: application/json

{
  "warehouseId": 1,
  "number": "ИНВ-000001",
  "date": "2024-01-31",
  "responsiblePersonId": 2,
  "notes": "Месячная инвентаризация"
}
```

### Добавить позицию в инвентаризацию
```http
POST /api/inventories/1/items
Content-Type: application/json

{
  "productId": 5,
  "expectedQuantity": 25.5,
  "actualQuantity": 24.8,
  "price": 45.00,
  "notes": "Небольшая недостача",
  "countedById": 3
}
```

### Закрыть инвентаризацию
```http
POST /api/inventories/1/close
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "inventoryId": 1,
    "status": "completed",
    "adjustmentDocuments": [
      {
        "type": "writeoff",
        "documentId": 15,
        "amount": -31.50
      }
    ],
    "totalDifference": -31.50,
    "completedAt": "2024-01-31T18:00:00Z"
  }
}
```

## 💰 Продажи

### Регистрация продажи
```http
POST /api/sales
Content-Type: application/json

{
  "warehouseId": 2,
  "number": "ЧЕК-000001",
  "date": "2024-01-15T12:30:00Z",
  "paymentMethod": "cash",
  "cashierId": 4,
  "customerName": "Иванов И.И.",
  "items": [
    {
      "menuItemId": 10,
      "quantity": 2,
      "price": 256.50
    },
    {
      "menuItemId": 15,
      "quantity": 1,
      "price": 180.00
    }
  ]
}
```

### Статистика продаж
```http
GET /api/sales/stats?warehouseId=2&dateFrom=2024-01-01&dateTo=2024-01-31&groupBy=day
```

**Параметры:**
- `warehouseId` (number, optional) - фильтр по складу
- `dateFrom` (string) - начальная дата
- `dateTo` (string) - конечная дата  
- `groupBy` (string) - группировка: day, week, month

**Ответ:**
```json
{
  "success": true,
  "data": {
    "totalSales": 125600.50,
    "totalOrders": 450,
    "avgOrderValue": 279.11,
    "periods": [
      {
        "date": "2024-01-15",
        "sales": 4500.00,
        "orders": 18,
        "avgOrderValue": 250.00
      }
    ],
    "topItems": [
      {
        "menuItemId": 10,
        "name": "Борщ украинский",
        "quantity": 85,
        "revenue": 21802.50
      }
    ]
  }
}
```

## 🍽 Меню

### Получить меню склада
```http
GET /api/warehouses/2/menu?categoryId=3&available=true
```

### Обновить доступность позиции
```http
PUT /api/warehouses/2/menu-items/10
Content-Type: application/json

{
  "isAvailable": false,
  "priceOverride": 280.00
}
```

## 📈 Отчеты

### Отчет по остаткам
```http
GET /api/reports/stock?warehouseId=1&categoryId=5&date=2024-01-31
```

### Отчет по продажам
```http
GET /api/reports/sales?warehouseId=2&dateFrom=2024-01-01&dateTo=2024-01-31&format=json
```

**Параметры:**
- `format` (string) - формат ответа: json, excel, pdf

### ABC анализ
```http
GET /api/reports/abc-analysis?period=90&warehouseId=2
```

### Отчет по рентабельности
```http
GET /api/reports/profitability?dateFrom=2024-01-01&dateTo=2024-01-31&groupBy=category
```

### Создание кастомного отчета
```http
POST /api/reports/custom
Content-Type: application/json

{
  "name": "Отчет по недостачам",
  "type": "inventory_variance",
  "parameters": {
    "warehouseIds": [1, 2],
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "minVariance": 100
  }
}
```

## ⚙️ Настройки

### Пользователи
```http
GET /api/users
POST /api/users
GET /api/users/1
PUT /api/users/1
DELETE /api/users/1
```

### Поставщики
```http
GET /api/suppliers
POST /api/suppliers
GET /api/suppliers/1
PUT /api/suppliers/1
DELETE /api/suppliers/1
```

### Единицы измерения
```http
GET /api/units
POST /api/units
```

## 📄 Стандартные ответы

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "message": "Операция выполнена успешно"
}
```

### Ответ с пагинацией
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Ошибка валидации
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации данных",
    "details": [
      {
        "field": "name",
        "message": "Поле обязательно для заполнения"
      },
      {
        "field": "price",
        "message": "Цена должна быть больше 0"
      }
    ]
  }
}
```

### Ошибка аутентификации
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Требуется авторизация"
  }
}
```

### Ошибка доступа
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Недостаточно прав для выполнения операции"
  }
}
```

### Ошибка "не найдено"
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Запрашиваемый ресурс не найден"
  }
}
```

### Серверная ошибка
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Внутренняя ошибка сервера",
    "requestId": "req_123456789"
  }
}
```

## 🔍 Коды ошибок

| Код | HTTP Status | Описание |
|-----|-------------|----------|
| VALIDATION_ERROR | 400 | Ошибка валидации входных данных |
| UNAUTHORIZED | 401 | Требуется аутентификация |
| FORBIDDEN | 403 | Недостаточно прав доступа |
| NOT_FOUND | 404 | Ресурс не найден |
| CONFLICT | 409 | Конфликт данных (дублирование и т.д.) |
| UNPROCESSABLE_ENTITY | 422 | Невозможно обработать запрос |
| TOO_MANY_REQUESTS | 429 | Превышен лимит запросов |
| INTERNAL_ERROR | 500 | Внутренняя ошибка сервера |
| SERVICE_UNAVAILABLE | 503 | Сервис временно недоступен |

## 📊 Rate Limiting

- **Аутентифицированные пользователи**: 1000 запросов в час
- **Неаутентифицированные**: 100 запросов в час
- **Загрузка файлов**: 50 запросов в час

Заголовки ответа:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## 📁 Загрузка файлов

### Загрузка изображения товара
```http
POST /api/products/1/image
Content-Type: multipart/form-data

file: [binary data]
```

### Импорт товаров из Excel
```http
POST /api/products/import
Content-Type: multipart/form-data

file: [Excel file]
updateExisting: true
```

**Поддерживаемые форматы:**
- Изображения: JPG, PNG, WebP (макс. 5MB)
- Документы: Excel (.xlsx), CSV (макс. 10MB)

## 🔄 Webhook уведомления

### Настройка webhook
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["stock.low", "sale.created", "inventory.completed"],
  "secret": "your-webhook-secret"
}
```

### Пример уведомления
```json
{
  "event": "stock.low",
  "timestamp": "2024-01-15T15:30:00Z",
  "data": {
    "warehouseId": 1,
    "productId": 5,
    "currentQuantity": 2.5,
    "minQuantity": 10.0
  }
}
```

Эта документация покрывает все основные endpoints API системы DF-UPR и будет обновляться по мере развития проекта.
