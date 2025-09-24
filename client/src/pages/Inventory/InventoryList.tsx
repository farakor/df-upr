import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Check, 
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { useInventories, useDeleteInventory, useApproveInventory } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Inventory, InventoryFilters } from '../../services/api/inventory';

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

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const { data: inventoriesData, isLoading } = useInventories(filters);
  const { data: warehouses } = useWarehouses();
  const deleteInventoryMutation = useDeleteInventory();
  const approveInventoryMutation = useApproveInventory();

  const handleFilterChange = (field: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Сбрасываем страницу при изменении фильтров
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDropdownToggle = (inventoryId: number, inventory: Inventory) => {
    if (dropdownOpen === inventoryId) {
      setDropdownOpen(null);
      setSelectedInventory(null);
    } else {
      setDropdownOpen(inventoryId);
      setSelectedInventory(inventory);
    }
  };

  const handleDropdownClose = () => {
    setDropdownOpen(null);
    setSelectedInventory(null);
  };

  const handleView = () => {
    if (selectedInventory) {
      navigate(`/inventory/${selectedInventory.id}`);
    }
    handleDropdownClose();
  };

  const handleEdit = () => {
    if (selectedInventory) {
      navigate(`/inventory/${selectedInventory.id}/edit`);
    }
    handleDropdownClose();
  };

  const handleAnalysis = () => {
    if (selectedInventory) {
      navigate(`/inventory/${selectedInventory.id}/analysis`);
    }
    handleDropdownClose();
  };

  const handleApprove = () => {
    if (selectedInventory) {
      approveInventoryMutation.mutate(selectedInventory.id);
    }
    handleDropdownClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleDropdownClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedInventory) {
      deleteInventoryMutation.mutate(selectedInventory.id);
    }
    setDeleteDialogOpen(false);
    setSelectedInventory(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedInventory(null);
  };

  const canEdit = (inventory: Inventory) => {
    return inventory.status === 'DRAFT' || inventory.status === 'IN_PROGRESS';
  };

  const canDelete = (inventory: Inventory) => {
    return inventory.status === 'DRAFT';
  };

  const canApprove = (inventory: Inventory) => {
    return inventory.status === 'COMPLETED';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Инвентаризации</h1>
        <Button onClick={() => navigate('/inventory/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Создать инвентаризацию
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Фильтры</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Скрыть' : 'Показать'} фильтры
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Склад
                </label>
                <Select
                  value={filters.warehouseId?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('warehouseId', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все склады" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все склады</SelectItem>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="DRAFT">Черновик</SelectItem>
                    <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
                    <SelectItem value="COMPLETED">Завершена</SelectItem>
                    <SelectItem value="APPROVED">Утверждена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата с
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата по
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Таблица инвентаризаций */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Номер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Склад
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ответственный
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Позиций
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : inventoriesData?.inventories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Инвентаризации не найдены
                  </td>
                </tr>
              ) : (
                inventoriesData?.inventories.map((inventory) => (
                  <tr key={inventory.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inventory.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(inventory.date), 'dd.MM.yyyy', { locale: ru })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inventory.warehouse.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusConfig[inventory.status].className}`}>
                        {statusConfig[inventory.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inventory.responsiblePerson
                        ? `${inventory.responsiblePerson.firstName} ${inventory.responsiblePerson.lastName}`
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inventory._count?.items || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(inventory.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDropdownToggle(inventory.id, inventory)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {dropdownOpen === inventory.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={handleView}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Просмотр
                              </button>
                              {canEdit(inventory) && (
                                <button
                                  onClick={handleEdit}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Редактировать
                                </button>
                              )}
                              {inventory.status !== 'DRAFT' && (
                                <button
                                  onClick={handleAnalysis}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Анализ расхождений
                                </button>
                              )}
                              {canApprove(inventory) && (
                                <button
                                  onClick={handleApprove}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Утвердить
                                </button>
                              )}
                              {canDelete(inventory) && (
                                <button
                                  onClick={handleDeleteClick}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Удалить
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Пагинация */}
      {inventoriesData && inventoriesData.pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(inventoriesData.pagination.page - 1)}
              disabled={inventoriesData.pagination.page === 1}
            >
              Предыдущая
            </Button>
            
            <span className="text-sm text-gray-700">
              Страница {inventoriesData.pagination.page} из {inventoriesData.pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(inventoriesData.pagination.page + 1)}
              disabled={inventoriesData.pagination.page === inventoriesData.pagination.pages}
            >
              Следующая
            </Button>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        title="Подтверждение удаления"
        description={
          <div className="space-y-2">
            <p>
              Вы уверены, что хотите удалить инвентаризацию{' '}
              <strong>{selectedInventory?.number}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Это действие нельзя отменить.
            </p>
          </div>
        }
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteInventoryMutation.isPending}
            >
              {deleteInventoryMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        }
      />

      {/* Обработчик клика вне dropdown для закрытия */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleDropdownClose}
        />
      )}
    </div>
  );
};

export default InventoryList;
