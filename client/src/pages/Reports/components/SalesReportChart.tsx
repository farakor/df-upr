import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Loader2, TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { SalesReportItem } from '../../../services/api/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SalesReportChartProps {
  data: SalesReportItem[];
  loading: boolean;
}

export const SalesReportChart: React.FC<SalesReportChartProps> = ({ data, loading }) => {
  const chartRef = useRef<ChartJS>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
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

  // Подготавливаем данные для графика
  const chartData = {
    labels: data.map(item => formatDate(item.period)),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Выручка (руб)',
        data: data.map(item => item.totalRevenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Количество продаж',
        data: data.map(item => item.salesCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
        tension: 0.1,
      },
      {
        type: 'line' as const,
        label: 'Средний чек (руб)',
        data: data.map(item => item.averageCheck),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Динамика продаж',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const item = data[context.dataIndex];
            if (context.datasetIndex === 0) {
              return [
                `Товаров продано: ${formatNumber(item.itemsSold)}`,
                `Средний чек: ${formatCurrency(item.averageCheck)}`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Период',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Выручка / Средний чек (руб)',
        },
        min: 0,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Количество продаж',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Вычисляем общую статистику
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalSales = data.reduce((sum, item) => sum + item.salesCount, 0);
  const totalItems = data.reduce((sum, item) => sum + item.itemsSold, 0);
  const averageCheck = totalSales > 0 ? totalRevenue / totalSales : 0;
  const averageItemsPerSale = totalSales > 0 ? totalItems / totalSales : 0;

  // Находим лучший и худший дни
  const bestDay = data.reduce((best, current) => 
    current.totalRevenue > best.totalRevenue ? current : best, data[0]);
  const worstDay = data.reduce((worst, current) => 
    current.totalRevenue < worst.totalRevenue ? current : worst, data[0]);

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Общая выручка</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Всего продаж</p>
              <p className="text-xl font-bold text-blue-700">{formatNumber(totalSales)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-600">Средний чек</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(averageCheck)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-600">Товаров в чеке</p>
              <p className="text-xl font-bold text-orange-700">{averageItemsPerSale.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* График */}
      <div className="bg-white p-4 rounded-lg border">
        <Chart ref={chartRef} type="bar" data={chartData} options={options} />
      </div>

      {/* Лучший и худший дни */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Лучший день</h3>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              <span className="font-medium">Дата:</span> {formatDate(bestDay.period)}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Выручка:</span> {formatCurrency(bestDay.totalRevenue)}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Продаж:</span> {formatNumber(bestDay.salesCount)}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Средний чек:</span> {formatCurrency(bestDay.averageCheck)}
            </p>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Худший день</h3>
          <div className="space-y-1">
            <p className="text-sm text-red-600">
              <span className="font-medium">Дата:</span> {formatDate(worstDay.period)}
            </p>
            <p className="text-sm text-red-600">
              <span className="font-medium">Выручка:</span> {formatCurrency(worstDay.totalRevenue)}
            </p>
            <p className="text-sm text-red-600">
              <span className="font-medium">Продаж:</span> {formatNumber(worstDay.salesCount)}
            </p>
            <p className="text-sm text-red-600">
              <span className="font-medium">Средний чек:</span> {formatCurrency(worstDay.averageCheck)}
            </p>
          </div>
        </div>
      </div>

      {/* Таблица с детальными данными */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Детальная таблица продаж</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Период</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Количество продаж</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Выручка</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Средний чек</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Товаров продано</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Товаров в чеке</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.period} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {formatDate(item.period)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.salesCount)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600">
                    {formatCurrency(item.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.averageCheck)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.itemsSold)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.salesCount > 0 ? (item.itemsSold / item.salesCount).toFixed(1) : '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
