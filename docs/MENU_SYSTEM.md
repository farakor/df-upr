# Система управления меню

## Обзор

Реализована полноценная система управления меню ресторана с трехуровневой структурой:

1. **Меню (Menu)** - основной контейнер (например, "Летнее меню", "Обеденное меню")
2. **Позиции меню (MenuItem)** - конкретные блюда в меню
3. **Связь с продуктами** - позиции меню теперь ссылаются на продукты из номенклатуры (готовые блюда)

## Структура базы данных

### Таблица `menus`

```sql
id              SERIAL PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
start_date      DATE
end_date        DATE
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP
```

### Таблица `menu_items` (обновлена)

```sql
id              SERIAL PRIMARY KEY
menu_id         INTEGER (ссылка на menus)
product_id      INTEGER (ссылка на products) -- ИЗМЕНЕНО: вместо recipe_id
category_id     INTEGER (ссылка на menu_categories)
name            TEXT NOT NULL
description     TEXT
price           DECIMAL(10, 2) NOT NULL
cost_price      DECIMAL(10, 2)
image_url       TEXT
is_available    BOOLEAN DEFAULT true
is_active       BOOLEAN DEFAULT true
sort_order      INTEGER DEFAULT 0
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP
```

### Основные изменения

1. ✅ Добавлена модель `Menu` для создания меню
2. ✅ `MenuItem.recipeId` → `MenuItem.productId` - позиции меню теперь ссылаются на продукты (блюда)
3. ✅ `MenuItem.menuId` - позиции меню привязаны к конкретному меню
4. ✅ Продукты могут иметь рецептуру (`Product.recipeId`)

## API Эндпоинты

### Меню

- `POST /api/menu` - создание меню
- `GET /api/menu` - список меню
- `GET /api/menu/:id` - получение меню по ID
- `PUT /api/menu/:id` - обновление меню
- `DELETE /api/menu/:id` - удаление меню

### Позиции меню

- `POST /api/menu/items` - создание позиции меню
- `GET /api/menu/items` - список позиций меню
- `GET /api/menu/items/:id` - получение позиции по ID
- `PUT /api/menu/items/:id` - обновление позиции
- `DELETE /api/menu/items/:id` - удаление позиции

Параметры запроса для списка позиций:
- `menuId` - фильтр по меню
- `productId` - фильтр по продукту
- `categoryId` - фильтр по категории
- `search` - поиск по названию
- `isActive` - фильтр активности
- `warehouseId` - фильтр по складу

### Категории меню

- `POST /api/menu/categories` - создание категории
- `GET /api/menu/categories` - список категорий
- `GET /api/menu/categories/:id` - получение категории по ID
- `PUT /api/menu/categories/:id` - обновление категории
- `DELETE /api/menu/categories/:id` - удаление категории

### Привязка к складам

- `POST /api/menu/warehouse-items` - добавление позиции меню на склад
- `PUT /api/menu/warehouses/:warehouseId/items/:menuItemId` - обновление настроек на складе
- `DELETE /api/menu/warehouses/:warehouseId/items/:menuItemId` - удаление с склада

### Проверка доступности

- `GET /api/menu/warehouses/:warehouseId/available` - получение доступного меню для склада
- `GET /api/menu/items/:menuItemId/availability?warehouseId=X&quantity=Y` - проверка доступности блюда

## Логика работы

### Создание меню

1. Администратор создает меню (например, "Летнее меню 2025")
2. Указывает название, описание, даты действия
3. Меню можно активировать/деактивировать

### Добавление позиций в меню

1. Выбирается меню, в которое добавляется позиция
2. Выбирается продукт из номенклатуры (готовое блюдо)
3. Указывается название позиции, описание, цена
4. Позиция может быть отнесена к категории меню

### Связь с рецептурой

- Продукт (блюдо) может иметь рецептуру (`Product.recipeId`)
- Рецептура содержит список ингредиентов
- При проверке доступности блюда система проверяет наличие ингредиентов на складе

### Пример структуры

```
Меню "Летнее меню 2025"
├── Категория "Горячие блюда"
│   ├── Позиция "Стейк рибай" → Продукт "Стейк рибай готовый" → Рецептура
│   └── Позиция "Паста карбонара" → Продукт "Паста карбонара" → Рецептура
└── Категория "Десерты"
    ├── Позиция "Тирамису" → Продукт "Тирамису" → Рецептура
    └── Позиция "Панна котта" → Продукт "Панна котта" → Рецептура
```

## Клиентская часть

### Хуки

- `useMenu()` - управление меню
- `useMenuItems()` - управление позициями меню (обновлен)
- `useMenuCategories()` - управление категориями меню

### Страницы

- `/menu` - список меню
- `/menu/display` - отображение меню для клиентов
- `/menu/items` - управление позициями меню
- `/menu/categories` - управление категориями меню
- `/menu/warehouse-settings` - настройка меню для складов

### Компоненты

- `MenuListPage` - список меню
- `MenuItemsPage` - список позиций меню (обновлен)
- `MenuCategoriesPage` - список категорий
- `MenuDisplayPage` - отображение меню
- `WarehouseMenuPage` - настройки меню по складам

## Миграция

Файл миграции: `20251005133908_add_menu_model_and_update_menu_items`

Основные изменения:
1. Создана таблица `menus`
2. В `menu_items` добавлены поля `menu_id` и `product_id`
3. Удалено поле `menu_items.recipe_id`
4. Добавлена связь `products.recipe_id` (для хранения рецептуры готовых блюд)

## Преимущества новой структуры

1. **Гибкость**: Можно создавать несколько меню (сезонные, тематические и т.д.)
2. **Логичность**: Позиции меню ссылаются на продукты (блюда), а не напрямую на рецептуры
3. **Контроль**: Рецептура хранится на уровне продукта, что соответствует бизнес-логике
4. **Масштабируемость**: Легко добавлять новые меню без дублирования позиций
5. **Отслеживание**: Можно видеть, в каких меню используется то или иное блюдо

## Пример использования

### Создание меню через API

```typescript
// Создание меню
const menu = await menuApi.createMenu({
  name: "Летнее меню 2025",
  description: "Освежающие блюда для жаркого лета",
  startDate: "2025-06-01",
  endDate: "2025-08-31"
});

// Добавление позиции в меню
const menuItem = await menuApi.createMenuItem({
  menuId: menu.id,
  productId: 42, // ID продукта "Цезарь с курицей"
  categoryId: 1, // ID категории "Салаты"
  name: "Цезарь с курицей",
  description: "Классический салат с хрустящими сухариками",
  price: 450,
  costPrice: 180,
  sortOrder: 1
});

// Добавление на склад
await menuApi.addWarehouseMenuItem({
  warehouseId: 1,
  menuItemId: menuItem.id,
  isAvailable: true,
  priceOverride: 500 // Особая цена для этого склада
});
```

### Проверка доступности блюда

```typescript
const availability = await menuApi.checkMenuItemAvailability(
  menuItemId,
  warehouseId,
  quantity
);

if (availability.isAvailable) {
  console.log("Блюдо доступно!");
} else {
  console.log("Недостающие ингредиенты:", availability.missingIngredients);
}
```

## Дальнейшее развитие

Возможные улучшения:
1. Добавление модификаторов к блюдам (размер, добавки)
2. Комбо-предложения (наборы блюд)
3. Акции и скидки на уровне меню
4. История изменений цен
5. A/B тестирование разных меню
6. Аналитика популярности блюд
