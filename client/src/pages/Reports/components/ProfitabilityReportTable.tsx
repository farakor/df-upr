import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { ProfitabilityReportItem } from '../../../services/api/reports';

interface ProfitabilityReportTableProps {
  data: ProfitabilityReportItem[];
  loading: boolean;
}

export const ProfitabilityReportTable: React.FC<ProfitabilityReportTableProps> = ({ data, loading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getProfitabilityColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitabilityIcon = (margin: number) => {
    return margin >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
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

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = data.reduce((sum, item) => sum + item.costPrice, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Дата</TableHead>
              <TableHead className="font-semibold text-gray-900">Блюдо</TableHead>
              <TableHead className="font-semibold text-gray-900">Склад</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Кол-во</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Цена</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Выручка</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Себестоимость</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Прибыль</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Рентабельность</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`${item.saleId}-${index}`} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {formatDate(item.saleDate)}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate" title={item.menuItem}>
                    {item.menuItem}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.warehouse.name}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-green-600">
                  {formatCurrency(item.revenue)}
                </TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  {formatCurrency(item.costPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div className={`flex items-center justify-end gap-1 ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getProfitabilityIcon(item.profit)}
                    {formatCurrency(item.profit)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  <span className={getProfitabilityColor(item.profitMargin)}>
                    {formatPercent(item.profitMargin)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Итоговые показатели</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Общая выручка</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Общая себестоимость</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCost)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Общая прибыль</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getProfitabilityIcon(totalProfit)}
              {formatCurrency(totalProfit)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Средняя рентабельность</div>
            <div className={`text-2xl font-bold ${getProfitabilityColor(averageMargin)}`}>
              {formatPercent(averageMargin)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
