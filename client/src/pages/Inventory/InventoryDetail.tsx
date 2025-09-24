import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Check,
  BarChart3,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock
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
  useUpdateInventoryItem, 
  useBulkUpdateInventoryItems,
  useUpdateInventory 
} from '../../hooks/useInventory';
import { InventoryItem } from '../../services/api/inventory';


const statusConfig = {
  DRAFT: { 
    label: 'Черновик', 
    className: 'bg-gray-100 text-gray-800 border-gray-200' 
  },
  IN_PROGRESS: { 
    label: 'В процессе', 
    className: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  COMPLETED: { 
    label: 'Завершена', 
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
  },
  APPROVED: { 
    label: 'Утверждена', 
    className: 'bg-green-100 text-green-800 border-green-200' 
  },
};

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItems, setEditingItems] = useState<Record<number, { actualQuantity: number; notes: string }>>({});
  const [bulkSaveDialog, setBulkSaveDialog] = useState(false);

  const { data: inventory, isLoading } = useInventory(Number(id));
  const updateInventoryItemMutation = useUpdateInventoryItem();
  const bulkUpdateMutation = useBulkUpdateInventoryItems();
  const updateInventoryMutation = useUpdateInventory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Инвентаризация не найдена</span>
        </div>
      </div>
    );
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartCounting = () => {
    updateInventoryMutation.mutate({
      id: inventory.id,
      data: { status: 'IN_PROGRESS' }
    });
  };

  const handleCompleteCounting = () => {
    updateInventoryMutation.mutate({
      id: inventory.id,
      data: { status: 'COMPLETED' }
    });
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItems(prev => ({
      ...prev,
      [item.id]: {
        actualQuantity: item.actualQuantity || item.expectedQuantity,
        notes: item.notes || '',
      }
    }));
  };

  const handleCancelEdit = (itemId: number) => {
    setEditingItems(prev => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSaveItem = (itemId: number) => {
    const editData = editingItems[itemId];
    if (editData) {
      updateInventoryItemMutation.mutate({
        itemId,
        data: editData,
        inventoryId: inventory.id,
      }, {
        onSuccess: () => {
          handleCancelEdit(itemId);
        }
      });
    }
  };

  const handleBulkSave = () => {
    const items = Object.entries(editingItems).map(([id, data]) => ({
      id: Number(id),
      actualQuantity: data.actualQuantity,
      notes: data.notes,
    }));

    bulkUpdateMutation.mutate({
      inventoryId: inventory.id,
      items,
    }, {
      onSuccess: () => {
        setEditingItems({});
        setBulkSaveDialog(false);
      }
    });
  };

  const filteredItems = inventory.items?.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.article?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const countedItems = filteredItems.filter(item => item.actualQuantity !== null);
  const uncountedItems = filteredItems.filter(item => item.actualQuantity === null);
  const hasUnsavedChanges = Object.keys(editingItems).length > 0;

  const canEdit = inventory.status === 'DRAFT' || inventory.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Инвентаризация {inventory.number}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {canEdit && inventory.status === 'DRAFT' && (
            <Button onClick={handleStartCounting}>
              <Clock className="w-4 h-4 mr-2" />
              Начать подсчет
            </Button>
          )}
          
          {canEdit && inventory.status === 'IN_PROGRESS' && (
            <Button onClick={handleCompleteCounting}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Завершить подсчет
            </Button>
          )}

          {inventory.status === 'COMPLETED' && (
            <Button onClick={() => navigate(`/inventory/${inventory.id}/analysis`)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Анализ расхождений
            </Button>
          )}
        </div>
      </div>

      {/* Информация об инвентаризации */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Основная информация
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Склад:</span>
                  <div className="font-medium text-gray-900">{inventory.warehouse.name}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Дата:</span>
                  <div className="font-medium text-gray-900">
                    {format(new Date(inventory.date), 'dd.MM.yyyy', { locale: ru })}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Статус:</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusConfig[inventory.status].className}`}>
                      {statusConfig[inventory.status].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Прогресс подсчета
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
                    <div className="text-xs text-gray-500">Всего позиций</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{countedItems.length}</div>
                    <div className="text-xs text-gray-500">Подсчитано</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">{uncountedItems.length}</div>
                    <div className="text-xs text-gray-500">Осталось</div>
                  </div>
                </div>
                
                {inventory.responsiblePerson && (
                  <div>
                    <span className="text-sm text-gray-500">Ответственный:</span>
                    <div className="font-medium text-gray-900">
                      {inventory.responsiblePerson.firstName} {inventory.responsiblePerson.lastName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {inventory.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-500">Примечания:</span>
              <div className="mt-1 text-gray-900">{inventory.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Уведомление о несохраненных изменениях */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                У вас есть несохраненные изменения в {Object.keys(editingItems).length} позициях
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => setBulkSaveDialog(true)}
              >
                Сохранить все
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItems({})}
              >
                Отменить все
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Поиск по названию или артикулу товара..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Вкладки и таблица */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1">
            <button
              onClick={() => setTabValue(0)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                tabValue === 0
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Все позиции ({filteredItems.length})
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                tabValue === 1
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Не подсчитано ({uncountedItems.length})
            </button>
            <button
              onClick={() => setTabValue(2)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                tabValue === 2
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Подсчитано ({countedItems.length})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryItemsTable
            items={tabValue === 0 ? filteredItems : tabValue === 1 ? uncountedItems : countedItems}
            editingItems={editingItems}
            canEdit={canEdit}
            onEdit={handleEditItem}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            onEditChange={(itemId, field, value) => {
              setEditingItems(prev => ({
                ...prev,
                [itemId]: {
                  ...prev[itemId],
                  [field]: value,
                }
              }));
            }}
          />
        </CardContent>
      </Card>

      {/* Диалог массового сохранения */}
      <Dialog
        open={bulkSaveDialog}
        onClose={() => setBulkSaveDialog(false)}
        title="Сохранить изменения"
        description={`Сохранить изменения в ${Object.keys(editingItems).length} позициях?`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setBulkSaveDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleBulkSave}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        }
      />
    </div>
  );
};

interface InventoryItemsTableProps {
  items: InventoryItem[];
  editingItems: Record<number, { actualQuantity: number; notes: string }>;
  canEdit: boolean;
  onEdit: (item: InventoryItem) => void;
  onSave: (itemId: number) => void;
  onCancel: (itemId: number) => void;
  onEditChange: (itemId: number, field: string, value: any) => void;
}

const InventoryItemsTable: React.FC<InventoryItemsTableProps> = ({
  items,
  editingItems,
  canEdit,
  onEdit,
  onSave,
  onCancel,
  onEditChange,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Позиции не найдены
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Учетное кол-во</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Фактическое кол-во</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Примечания</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Подсчитал</th>
            {canEdit && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Действия</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const isEditing = editingItems[item.id];
            const variance = item.actualQuantity !== null 
              ? Number(item.actualQuantity) - Number(item.expectedQuantity)
              : null;

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </div>
                    {item.product.article && (
                      <div className="text-xs text-gray-500">
                        Арт: {item.product.article}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.product.category?.name || '—'}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {Number(item.expectedQuantity)} {item.product.unit.shortName}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={isEditing.actualQuantity}
                      onChange={(e) => onEditChange(item.id, 'actualQuantity', Number(e.target.value))}
                      className="w-24 text-right"
                      min="0"
                      step="0.001"
                    />
                  ) : (
                    <div>
                      {item.actualQuantity !== null ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {Number(item.actualQuantity)} {item.product.unit.shortName}
                          </div>
                          {variance !== null && variance !== 0 && (
                            <div className={`text-xs ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance > 0 ? '+' : ''}{variance}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Не подсчитано
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {Number(item.price).toFixed(2)} ₽
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={isEditing.notes}
                      onChange={(e) => onEditChange(item.id, 'notes', e.target.value)}
                      placeholder="Примечания..."
                      className="w-48 px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                      rows={2}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {item.notes || '—'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.countedBy ? (
                    <div>
                      <div className="text-sm text-gray-900">
                        {item.countedBy.firstName} {item.countedBy.lastName}
                      </div>
                      {item.countedAt && (
                        <div className="text-xs text-gray-500">
                          {format(new Date(item.countedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">—</div>
                  )}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="sm"
                          onClick={() => onSave(item.id)}
                          className="p-1"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel(item.id)}
                          className="p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryDetail;
