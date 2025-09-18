# 🗄 Схема базы данных

## 📋 Обзор

Данный документ описывает структуру базы данных PostgreSQL для системы управленческого учета сети столовых DF-UPR.

## 🏗 Общая архитектура БД

База данных спроектирована с учетом принципов нормализации и обеспечивает:
- Целостность данных через внешние ключи
- Аудит изменений через временные метки
- Масштабируемость через правильную индексацию
- Производительность через оптимизированные запросы

## 📊 Диаграмма связей

```
Users ──┐
         ├── Warehouses ──┬── StockMovements ──┬── Documents
         │                │                    │
         └── Suppliers ────┘                    ├── Products ──┬── Categories
                                               │              │
         Recipes ──┬── RecipeIngredients ──────┘              │
                   │                                          │
         MenuItems ─┴── Sales ──┬── SaleItems                 │
                                │                             │
         Inventories ───────────┴── InventoryItems ───────────┘
```

## 📋 Таблицы и их описание

### 👥 Пользователи и роли

#### `users` - Пользователи системы
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator', 'viewer');
```

#### `user_sessions` - Сессии пользователей
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🏢 Организационная структура

#### `warehouses` - Склады и точки питания
```sql
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type warehouse_type NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    manager_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE warehouse_type AS ENUM ('main', 'kitchen', 'retail');
```

#### `suppliers` - Поставщики
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    inn VARCHAR(20),
    kpp VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    payment_terms INTEGER DEFAULT 0, -- дни отсрочки
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📦 Номенклатура

#### `categories` - Категории товаров
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `units` - Единицы измерения
```sql
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    type unit_type NOT NULL,
    base_unit_id INTEGER REFERENCES units(id),
    conversion_factor DECIMAL(10,4) DEFAULT 1.0
);

CREATE TYPE unit_type AS ENUM ('weight', 'volume', 'piece', 'length');
```

#### `products` - Товары
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    article VARCHAR(50) UNIQUE,
    barcode VARCHAR(50),
    category_id INTEGER REFERENCES categories(id),
    unit_id INTEGER REFERENCES units(id) NOT NULL,
    shelf_life_days INTEGER,
    storage_temperature_min DECIMAL(4,1),
    storage_temperature_max DECIMAL(4,1),
    storage_conditions TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 👨‍🍳 Рецептуры

#### `recipes` - Рецепты
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    portion_size DECIMAL(8,3) NOT NULL, -- размер порции в граммах
    cooking_time INTEGER, -- время приготовления в минутах
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    instructions TEXT,
    cost_price DECIMAL(10,2), -- себестоимость (рассчитывается)
    margin_percent DECIMAL(5,2) DEFAULT 0,
    selling_price DECIMAL(10,2), -- цена продажи
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `recipe_ingredients` - Ингредиенты рецептов
```sql
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10,4) NOT NULL,
    unit_id INTEGER REFERENCES units(id) NOT NULL,
    cost_per_unit DECIMAL(10,4), -- стоимость за единицу на момент добавления
    is_main BOOLEAN DEFAULT false, -- основной ингредиент
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🍽 Меню

#### `menu_categories` - Категории меню
```sql
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `menu_items` - Позиции меню
```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recipe_id INTEGER REFERENCES recipes(id),
    category_id INTEGER REFERENCES menu_categories(id),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2), -- себестоимость
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `warehouse_menu_items` - Доступность позиций меню по складам
```sql
CREATE TABLE warehouse_menu_items (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    price_override DECIMAL(10,2), -- переопределение цены для конкретного склада
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, menu_item_id)
);
```

### 📋 Складские операции

#### `documents` - Документы движения товаров
```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL,
    type document_type NOT NULL,
    date DATE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    warehouse_from_id INTEGER REFERENCES warehouses(id),
    warehouse_to_id INTEGER REFERENCES warehouses(id),
    status document_status DEFAULT 'draft',
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE document_type AS ENUM ('receipt', 'transfer', 'writeoff', 'inventory_adjustment');
CREATE TYPE document_status AS ENUM ('draft', 'approved', 'cancelled');
```

