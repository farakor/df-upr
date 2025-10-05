# 🗑️ Мягкое удаление пользователей

## ✅ Текущая реализация: МЯГКОЕ УДАЛЕНИЕ

Система использует **мягкое удаление (soft delete)** - это стандартная практика для production-систем.

## 📋 Как это работает

### Код в `server/src/services/users.service.ts`:

```typescript
// Удалить пользователя (мягкое удаление - деактивация)
async deleteUser(id: number) {
  return await this.deactivateUser(id);
}

// Деактивировать пользователя
async deactivateUser(id: number) {
  return await prisma.user.update({
    where: { id },
    data: { isActive: false },  // ← Просто меняем флаг!
    select: { id: true, isActive: true },
  });
}
```

### Что происходит при "удалении":

1. ❌ Пользователь **НЕ удаляется** из таблицы `users`
2. ✅ Устанавливается флаг `isActive: false`
3. ✅ Все данные пользователя остаются в БД
4. ✅ Все связанные записи (продажи, документы и т.д.) остаются валидными

## 🎯 Преимущества мягкого удаления

### 1. Целостность данных
```
Пользователь создал 100 продаж → "Удалили" пользователя
✅ Продажи остаются с валидным user_id
✅ Можно посмотреть историю: кто создал продажу
```

### 2. Возможность восстановления
```sql
-- Восстановить пользователя
UPDATE users SET is_active = true WHERE id = 5;
```

### 3. Аудит и отчетность
- История сохраняется
- Можно анализировать действия "удаленных" пользователей
- Юридические требования к хранению данных

### 4. Безопасность
- Нет случайных удалений
- Foreign key constraints не нарушаются
- Нет cascade deletions

## 📊 Как проверить

### В базе данных:
```sql
-- Все пользователи
SELECT id, email, is_active FROM users;

-- Только активные (те что видны в UI)
SELECT id, email FROM users WHERE is_active = true;

-- Только "удаленные"
SELECT id, email FROM users WHERE is_active = false;
```

### Пример текущего состояния:
```
ID  Email                  is_active  Статус
1   admin@dfupr.com        true       ✅ Виден в UI
2   manager@dfupr.com      true       ✅ Виден в UI
4   it@dkdk.com            false      ❌ "Удален" (скрыт)
7   usu@dus.com            false      ❌ "Удален" (скрыт)
8   ttt@ttt.com            false      ❌ "Удален" (скрыт)
```

## 🔄 Альтернатива: Жесткое удаление

Если нужно **реально удалить** из БД:

```typescript
async hardDeleteUser(id: number) {
  return await prisma.user.delete({
    where: { id }
  });
}
```

### ⚠️ Проблемы жесткого удаления:

1. ❌ Потеря данных
2. ❌ Broken foreign keys
3. ❌ Нарушение аудита
4. ❌ Невозможно восстановить
5. ❌ Cascade delete может удалить связанные записи

## 💡 Рекомендация

**Оставить мягкое удаление!** Это:
- ✅ Best practice для production
- ✅ Безопасно
- ✅ Соответствует требованиям GDPR/аудита
- ✅ Не создает проблем с целостностью данных

## 🛠️ Если нужно физически удалить

Можно добавить функцию **очистки** старых записей (cron job):

```typescript
// Удалить неактивных пользователей старше 1 года
async cleanupInactiveUsers() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return await prisma.user.deleteMany({
    where: {
      isActive: false,
      updatedAt: { lt: oneYearAgo }
    }
  });
}
```

---

**Итог**: Сейчас используется **мягкое удаление** ✅  
**Данные остаются в БД**, но скрыты от пользователей
