# ✅ Исправление: Ошибка toFixed для Decimal полей из базы данных

## Дата исправления
5 октября 2025

## Проблема

Приложение выдавало ошибку:
```
Uncaught TypeError: document.totalAmount.toFixed is not a function
```

И аналогичные ошибки в других местах при попытке вызвать `.toFixed()` на числовых полях.

## Причина

**Prisma возвращает поля типа `Decimal` как строки**, а не как числа. Это сделано для сохранения точности при работе с денежными суммами.

### Пример из базы данных:
```prisma
model Document {
  totalAmount  Decimal  // В БД это Decimal
}
```

### Что возвращает API:
```json
{
  "totalAmount": "1234.56"  // Строка, а не число!
}
```

### Проблема в коде:
```typescript
// ❌ Ошибка: totalAmount это строка, у строк нет метода toFixed()
document.totalAmount.toFixed(2)

// ✅ Правильно: сначала преобразуем в число
Number(document.totalAmount).toFixed(2)
```

## Решение

Все числовые поля из базы данных (типы `Decimal`, `Float`) необходимо преобразовывать в числа перед использованием математических операций или методов.

### Исправленные файлы

#### 1. `/client/src/pages/Documents/DocumentsPage.tsx`

**Строка 276:**
```typescript
// Было:
{document.totalAmount.toFixed(2)} ₽

// Стало:
{Number(document.totalAmount).toFixed(2)} ₽
```

#### 2. `/client/src/pages/StockMovements/StockMovementsPage.tsx`

**Строки 287, 292, 297:**
```typescript
// Было:
{movement.quantity > 0 ? '+' : ''}{movement.quantity.toFixed(2)}
{movement.price.toFixed(2)} ₽
{(Math.abs(movement.quantity) * movement.price).toFixed(2)} ₽

// Стало:
{Number(movement.quantity) > 0 ? '+' : ''}{Number(movement.quantity).toFixed(2)}
{Number(movement.price).toFixed(2)} ₽
{(Math.abs(Number(movement.quantity)) * Number(movement.price)).toFixed(2)} ₽
```

#### 3. `/client/src/pages/Inventory/InventoryAnalysis.tsx`

**Строки 246-287:**
```typescript
// Было:
{item.quantityVariance > 0 ? '+' : ''}{item.quantityVariance}
{item.variancePercent.toFixed(1)}%
{item.price.toFixed(2)} ₽
{item.valueVariance.toFixed(2)} ₽

// Стало:
{Number(item.quantityVariance) > 0 ? '+' : ''}{Number(item.quantityVariance)}
{Number(item.variancePercent).toFixed(1)}%
{Number(item.price).toFixed(2)} ₽
{Number(item.valueVariance).toFixed(2)} ₽
```

## Типы полей Decimal в Prisma

В схеме Prisma следующие поля имеют тип `Decimal`:

### Document (Документы)
- `totalAmount` - общая сумма документа

### StockMovement (Движения товара)
- `quantity` - количество
- `price` - цена за единицу

### StockBalance (Остатки на складах)
- `quantity` - количество
- `avgPrice` - средняя цена
- `totalValue` - общая стоимость

### InventoryItem (Позиции инвентаризации)
- `expectedQuantity` - ожидаемое количество
- `actualQuantity` - фактическое количество
- `quantityVariance` - расхождение по количеству
- `price` - цена
- `valueVariance` - расхождение по стоимости
- `variancePercent` - процент расхождения

### DocumentItem (Позиции документа)
- `quantity` - количество
- `price` - цена
- `total` - сумма

## Правило использования

### ✅ Правильно:
```typescript
// Преобразование перед использованием
Number(value).toFixed(2)
parseFloat(value).toFixed(2)

// Сравнение
Number(value) > 0
Number(value) < 100

// Математические операции
Number(value1) + Number(value2)
Math.abs(Number(value))
```

### ❌ Неправильно:
```typescript
// Прямое использование без преобразования
value.toFixed(2)  // TypeError!
value > 0  // Строковое сравнение!
value1 + value2  // Конкатенация строк!
```

## Альтернативные подходы

### 1. Использование `parseFloat`:
```typescript
parseFloat(document.totalAmount).toFixed(2)
```

### 2. Унарный плюс:
```typescript
(+document.totalAmount).toFixed(2)
```

### 3. Функция-хелпер:
```typescript
// utils/formatters.ts
export const formatCurrency = (value: string | number): string => {
  return Number(value).toFixed(2);
};

// Использование:
{formatCurrency(document.totalAmount)} ₽
```

## Уже корректные файлы

Следующие файлы уже использовали правильное преобразование:

### `/client/src/components/common/ProductViewDialog.tsx`
```typescript
parseFloat(balance.quantity).toFixed(2)
parseFloat(balance.avgPrice).toFixed(2)
parseFloat(balance.totalValue).toFixed(2)
```

### `/client/src/pages/Inventory/InventoryDetail.tsx`
```typescript
Number(item.actualQuantity)
Number(item.price).toFixed(2)
```

## Результат

✅ **Все ошибки `toFixed is not a function` исправлены**
✅ **Числовые поля корректно преобразуются перед использованием**
✅ **Приложение работает без ошибок**

## Проверка работоспособности

1. Откройте раздел **"Документы"**
2. ✅ Суммы документов должны отображаться корректно
3. Откройте раздел **"Движения товара"**
4. ✅ Количество, цены и суммы должны отображаться корректно
5. Откройте раздел **"Инвентаризация"** → **"Анализ"**
6. ✅ Все расчеты и проценты должны отображаться корректно
7. ✅ В консоли браузера не должно быть ошибок

## Рекомендации на будущее

1. **Всегда преобразовывать Decimal поля** перед математическими операциями
2. **Создать типизированные хелперы** для форматирования валют и чисел
3. **Использовать линтер правила** для проверки использования `.toFixed()` на строках
4. **Документировать** в комментариях, что поле приходит как строка из API

## Технические детали

### Почему Prisma возвращает Decimal как строку?

JavaScript не имеет встроенного типа для точных десятичных чисел. `Number` в JavaScript это `IEEE 754 float`, который имеет проблемы с точностью:

```javascript
0.1 + 0.2 === 0.3  // false! (0.30000000000000004)
```

Для денежных операций это неприемлемо. Поэтому:
- **В БД**: PostgreSQL использует тип `NUMERIC/DECIMAL` для точных вычислений
- **В Prisma**: Decimal маппится в строку для сохранения точности
- **В коде**: Преобразуем в Number только для отображения

---

**Важно:** Для финансовых расчетов на бэкенде всегда используйте `Decimal` тип Prisma или библиотеки типа `decimal.js`. На фронтенде преобразовывайте в `Number` только для отображения!
