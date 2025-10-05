import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем сидирование данных администрирования...');

  // Создаем разрешения
  const permissions = [
    { name: 'users.view', description: 'Просмотр пользователей', resource: 'users', action: 'read' },
    { name: 'users.create', description: 'Создание пользователей', resource: 'users', action: 'create' },
    { name: 'users.edit', description: 'Редактирование пользователей', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Удаление пользователей', resource: 'users', action: 'delete' },
    { name: 'settings.view', description: 'Просмотр настроек', resource: 'settings', action: 'read' },
    { name: 'settings.edit', description: 'Изменение настроек', resource: 'settings', action: 'update' },
    { name: 'audit.view', description: 'Просмотр логов аудита', resource: 'audit', action: 'read' },
    { name: 'backup.create', description: 'Создание резервных копий', resource: 'backup', action: 'create' },
    { name: 'backup.restore', description: 'Восстановление из резервных копий', resource: 'backup', action: 'restore' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log('✓ Разрешения созданы');

  // Создаем системные настройки
  const settings = [
    { key: 'app.name', value: 'DF-UPR', category: 'general', description: 'Название приложения', isPublic: true },
    { key: 'app.version', value: '1.0.0', category: 'general', description: 'Версия приложения', isPublic: true },
    { key: 'app.timezone', value: 'UTC', category: 'general', description: 'Часовой пояс', isPublic: false },
    { key: 'app.language', value: 'ru', category: 'general', description: 'Язык по умолчанию', isPublic: true },
    { key: 'backup.auto_enabled', value: false, category: 'backup', description: 'Автоматическое резервное копирование', isPublic: false },
    { key: 'backup.schedule', value: '0 2 * * *', category: 'backup', description: 'Расписание резервного копирования (cron)', isPublic: false },
    { key: 'backup.retention_days', value: 30, category: 'backup', description: 'Срок хранения резервных копий (дни)', isPublic: false },
    { key: 'notifications.low_stock_enabled', value: true, category: 'notifications', description: 'Уведомления о низких остатках', isPublic: false },
    { key: 'notifications.low_stock_threshold', value: 10, category: 'notifications', description: 'Порог низких остатков', isPublic: false },
    { key: 'security.session_timeout', value: 3600, category: 'security', description: 'Таймаут сессии (секунды)', isPublic: false },
    { key: 'security.password_min_length', value: 8, category: 'security', description: 'Минимальная длина пароля', isPublic: false },
    { key: 'security.max_login_attempts', value: 5, category: 'security', description: 'Максимальное количество попыток входа', isPublic: false },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✓ Системные настройки созданы');

  console.log('Сидирование завершено успешно!');
}

main()
  .catch((e) => {
    console.error('Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

