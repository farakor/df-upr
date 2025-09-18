# 🚀 Руководство по развертыванию

## 📋 Обзор

Данное руководство описывает процесс развертывания системы DF-UPR в различных окружениях: разработка, тестирование и продакшн.

## 🛠 Системные требования

### Минимальные требования
- **CPU**: 2 ядра, 2.0 GHz
- **RAM**: 4 GB
- **Диск**: 20 GB свободного места
- **ОС**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

### Рекомендуемые требования (продакшн)
- **CPU**: 4 ядра, 3.0 GHz
- **RAM**: 8 GB
- **Диск**: 100 GB SSD
- **ОС**: Ubuntu 22.04 LTS

### Программное обеспечение
- **Node.js**: 18.x или выше
- **PostgreSQL**: 14.x или выше
- **Nginx**: 1.20+ (для продакшн)
- **PM2**: для управления процессами Node.js
- **Git**: для клонирования репозитория

---

## 🔧 Настройка окружения разработки

### 1. Установка зависимостей

#### Ubuntu/Debian
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib

# Установка дополнительных инструментов
sudo apt install git nginx certbot python3-certbot-nginx
```

#### macOS
```bash
# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка зависимостей
brew install node@18 postgresql git nginx

# Запуск PostgreSQL
brew services start postgresql
```

#### Windows
```powershell
# Установка через Chocolatey
choco install nodejs postgresql git nginx

# Или скачать установщики с официальных сайтов
```

### 2. Клонирование и настройка проекта

```bash
# Клонирование репозитория
git clone https://github.com/your-username/df-upr.git
cd df-upr

# Установка зависимостей
npm install

# Установка зависимостей для клиента и сервера
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 3. Настройка базы данных

```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание пользователя и базы данных
CREATE USER dfupr_user WITH PASSWORD 'your_password';
CREATE DATABASE dfupr_db OWNER dfupr_user;
GRANT ALL PRIVILEGES ON DATABASE dfupr_db TO dfupr_user;
\q
```

### 4. Конфигурация переменных окружения

#### Backend (.env в папке server/)
```env
# База данных
DATABASE_URL="postgresql://dfupr_user:your_password@localhost:5432/dfupr_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Сервер
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"

# Файлы
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="10485760"

# Email (опционально)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="DF-UPR System <noreply@dfupr.com>"

# Логирование
LOG_LEVEL="debug"
LOG_FILE="./logs/app.log"

# Redis (опционально, для кеширования)
REDIS_URL="redis://localhost:6379"
```

#### Frontend (.env в папке client/)
```env
# API
VITE_API_URL="http://localhost:3001/api"

# Приложение
VITE_APP_NAME="DF-UPR"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="Система управленческого учета столовых"

# Настройки
VITE_ITEMS_PER_PAGE=20
VITE_MAX_UPLOAD_SIZE="10485760"
VITE_SUPPORTED_LANGUAGES="ru,en"
VITE_DEFAULT_LANGUAGE="ru"

# Аналитика (опционально)
VITE_GOOGLE_ANALYTICS_ID=""
VITE_YANDEX_METRIKA_ID=""
```

### 5. Инициализация базы данных

```bash
cd server

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# Заполнение начальными данными
npx prisma db seed
```

### 6. Запуск в режиме разработки

```bash
# Из корневой папки проекта
npm run dev

# Или запуск отдельно
# Backend
cd server && npm run dev

# Frontend (в новом терминале)
cd client && npm run dev
```

Приложение будет доступно по адресам:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 🧪 Развертывание тестового окружения

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Создание пользователя для приложения
sudo adduser dfupr
sudo usermod -aG sudo dfupr
su - dfupr
```

### 2. Установка зависимостей

```bash
# Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# PM2 для управления процессами
sudo npm install -g pm2

# Nginx
sudo apt install nginx

# Certbot для SSL
sudo apt install certbot python3-certbot-nginx
```

### 3. Настройка PostgreSQL

```bash
sudo -u postgres psql
CREATE USER dfupr_user WITH PASSWORD 'secure_password';
CREATE DATABASE dfupr_staging OWNER dfupr_user;
GRANT ALL PRIVILEGES ON DATABASE dfupr_staging TO dfupr_user;
\q

# Настройка доступа
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Добавить: local   dfupr_staging   dfupr_user   md5

sudo systemctl restart postgresql
```

### 4. Клонирование и сборка проекта

```bash
# Клонирование
git clone https://github.com/your-username/df-upr.git
cd df-upr

# Настройка переменных окружения
cp server/.env.example server/.env
cp client/.env.example client/.env

# Редактирование конфигурации
nano server/.env  # Установить NODE_ENV=staging
nano client/.env  # Установить VITE_API_URL=https://staging.dfupr.com/api

# Установка зависимостей и сборка
npm install
cd server && npm install && npm run build && cd ..
cd client && npm install && npm run build && cd ..
```

### 5. Настройка PM2

```bash
# Создание ecosystem файла
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'dfupr-api',
    script: './server/dist/app.js',
    cwd: '/home/dfupr/df-upr',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'staging',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/dfupr-staging

