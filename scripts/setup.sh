#!/bin/bash

# Скрипт первоначальной настройки проекта DF-UPR

set -e

echo "🚀 Настройка проекта DF-UPR..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Пожалуйста, установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js версии 18 или выше. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"

# Проверка наличия PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL не найден. Убедитесь, что PostgreSQL установлен и запущен."
    echo "   Для macOS: brew install postgresql"
    echo "   Для Ubuntu: sudo apt install postgresql postgresql-contrib"
fi

# Установка зависимостей корневого проекта
echo "📦 Установка зависимостей корневого проекта..."
npm install

# Установка зависимостей backend
echo "📦 Установка зависимостей backend..."
cd server
npm install
cd ..

# Установка зависимостей frontend
echo "📦 Установка зависимостей frontend..."
cd client
npm install
cd ..

# Создание файлов окружения из примеров
echo "⚙️  Создание файлов окружения..."

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Создан server/.env из примера"
    echo "⚠️  Не забудьте настроить переменные в server/.env"
fi

if [ ! -f "client/.env" ]; then
    cp client/.env.example client/.env
    echo "✅ Создан client/.env из примера"
fi

# Создание папок для логов и загрузок
echo "📁 Создание необходимых папок..."
mkdir -p server/logs
mkdir -p server/uploads
echo "✅ Папки созданы"

# Инициализация Git (если еще не инициализирован)
if [ ! -d ".git" ]; then
    echo "🔧 Инициализация Git репозитория..."
    git init
    git add .
    git commit -m "Initial commit: DF-UPR project setup"
    echo "✅ Git репозиторий инициализирован"
fi

echo ""
echo "🎉 Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Настройте PostgreSQL базу данных"
echo "2. Обновите переменные окружения в server/.env"
echo "3. Запустите миграции: cd server && npm run db:migrate"
echo "4. Заполните базу тестовыми данными: cd server && npm run db:seed"
echo "5. Запустите проект: npm run dev"
echo ""
echo "📖 Подробная документация в docs/"
