-- CreateEnum
CREATE TYPE "backup_status" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "backup_type" AS ENUM ('MANUAL', 'AUTOMATIC', 'SCHEDULED');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role" "user_role" NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "status" "backup_status" NOT NULL DEFAULT 'IN_PROGRESS',
    "type" "backup_type" NOT NULL DEFAULT 'MANUAL',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permission_id_key" ON "role_permissions"("role", "permission_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_logs" ADD CONSTRAINT "backup_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default permissions
INSERT INTO "permissions" ("name", "description", "resource", "action") VALUES
  ('users.view', 'Просмотр пользователей', 'users', 'read'),
  ('users.create', 'Создание пользователей', 'users', 'create'),
  ('users.edit', 'Редактирование пользователей', 'users', 'update'),
  ('users.delete', 'Удаление пользователей', 'users', 'delete'),
  ('settings.view', 'Просмотр настроек', 'settings', 'read'),
  ('settings.edit', 'Изменение настроек', 'settings', 'update'),
  ('audit.view', 'Просмотр логов аудита', 'audit', 'read'),
  ('backup.create', 'Создание резервных копий', 'backup', 'create'),
  ('backup.restore', 'Восстановление из резервных копий', 'backup', 'restore');

-- Insert default system settings
INSERT INTO "system_settings" ("key", "value", "category", "description", "is_public", "updated_at") VALUES
  ('app.name', '"DF-UPR"', 'general', 'Название приложения', true, CURRENT_TIMESTAMP),
  ('app.version', '"1.0.0"', 'general', 'Версия приложения', true, CURRENT_TIMESTAMP),
  ('app.timezone', '"UTC"', 'general', 'Часовой пояс', false, CURRENT_TIMESTAMP),
  ('app.language', '"ru"', 'general', 'Язык по умолчанию', true, CURRENT_TIMESTAMP),
  ('backup.auto_enabled', 'false', 'backup', 'Автоматическое резервное копирование', false, CURRENT_TIMESTAMP),
  ('backup.schedule', '"0 2 * * *"', 'backup', 'Расписание резервного копирования (cron)', false, CURRENT_TIMESTAMP),
  ('backup.retention_days', '30', 'backup', 'Срок хранения резервных копий (дни)', false, CURRENT_TIMESTAMP),
  ('notifications.low_stock_enabled', 'true', 'notifications', 'Уведомления о низких остатках', false, CURRENT_TIMESTAMP),
  ('notifications.low_stock_threshold', '10', 'notifications', 'Порог низких остатков', false, CURRENT_TIMESTAMP),
  ('security.session_timeout', '3600', 'security', 'Таймаут сессии (секунды)', false, CURRENT_TIMESTAMP),
  ('security.password_min_length', '8', 'security', 'Минимальная длина пароля', false, CURRENT_TIMESTAMP),
  ('security.max_login_attempts', '5', 'security', 'Максимальное количество попыток входа', false, CURRENT_TIMESTAMP);