#### `document_items` - Позиции документов
```sql
CREATE TABLE document_items (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10,4) NOT NULL,
    unit_id INTEGER REFERENCES units(id) NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    expiry_date DATE,
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `stock_movements` - Движения товаров
```sql
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    document_id INTEGER REFERENCES documents(id),
    type movement_type NOT NULL,
    quantity DECIMAL(10,4) NOT NULL, -- положительное для прихода, отрицательное для расхода
    price DECIMAL(10,4) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE movement_type AS ENUM ('in', 'out', 'transfer_in', 'transfer_out', 'writeoff', 'production_use');
```

#### `stock_balances` - Остатки товаров (материализованное представление)
```sql
CREATE TABLE stock_balances (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    quantity DECIMAL(10,4) NOT NULL DEFAULT 0,
    avg_price DECIMAL(10,4) NOT NULL DEFAULT 0,
    total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    last_movement_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);
```

### 📊 Инвентаризация

#### `inventories` - Инвентаризации
```sql
CREATE TABLE inventories (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    status inventory_status DEFAULT 'draft',
    responsible_person INTEGER REFERENCES users(id),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE inventory_status AS ENUM ('draft', 'in_progress', 'completed', 'approved');
```

#### `inventory_items` - Позиции инвентаризации
```sql
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventories(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    expected_quantity DECIMAL(10,4) NOT NULL DEFAULT 0, -- учетное количество
    actual_quantity DECIMAL(10,4), -- фактическое количество
    difference DECIMAL(10,4) GENERATED ALWAYS AS (actual_quantity - expected_quantity) STORED,
    price DECIMAL(10,4) NOT NULL,
    difference_amount DECIMAL(12,2) GENERATED ALWAYS AS (difference * price) STORED,
    notes TEXT,
    counted_by INTEGER REFERENCES users(id),
    counted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 💰 Продажи

#### `sales` - Продажи
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    number VARCHAR(50) UNIQUE NOT NULL,
    date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    payment_method payment_method DEFAULT 'cash',
    cashier_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'mixed');
```

#### `sale_items` - Позиции продаж
```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) NOT NULL,
    quantity DECIMAL(8,3) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `production_logs` - Логи производства (списание по рецептурам)
