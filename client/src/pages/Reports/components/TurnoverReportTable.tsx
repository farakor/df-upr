import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Loader2 } from 'lucide-react';
import { TurnoverReportItem } from '../../../services/api/reports';

interface TurnoverReportTableProps {
  data: TurnoverReportItem[];
  loading: boolean;
}

export const TurnoverReportTable: React.FC<TurnoverReportTableProps> = ({ data, loading }) => {
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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Товар</TableHead>
              <TableHead className="font-semibold text-gray-900">Склад</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Нач. остаток</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Нач. стоимость</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Приход</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Стоимость прихода</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Расход</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Стоимость расхода</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Кон. остаток</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Кон. стоимость</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`${item.product.id}-${item.warehouse.id}`} className="hover:bg-gray-50">
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
                  {formatNumber(item.initialQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(item.initialValue)}
                </TableCell>
                <TableCell className="text-right font-mono text-green-600">
                  +{formatNumber(item.incomingQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono text-green-600">
                  {formatCurrency(item.incomingValue)}
                </TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  -{formatNumber(item.outgoingQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  {formatCurrency(item.outgoingValue)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatNumber(item.finalQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(item.finalValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">Всего позиций</div>
            <div className="text-lg font-bold text-blue-600">{data.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Общий приход</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.incomingValue, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Общий расход</div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.outgoingValue, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">Итоговая стоимость</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.finalValue, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
