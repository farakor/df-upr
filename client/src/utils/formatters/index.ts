// Форматирование валюты
export const formatCurrency = (amount: number, currency = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Форматирование числа
export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Форматирование времени в минутах
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }
  
  return `${hours} ч ${remainingMinutes} мин`;
};

// Форматирование даты
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

// Форматирование даты и времени
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Форматирование процентов
export const formatPercent = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Форматирование веса
export const formatWeight = (grams: number): string => {
  if (grams < 1000) {
    return `${grams} г`;
  }
  
  const kg = grams / 1000;
  return `${formatNumber(kg, kg % 1 === 0 ? 0 : 2)} кг`;
};

// Форматирование объема
export const formatVolume = (ml: number): string => {
  if (ml < 1000) {
    return `${ml} мл`;
  }
  
  const liters = ml / 1000;
  return `${formatNumber(liters, liters % 1 === 0 ? 0 : 2)} л`;
};

// Сокращение длинного текста
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

// Форматирование размера файла
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  
  if (bytes === 0) return '0 Б';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${formatNumber(size, 1)} ${sizes[i]}`;
};
