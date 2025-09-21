-- Создание функции для обновления остатков
CREATE OR REPLACE FUNCTION update_stock_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем остатки для нового движения
    IF TG_OP = 'INSERT' THEN
        INSERT INTO stock_balances (warehouse_id, product_id, quantity, avg_price, total_value, last_movement_date, updated_at)
        VALUES (NEW.warehouse_id, NEW.product_id, NEW.quantity, NEW.price, NEW.quantity * NEW.price, NEW.created_at, NOW())
        ON CONFLICT (warehouse_id, product_id)
        DO UPDATE SET
            quantity = stock_balances.quantity + NEW.quantity,
            avg_price = CASE 
                WHEN (stock_balances.quantity + NEW.quantity) = 0 THEN 0
                ELSE (stock_balances.total_value + NEW.quantity * NEW.price) / (stock_balances.quantity + NEW.quantity)
            END,
            total_value = stock_balances.total_value + NEW.quantity * NEW.price,
            last_movement_date = NEW.created_at,
            updated_at = NOW();
        
        RETURN NEW;
    END IF;
    
    -- Обновляем остатки при удалении движения
    IF TG_OP = 'DELETE' THEN
        UPDATE stock_balances 
        SET 
            quantity = quantity - OLD.quantity,
            total_value = total_value - OLD.quantity * OLD.price,
            avg_price = CASE 
                WHEN (quantity - OLD.quantity) = 0 THEN 0
                ELSE (total_value - OLD.quantity * OLD.price) / (quantity - OLD.quantity)
            END,
            updated_at = NOW()
        WHERE warehouse_id = OLD.warehouse_id AND product_id = OLD.product_id;
        
        -- Удаляем запись если остаток стал нулевым или отрицательным
        DELETE FROM stock_balances 
        WHERE warehouse_id = OLD.warehouse_id 
        AND product_id = OLD.product_id 
        AND quantity <= 0;
        
        RETURN OLD;
    END IF;
    
    -- Обновляем остатки при изменении движения
    IF TG_OP = 'UPDATE' THEN
        -- Сначала откатываем старое движение
        UPDATE stock_balances 
        SET 
            quantity = quantity - OLD.quantity,
            total_value = total_value - OLD.quantity * OLD.price,
            avg_price = CASE 
                WHEN (quantity - OLD.quantity) = 0 THEN 0
                ELSE (total_value - OLD.quantity * OLD.price) / (quantity - OLD.quantity)
            END,
            updated_at = NOW()
        WHERE warehouse_id = OLD.warehouse_id AND product_id = OLD.product_id;
        
        -- Затем применяем новое движение
        UPDATE stock_balances 
        SET 
            quantity = quantity + NEW.quantity,
            avg_price = CASE 
                WHEN (quantity + NEW.quantity) = 0 THEN 0
                ELSE (total_value + NEW.quantity * NEW.price) / (quantity + NEW.quantity)
            END,
            total_value = total_value + NEW.quantity * NEW.price,
            last_movement_date = NEW.created_at,
            updated_at = NOW()
        WHERE warehouse_id = NEW.warehouse_id AND product_id = NEW.product_id;
        
        -- Если склад или товар изменились, создаем новую запись
        IF OLD.warehouse_id != NEW.warehouse_id OR OLD.product_id != NEW.product_id THEN
            INSERT INTO stock_balances (warehouse_id, product_id, quantity, avg_price, total_value, last_movement_date, updated_at)
            VALUES (NEW.warehouse_id, NEW.product_id, NEW.quantity, NEW.price, NEW.quantity * NEW.price, NEW.created_at, NOW())
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET
                quantity = stock_balances.quantity + NEW.quantity,
                avg_price = CASE 
                    WHEN (stock_balances.quantity + NEW.quantity) = 0 THEN 0
                    ELSE (stock_balances.total_value + NEW.quantity * NEW.price) / (stock_balances.quantity + NEW.quantity)
                END,
                total_value = stock_balances.total_value + NEW.quantity * NEW.price,
                last_movement_date = NEW.created_at,
                updated_at = NOW();
        END IF;
        
        -- Удаляем записи с нулевыми остатками
        DELETE FROM stock_balances 
        WHERE (warehouse_id = OLD.warehouse_id AND product_id = OLD.product_id AND quantity <= 0)
        OR (warehouse_id = NEW.warehouse_id AND product_id = NEW.product_id AND quantity <= 0);
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для таблицы stock_movements
DROP TRIGGER IF EXISTS trigger_update_stock_balance ON stock_movements;
CREATE TRIGGER trigger_update_stock_balance
    AFTER INSERT OR UPDATE OR DELETE ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_balance();

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_stock_balances_warehouse_product ON stock_balances(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_quantity ON stock_balances(quantity);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_product ON stock_movements(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
