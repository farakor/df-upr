import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Loader2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { StockReportItem } from '../../../services/api/reports';

interface StockReportTableProps {
  data: StockReportItem[];
  loading: boolean;
}

export const StockReportTable: React.FC<StockReportTableProps> = ({ data, loading }) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'low':
        return 'Низкий остаток';
      case 'normal':
        return 'Нормальный';
      case 'high':
        return 'Избыток';
      default:
        return 'Неопределено';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Загрузка данных...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Нет данных для отображения</p>
        <p className="text-sm mt-1">Попробуйте изменить параметры фильтрации</p>
      </div>
    );
  }

  // Статистика по статусам
  const statusStats = {
    low: data.filter(item => item.stockStatus === 'low').length,
    normal: data.filter(item => item.stockStatus === 'normal').length,
    high: data.filter(item => item.stockStatus === 'high').length,
  };

  const totalValue = data.reduce((sum, item) => sum + item.stockValue, 0);
  const lowStockValue = data
    .filter(item => item.stockStatus === 'low')
    .reduce((sum, item) => sum + item.stockValue, 0);

  return (
    <div className="space-y-6">
      {/* Статистика по статусам */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Низкие остатки</p>
              <p className="text-xl font-bold text-red-700">{statusStats.low}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Нормальные</p>
              <p className="text-xl font-bold text-green-700">{statusStats.normal}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Избыток</p>
              <p className="text-xl font-bold text-blue-700">{statusStats.high}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Общая стоимость</p>
            <p className="text-xl font-bold text-gray-700">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Низкие остатки: {formatCurrency(lowStockValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Таблица с остатками */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Товар</TableHead>
              <TableHead className="font-semibold text-gray-900">Склад</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Текущий остаток</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Мин. остаток</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Макс. остаток</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Стоимость остатка</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">Статус</TableHead>
              <TableHead className="font-semibold text-gray-900">Обновлено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={`${item.product.id}-${item.warehouse.id}`} 
                className={`hover:bg-gray-50 ${
                  item.stockStatus === 'low' ? 'bg-red-50' : 
                  item.stockStatus === 'high' ? 'bg-blue-50' : ''
                }`}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold text-gray-900">{item.product.name}</div>
                    {item.product.unit && (
                      <div className="text-sm text-gray-500">Ед. изм: {item.product.unit.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.warehouse.name}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div className={`font-semibold ${
                    item.stockStatus === 'low' ? 'text-red-600' : 
                    item.stockStatus === 'high' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {formatNumber(item.currentQuantity)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-gray-600">
                  {item.minStock ? formatNumber(item.minStock) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-gray-600">
                  {item.maxStock ? formatNumber(item.maxStock) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(item.stockValue)}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1 ${getStatusColor(item.stockStatus)}`}>
                    {getStatusIcon(item.stockStatus)}
                    {getStatusText(item.stockStatus)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500 font-mono">
                  {formatDate(item.lastUpdated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Рекомендации */}
      {statusStats.low > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Внимание! Обнаружены товары с низкими остатками
              </h3>
              <p className="text-sm text-red-700">
                {statusStats.low} {statusStats.low === 1 ? 'товар требует' : 'товаров требуют'} пополнения. 
                Рекомендуется создать заказы поставщикам для избежания дефицита.
              </p>
              <p className="text-xs text-red-600 mt-1">
                Общая стоимость товаров с низкими остатками: {formatCurrency(lowStockValue)}
              </p>
            </div>
          </div>
        </div>
      )}

      {statusStats.high > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Обнаружены товары с избыточными остатками
              </h3>
              <p className="text-sm text-blue-700">
                {statusStats.high} {statusStats.high === 1 ? 'товар имеет' : 'товаров имеют'} остатки выше максимального уровня. 
                Рекомендуется проанализировать причины и скорректировать закупки.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
