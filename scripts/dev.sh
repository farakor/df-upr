#!/bin/bash

# Скрипт запуска проекта в режиме разработки

set -e

echo "🚀 Запуск DF-UPR в режиме разработки..."

# Проверка наличия файлов окружения
if [ ! -f "server/.env" ]; then
    echo "❌ Файл server/.env не найден. Запустите scripts/setup.sh сначала."
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo "❌ Файл client/.env не найден. Запустите scripts/setup.sh сначала."
    exit 1
fi

# Проверка установки зависимостей
if [ ! -d "server/node_modules" ]; then
    echo "📦 Установка зависимостей backend..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Установка зависимостей frontend..."
    cd client && npm install && cd ..
fi

# Проверка состояния базы данных
echo "🔍 Проверка состояния базы данных..."
cd server

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

# Проверка подключения к БД
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ База данных доступна"
else
    echo "❌ Не удается подключиться к базе данных"
    echo "   Убедитесь, что PostgreSQL запущен и настройки в .env корректны"
    exit 1
fi

cd ..

# Запуск проекта
echo "🎬 Запуск серверов..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запуск с помощью concurrently
npm run dev
