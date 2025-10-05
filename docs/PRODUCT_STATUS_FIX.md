# ✅ Исправление: Деактивированные товары остаются в списке

## Проблема
При деактивации товара он исчезал из списка номенклатуры.

## Причина
- Frontend: Фильтр по умолчанию был установлен на `isActive: true`
- Backend: В сервисе значение по умолчанию тоже было `isActive = true`

## Исправления

### Frontend
**Файл:** `client/src/pages/Products/ProductsListPage.tsx`

**Что изменено:**
```typescript
// Было:
const [filters, setFilters] = useState<ProductFilters>({
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'asc',
  isActive: true, // ❌ Показывались только активные
});

// Стало:
const [filters, setFilters] = useState<ProductFilters>({
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'asc',
  // ✅ isActive не установлен - показываем все товары
});
```

**Фильтр статусов:**
```typescript
// Было:
<select>
  <option value="active">Активные</option>
  <option value="inactive">Неактивные</option>
</select>

// Стало:
<select>
  <option value="all">Все товары</option>
  <option value="active">Только активные</option>
  <option value="inactive">Только неактивные</option>
</select>
```

### Backend
**Файл:** `server/src/services/product.service.ts`

**Что изменено:**
```typescript
// Было:
const { search, categoryId, isActive = true, unitId } = filters;
const where: Prisma.ProductWhereInput = {
  isActive, // ❌ Всегда применялся фильтр
  // ...
};

// Стало:
const { search, categoryId, isActive, unitId } = filters;
const where: Prisma.ProductWhereInput = {
  ...(isActive !== undefined && { isActive }), // ✅ Фильтр применяется только если передан
  // ...
};
```

## Результат

### Поведение системы

1. **По умолчанию** - показываются **все товары** (активные и неактивные)

2. **Визуальная индикация** - у каждого товара есть бейдж статуса:
   - 🟢 Зеленый "Активен" - для активных товаров
   - 🔴 Красный "Неактивен" - для неактивных товаров

3. **Фильтрация** - пользователь может выбрать в фильтрах:
   - **Все товары** - показывать и активные, и неактивные
   - **Только активные** - показывать только активные
   - **Только неактивные** - показывать только неактивные

4. **При деактивации** - товар остается в списке, меняется только бейдж статуса

## Как использовать

### Изменение статуса товара
1. Откройте карточку товара (кнопка редактирования)
2. Переключите статус в форме редактирования
3. Сохраните изменения
4. Товар останется в списке с новым статусом

### Фильтрация по статусу
1. Нажмите кнопку "Фильтры"
2. В выпадающем списке "Статус" выберите нужную опцию:
   - "Все товары" - показать все
   - "Только активные" - показать только активные
   - "Только неактивные" - показать только неактивные

## Затронутые файлы

### Основные исправления (Товары)
✅ `client/src/pages/Products/ProductsListPage.tsx` - обновлен  
✅ `server/src/services/product.service.ts` - обновлен  

### Аналогичные исправления (Рецепты и Меню)
✅ `server/src/services/recipe.service.ts` - обновлен (та же проблема)  
✅ `server/src/services/menu.service.ts` - обновлен (та же проблема в двух методах)  

### Документация
✅ `docs/PRODUCT_STATUS_FEATURE.md` - дополнен  
✅ `docs/PRODUCT_STATUS_FIX.md` - создан

## Проверка

- ✅ Компиляция TypeScript успешна
- ✅ Линтинг без ошибок
- ✅ Сборка сервера прошла успешно

## Дата исправления
4 октября 2025