```sql
CREATE TABLE production_logs (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    recipe_id INTEGER REFERENCES recipes(id) NOT NULL,
    quantity DECIMAL(8,3) NOT NULL, -- количество порций
    total_cost DECIMAL(12,2) NOT NULL,
    produced_at TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `production_log_items` - Детали списания по производству
```sql
CREATE TABLE production_log_items (
    id SERIAL PRIMARY KEY,
    production_log_id INTEGER REFERENCES production_logs(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    quantity_used DECIMAL(10,4) NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📈 Отчеты и аналитика

#### `reports` - Сохраненные отчеты
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type report_type NOT NULL,
    parameters JSONB,
    data JSONB,
    period_start DATE,
    period_end DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE report_type AS ENUM ('stock', 'sales', 'profitability', 'abc_analysis', 'inventory_variance', 'cost_analysis');
```

## 🔍 Индексы для производительности

```sql
-- Пользователи
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Товары
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_barcode ON products(barcode);

-- Движения товаров
CREATE INDEX idx_stock_movements_warehouse_product ON stock_movements(warehouse_id, product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);

-- Остатки
CREATE INDEX idx_stock_balances_warehouse ON stock_balances(warehouse_id);
CREATE INDEX idx_stock_balances_product ON stock_balances(product_id);

-- Продажи
CREATE INDEX idx_sales_warehouse_date ON sales(warehouse_id, date);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sale_items_menu_item ON sale_items(menu_item_id);

-- Документы
CREATE INDEX idx_documents_type_status ON documents(type, status);
CREATE INDEX idx_documents_date ON documents(date);
CREATE INDEX idx_documents_warehouse_from ON documents(warehouse_from_id);
CREATE INDEX idx_documents_warehouse_to ON documents(warehouse_to_id);

-- Рецепты
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_product ON recipe_ingredients(product_id);
```

## 🔒 Ограничения и триггеры

### Проверочные ограничения
```sql
-- Проверка положительных значений
ALTER TABLE products ADD CONSTRAINT chk_products_shelf_life 
    CHECK (shelf_life_days IS NULL OR shelf_life_days > 0);

ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_quantity 
    CHECK (quantity != 0);

ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_positive 
    CHECK (quantity > 0 AND price >= 0);

-- Проверка температурных условий
ALTER TABLE products ADD CONSTRAINT chk_products_temperature 
    CHECK (storage_temperature_min IS NULL OR storage_temperature_max IS NULL 
           OR storage_temperature_min <= storage_temperature_max);
```

### Триггеры для автоматических вычислений
```sql
-- Обновление остатков при движении товаров
CREATE OR REPLACE FUNCTION update_stock_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stock_balances (warehouse_id, product_id, quantity, avg_price, total_value, last_movement_date)
    VALUES (NEW.warehouse_id, NEW.product_id, NEW.quantity, NEW.price, NEW.quantity * NEW.price, NEW.created_at)
    ON CONFLICT (warehouse_id, product_id)
    DO UPDATE SET
        quantity = stock_balances.quantity + NEW.quantity,
        avg_price = CASE 
            WHEN stock_balances.quantity + NEW.quantity = 0 THEN 0
            ELSE (stock_balances.total_value + NEW.quantity * NEW.price) / (stock_balances.quantity + NEW.quantity)
        END,
        total_value = stock_balances.total_value + NEW.quantity * NEW.price,
        last_movement_date = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock_balance
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_balance();

-- Обновление общей суммы документа
CREATE OR REPLACE FUNCTION update_document_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE documents 
    SET total_amount = (
        SELECT COALESCE(SUM(total), 0) 
        FROM document_items 
        WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)
    )
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_document_total
    AFTER INSERT OR UPDATE OR DELETE ON document_items
    FOR EACH ROW
    EXECUTE FUNCTION update_document_total();
```

## 📊 Представления для отчетности

### Текущие остатки с дополнительной информацией
```sql
CREATE VIEW v_current_stock AS
SELECT 
    sb.warehouse_id,
    w.name as warehouse_name,
    sb.product_id,
    p.name as product_name,
    p.article,
    c.name as category_name,
    u.short_name as unit_name,
    sb.quantity,
    sb.avg_price,
    sb.total_value,
    sb.last_movement_date
FROM stock_balances sb
JOIN warehouses w ON sb.warehouse_id = w.id
JOIN products p ON sb.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
JOIN units u ON p.unit_id = u.id
WHERE sb.quantity > 0;
```

### ABC анализ товаров
```sql
CREATE VIEW v_abc_analysis AS
WITH sales_stats AS (
    SELECT 
        si.menu_item_id,
        mi.name,
        SUM(si.total) as total_revenue,
        SUM(si.quantity) as total_quantity
    FROM sale_items si
    JOIN menu_items mi ON si.menu_item_id = mi.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY si.menu_item_id, mi.name
),
ranked_items AS (
    SELECT *,
        PERCENT_RANK() OVER (ORDER BY total_revenue DESC) as revenue_rank
    FROM sales_stats
)
SELECT *,
    CASE 
        WHEN revenue_rank <= 0.8 THEN 'A'
        WHEN revenue_rank <= 0.95 THEN 'B'
        ELSE 'C'
    END as abc_category
FROM ranked_items;
```

## 🔄 Миграции и версионирование

### Стратегия миграций
1. Все изменения схемы через миграции Prisma
2. Обратная совместимость при возможности
3. Резервное копирование перед критическими изменениями
4. Тестирование миграций на копии продакшн данных

### Версионирование схемы
```sql
CREATE TABLE schema_versions (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Initial schema');
```

## 🛡 Безопасность данных

### Права доступа
- Отдельные роли для разных типов пользователей
- Row Level Security (RLS) для мультитенантности
- Аудит критических операций

### Резервное копирование
- Ежедневные автоматические бэкапы
- Хранение бэкапов в течение 30 дней
- Тестирование восстановления раз в месяц

Эта схема обеспечивает полный учет всех операций в системе управления столовыми с возможностью детальной аналитики и контроля.