# Конфигурация Nginx
server {
    listen 80;
    server_name staging.dfupr.com;

    # Frontend
    location / {
        root /home/dfupr/df-upr/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Кеширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads {
        alias /home/dfupr/df-upr/server/uploads;
        expires 1y;
    }
}

# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/dfupr-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Настройка SSL

```bash
# Получение SSL сертификата
sudo certbot --nginx -d staging.dfupr.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🏭 Продакшн развертывание

### 1. Подготовка продакшн сервера

#### Системные настройки
```bash
# Увеличение лимитов файлов
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Настройка swap (если нужно)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Настройка файрвола
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

#### Оптимизация PostgreSQL
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Рекомендуемые настройки для продакшн
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. Настройка мониторинга

#### Установка мониторинга PM2
```bash
# PM2 мониторинг
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Системный мониторинг
sudo apt install htop iotop nethogs
```

#### Логирование
```bash
# Настройка logrotate
sudo nano /etc/logrotate.d/dfupr

/home/dfupr/df-upr/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 dfupr dfupr
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Продакшн конфигурация

#### Backend переменные (.env)
```env
NODE_ENV="production"
DATABASE_URL="postgresql://dfupr_user:secure_password@localhost:5432/dfupr_prod"
JWT_SECRET="very-secure-jwt-secret-for-production-min-32-chars"
PORT=3001
CORS_ORIGIN="https://dfupr.com"
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"

# Безопасность
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email продакшн настройки
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER="noreply@dfupr.com"
SMTP_PASS="secure_email_password"
```

#### PM2 продакшн конфигурация
```javascript
module.exports = {
  apps: [{
    name: 'dfupr-api',
    script: './server/dist/app.js',
    cwd: '/home/dfupr/df-upr',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 4. Продакшн Nginx конфигурация

```nginx
# Основная конфигурация
server {
    listen 443 ssl http2;
    server_name dfupr.com www.dfupr.com;
    
    # SSL конфигурация
    ssl_certificate /etc/letsencrypt/live/dfupr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dfupr.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend
    location / {
        root /home/dfupr/df-upr/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Кеширование
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Загруженные файлы
    location /uploads {
        alias /home/dfupr/df-upr/server/uploads;
        expires 1y;
        
        # Ограничение доступа к определенным типам файлов
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name dfupr.com www.dfupr.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔄 Автоматизация развертывания

### 1. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd server && npm install
          cd ../client && npm install
      
      - name: Run tests
        run: |
          cd server && npm test
          cd ../client && npm test
      
      - name: Build
        run: |
          cd server && npm run build
          cd ../client && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/dfupr/df-upr
            git pull origin main
            npm install
            cd server && npm install && npm run build
            cd ../client && npm install && npm run build
            pm2 restart dfupr-api
            sudo systemctl reload nginx
```

### 2. Скрипт развертывания

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Переменные
APP_DIR="/home/dfupr/df-upr"
BACKUP_DIR="/home/dfupr/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание бэкапа
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
pg_dump dfupr_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Обновление кода
echo "📥 Updating code..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main

# Установка зависимостей
echo "📦 Installing dependencies..."
npm install
cd server && npm install && npm run build
cd ../client && npm install && npm run build

# Миграции БД
echo "🗄️ Running migrations..."
cd $APP_DIR/server
npx prisma migrate deploy

# Перезапуск сервисов
echo "🔄 Restarting services..."
pm2 restart dfupr-api
sudo systemctl reload nginx

# Проверка здоровья
echo "🏥 Health check..."
sleep 10
curl -f http://localhost:3001/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

---

## 📊 Мониторинг и обслуживание

### 1. Мониторинг производительности

```bash
# Установка мониторинга
npm install -g clinic
npm install -g autocannon

# Профилирование
clinic doctor -- node server/dist/app.js
clinic bubbleprof -- node server/dist/app.js

# Нагрузочное тестирование
autocannon -c 100 -d 30 http://localhost:3001/api/health
```

### 2. Резервное копирование

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/home/dfupr/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Создание папки для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап базы данных
pg_dump dfupr_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Бэкап загруженных файлов
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/dfupr/df-upr/server uploads/

# Удаление старых бэкапов
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

### 3. Мониторинг логов

```bash
# Просмотр логов приложения
pm2 logs dfupr-api

# Мониторинг системных ресурсов
pm2 monit

# Анализ логов Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Мониторинг PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🔧 Устранение неполадок

### Частые проблемы

#### 1. Приложение не запускается
```bash
# Проверка логов
pm2 logs dfupr-api

# Проверка порта
sudo netstat -tulpn | grep :3001

# Проверка переменных окружения
pm2 env dfupr-api
```

#### 2. Проблемы с базой данных
```bash
# Проверка подключения
psql -h localhost -U dfupr_user -d dfupr_prod

# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Просмотр логов PostgreSQL
sudo journalctl -u postgresql
```

#### 3. Проблемы с Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
```

### Команды для диагностики

```bash
# Проверка использования ресурсов
htop
df -h
free -h

# Проверка сетевых соединений
ss -tulpn

# Проверка процессов Node.js
ps aux | grep node

# Проверка статуса всех сервисов
sudo systemctl status nginx postgresql
pm2 status
```

---

## 📋 Чеклист развертывания

### Перед развертыванием
- [ ] Все тесты проходят
- [ ] Код прошел code review
- [ ] Документация обновлена
- [ ] Переменные окружения настроены
- [ ] SSL сертификаты действительны
- [ ] Создан бэкап текущей версии

### После развертывания
- [ ] Приложение запускается без ошибок
- [ ] API endpoints отвечают корректно
- [ ] Frontend загружается и работает
- [ ] База данных доступна
- [ ] Логи не содержат критических ошибок
- [ ] Мониторинг настроен и работает
- [ ] Уведомления о развертывании отправлены

Это руководство обеспечивает надежное и безопасное развертывание системы DF-UPR в любом окружении.
