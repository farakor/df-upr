import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { XyzAnalysisItem } from '../../../services/api/reports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface XyzAnalysisChartProps {
  data: XyzAnalysisItem[];
  loading: boolean;
}

export const XyzAnalysisChart: React.FC<XyzAnalysisChartProps> = ({ data, loading }) => {
  const chartRef = useRef<ChartJS>(null);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'X':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Y':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Z':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'X':
        return 'Стабильный спрос (≤10%)';
      case 'Y':
        return 'Переменный спрос (10-25%)';
      case 'Z':
        return 'Нерегулярный спрос (>25%)';
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

  // Подготавливаем данные для графика
  const chartData = {
    labels: data.slice(0, 20).map(item => item.product.name.length > 15 ? 
      item.product.name.substring(0, 15) + '...' : item.product.name),
    datasets: [
      {
        label: 'Коэффициент вариации (%)',
        data: data.slice(0, 20).map(item => item.variationCoefficient),
        backgroundColor: data.slice(0, 20).map(item => {
          switch (item.category) {
            case 'X': return 'rgba(34, 197, 94, 0.8)';
            case 'Y': return 'rgba(234, 179, 8, 0.8)';
            case 'Z': return 'rgba(239, 68, 68, 0.8)';
            default: return 'rgba(156, 163, 175, 0.8)';
          }
        }),
        borderColor: data.slice(0, 20).map(item => {
          switch (item.category) {
            case 'X': return 'rgb(34, 197, 94)';
            case 'Y': return 'rgb(234, 179, 8)';
            case 'Z': return 'rgb(239, 68, 68)';
            default: return 'rgb(156, 163, 175)';
          }
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'XYZ анализ товаров по стабильности спроса (топ-20)',
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
            return [
              `Среднее количество: ${formatNumber(item.averageQuantity)}`,
              `Всего периодов: ${item.periodsCount}`,
              `Общее количество: ${formatNumber(item.totalQuantity)}`,
              `Категория: ${item.category}`,
            ];
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
        display: true,
        title: {
          display: true,
          text: 'Коэффициент вариации (%)',
        },
        min: 0,
      },
    },
  };

  // Статистика по категориям
  const categoryStats = {
    X: data.filter(item => item.category === 'X').length,
    Y: data.filter(item => item.category === 'Y').length,
    Z: data.filter(item => item.category === 'Z').length,
  };

  return (
    <div className="space-y-6">
      {/* График */}
      <div className="bg-white p-4 rounded-lg border">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Статистика по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Категория X</h3>
              <p className="text-sm text-green-600">Стабильный спрос (&le;10%)</p>
              <p className="text-xs text-green-500 mt-1">Легко прогнозируемый</p>
            </div>
            <div className="text-2xl font-bold text-green-700">{categoryStats.X}</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Категория Y</h3>
              <p className="text-sm text-yellow-600">Переменный спрос (10-25%)</p>
              <p className="text-xs text-yellow-500 mt-1">Средняя предсказуемость</p>
            </div>
            <div className="text-2xl font-bold text-yellow-700">{categoryStats.Y}</div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800">Категория Z</h3>
                <p className="text-sm text-red-600">Нерегулярный спрос (&gt;25%)</p>
              <p className="text-xs text-red-500 mt-1">Сложно прогнозируемый</p>
            </div>
            <div className="text-2xl font-bold text-red-700">{categoryStats.Z}</div>
          </div>
        </div>
      </div>

      {/* Информационная панель */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Интерпретация результатов</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-700 mb-1">Категория X (Стабильные)</h4>
            <p className="text-green-600">
              Товары с постоянным спросом. Рекомендуется поддерживать оптимальный запас 
              и использовать автоматическое пополнение.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-yellow-700 mb-1">Категория Y (Переменные)</h4>
            <p className="text-yellow-600">
              Товары с сезонными колебаниями. Требуют более внимательного планирования 
              и анализа трендов.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-1">Категория Z (Нерегулярные)</h4>
            <p className="text-red-600">
              Товары со случайным спросом. Рекомендуется минимальный запас 
              и закупка под заказ.
            </p>
          </div>
        </div>
      </div>

      {/* Таблица с детальными данными */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Детальная таблица XYZ анализа</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Товар</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Среднее кол-во</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Коэф. вариации</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Периодов</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Общее кол-во</TableHead>
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
                    {formatNumber(item.averageQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.variationCoefficient)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.periodsCount}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.totalQuantity)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}
                      title={getCategoryDescription(item.category)}
                    >
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
