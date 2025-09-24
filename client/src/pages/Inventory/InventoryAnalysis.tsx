import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Check,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { 
  useInventory, 
  useAnalyzeVariances, 
  useCreateAdjustmentDocuments,
  useApproveInventory 
} from '../../hooks/useInventory';

const InventoryAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [varianceThreshold, setVarianceThreshold] = useState(0);
  const [createDocsDialog, setCreateDocsDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);

  const { data: inventory, isLoading: inventoryLoading } = useInventory(Number(id));
  const { data: analysis, isLoading: analysisLoading } = useAnalyzeVariances(Number(id), varianceThreshold);
  const createDocumentsMutation = useCreateAdjustmentDocuments();
  const approveInventoryMutation = useApproveInventory();

  if (inventoryLoading || analysisLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!inventory || !analysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Данные не найдены</span>
        </div>
      </div>
    );
  }

  const handleCreateDocuments = () => {
    createDocumentsMutation.mutate(inventory.id, {
      onSuccess: () => {
        setCreateDocsDialog(false);
      }
    });
  };

  const handleApproveInventory = () => {
    approveInventoryMutation.mutate(inventory.id, {
      onSuccess: () => {
        setApproveDialog(false);
        navigate('/inventory');
      }
    });
  };

  const surplusItems = analysis.items.filter(item => item.quantityVariance > 0);
  const shortageItems = analysis.items.filter(item => item.quantityVariance < 0);
  const exactItems = analysis.items.filter(item => item.quantityVariance === 0);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/inventory/${inventory.id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к инвентаризации
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Анализ расхождений - {inventory.number}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCreateDocsDialog(true)}
            disabled={analysis.itemsWithVariance === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Создать корректировки
          </Button>
          
          {inventory.status === 'COMPLETED' && (
            <Button
              onClick={() => setApproveDialog(true)}
            >
              <Check className="w-4 h-4 mr-2" />
              Утвердить инвентаризацию
            </Button>
          )}
        </div>
      </div>

      {/* Сводная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Всего позиций</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analysis.totalItems}</div>
            <p className="text-sm text-gray-500 mt-1">Проверено позиций</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Излишки</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {analysis.surplusValue.toFixed(2)} ₽
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {surplusItems.length} позиций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Недостачи</h3>
            </div>
            <div className="text-3xl font-bold text-red-600">
              {analysis.shortageValue.toFixed(2)} ₽
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {shortageItems.length} позиций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Итого расхождений</h3>
            </div>
            <div className={`text-3xl font-bold ${
              analysis.totalVarianceValue >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analysis.totalVarianceValue >= 0 ? '+' : ''}{analysis.totalVarianceValue.toFixed(2)} ₽
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {analysis.itemsWithVariance} из {analysis.totalItems} позиций
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порог расхождения (%)
              </label>
              <Input
                type="number"
                value={varianceThreshold}
                onChange={(e) => setVarianceThreshold(Number(e.target.value))}
                min="0"
                step="0.1"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Показать только позиции с расхождением больше указанного процента
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Отображается {analysis.items.length} из {analysis.totalItems} позиций
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица расхождений */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Учетное кол-во</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Фактическое кол-во</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Расхождение</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Расхождение (%)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма расхождения</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysis.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {varianceThreshold > 0 
                      ? `Нет расхождений больше ${varianceThreshold}%`
                      : 'Расхождения не найдены'
                    }
                  </td>
                </tr>
              ) : (
                analysis.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {item.expectedQuantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {item.actualQuantity}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-sm font-medium ${
                        item.quantityVariance > 0 ? 'text-green-600' : 
                        item.quantityVariance < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.quantityVariance > 0 ? '+' : ''}{item.quantityVariance}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-sm font-medium ${
                        item.variancePercent > 0 ? 'text-green-600' : 
                        item.variancePercent < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {item.price.toFixed(2)} ₽
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-sm font-medium ${
                        item.valueVariance > 0 ? 'text-green-600' : 
                        item.valueVariance < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.valueVariance > 0 ? '+' : ''}{item.valueVariance.toFixed(2)} ₽
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.quantityVariance > 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Излишек
                        </Badge>
                      ) : item.quantityVariance < 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Недостача
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          Точно
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Диалог создания корректировочных документов */}
      <Dialog
        open={createDocsDialog}
        onClose={() => setCreateDocsDialog(false)}
        title="Создание корректировочных документов"
        description={
          <div className="space-y-4">
            <p>Будут созданы корректировочные документы на основе выявленных расхождений:</p>
            
            {surplusItems.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Документ оприходования излишков: {surplusItems.length} позиций на сумму {analysis.surplusValue.toFixed(2)} ₽
                  </p>
                </div>
              </div>
            )}
            
            {shortageItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Документ списания недостач: {shortageItems.length} позиций на сумму {Math.abs(analysis.shortageValue).toFixed(2)} ₽
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Документы будут созданы в статусе "Черновик" и потребуют утверждения.
            </p>
          </div>
        }
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setCreateDocsDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreateDocuments}
              disabled={createDocumentsMutation.isPending}
            >
              {createDocumentsMutation.isPending ? 'Создание...' : 'Создать документы'}
            </Button>
          </div>
        }
      />

      {/* Диалог утверждения инвентаризации */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        title="Утверждение инвентаризации"
        description={
          <div className="space-y-4">
            <p>Вы уверены, что хотите утвердить инвентаризацию {inventory.number}?</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  После утверждения инвентаризацию нельзя будет изменить.
                </p>
              </div>
            </div>

            {analysis.itemsWithVariance > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Обнаружены расхождения в {analysis.itemsWithVariance} позициях. 
                    Рекомендуется создать корректировочные документы перед утверждением.
                  </p>
                </div>
              </div>
            )}
          </div>
        }
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleApproveInventory}
              disabled={approveInventoryMutation.isPending}
            >
              {approveInventoryMutation.isPending ? 'Утверждение...' : 'Утвердить'}
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default InventoryAnalysis;
