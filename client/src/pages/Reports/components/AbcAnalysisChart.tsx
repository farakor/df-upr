import React, { useEffect, useRef } from 'react';
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
import { Loader2 } from 'lucide-react';
import { AbcAnalysisItem } from '../../../services/api/reports';
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

interface AbcAnalysisChartProps {
  data: AbcAnalysisItem[];
  loading: boolean;
}

export const AbcAnalysisChart: React.FC<AbcAnalysisChartProps> = ({ data, loading }) => {
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
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Подготавливаем данные для графика
  const chartData = {
    labels: data.slice(0, 20).map(item => item.product.name.length > 15 ? 
      item.product.name.substring(0, 15) + '...' : item.product.name),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Доля в выручке (%)',
        data: data.slice(0, 20).map(item => item.valuePercent),
        backgroundColor: data.slice(0, 20).map(item => {
          switch (item.category) {
            case 'A': return 'rgba(34, 197, 94, 0.8)';
            case 'B': return 'rgba(234, 179, 8, 0.8)';
            case 'C': return 'rgba(239, 68, 68, 0.8)';
            default: return 'rgba(156, 163, 175, 0.8)';
          }
        }),
        borderColor: data.slice(0, 20).map(item => {
          switch (item.category) {
            case 'A': return 'rgb(34, 197, 94)';
            case 'B': return 'rgb(234, 179, 8)';
            case 'C': return 'rgb(239, 68, 68)';
            default: return 'rgb(156, 163, 175)';
          }
        }),
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Накопительный процент (%)',
        data: data.slice(0, 20).map(item => item.cumulativePercent),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
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
        text: 'ABC анализ товаров (топ-20)',
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
                `Выручка: ${formatCurrency(item.totalRevenue)}`,
                `Количество: ${formatNumber(item.totalQuantity)}`,
                `Категория: ${item.category}`,
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
          text: 'Товары',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Доля в выручке (%)',
        },
        min: 0,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Накопительный процент (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Статистика по категориям
  const categoryStats = {
    A: data.filter(item => item.category === 'A').length,
    B: data.filter(item => item.category === 'B').length,
    C: data.filter(item => item.category === 'C').length,
  };

  return (
    <div className="space-y-6">
      {/* График */}
      <div className="bg-white p-4 rounded-lg border">
        <Chart ref={chartRef} type="bar" data={chartData} options={options} />
      </div>

      {/* Статистика по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Категория A</h3>
              <p className="text-sm text-green-600">Высокая важность (0-80%)</p>
            </div>
            <div className="text-2xl font-bold text-green-700">{categoryStats.A}</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Категория B</h3>
              <p className="text-sm text-yellow-600">Средняя важность (80-95%)</p>
            </div>
            <div className="text-2xl font-bold text-yellow-700">{categoryStats.B}</div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800">Категория C</h3>
              <p className="text-sm text-red-600">Низкая важность (95-100%)</p>
            </div>
            <div className="text-2xl font-bold text-red-700">{categoryStats.C}</div>
          </div>
        </div>
      </div>

      {/* Таблица с детальными данными */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Детальная таблица ABC анализа</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Товар</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Выручка</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Количество</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Доля %</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Накопительно %</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Категория</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((item, index) => (
                <TableRow key={item.product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={item.product.name}>
                      {item.product.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.totalQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.valuePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.cumulativePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 50 && (
          <div className="p-4 text-center text-gray-500 border-t">
            Показано первые 50 из {data.length} записей
          </div>
        )}
      </div>
    </div>
  );
};
