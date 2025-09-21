import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { WarehouseForm } from '@/components/forms/WarehouseForm';
import { 
  useWarehouses, 
  useCreateWarehouse, 
  useUpdateWarehouse, 
  useDeleteWarehouse,
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData
} from '@/hooks/useWarehouses';

const warehouseTypeLabels = {
  MAIN: 'Основной склад',
  KITCHEN: 'Кухня',
  RETAIL: 'Торговый зал'
};

const warehouseTypeBadgeVariants = {
  MAIN: 'default' as const,
  KITCHEN: 'secondary' as const,
  RETAIL: 'outline' as const
};

export function WarehousePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // Запросы
  const { data: warehouses = [], isLoading, error } = useWarehouses();
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  // Фильтрация складов
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчики
  const handleCreateWarehouse = (data: CreateWarehouseData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };

  const handleUpdateWarehouse = (data: UpdateWarehouseData) => {
    if (editingWarehouse) {
      updateMutation.mutate(
        { id: editingWarehouse.id, data },
        {
          onSuccess: () => {
            setEditingWarehouse(null);
          }
        }
      );
    }
  };

  const handleDeleteWarehouse = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Ошибка при загрузке складов: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление складами</h1>
          <p className="text-muted-foreground">
            Управление складами и просмотр остатков товаров
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить склад
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать новый склад</DialogTitle>
            </DialogHeader>
            <WarehouseForm
              onSubmit={handleCreateWarehouse}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Поиск */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск складов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Список складов */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Склады не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Попробуйте изменить критерии поиска' : 'Создайте первый склад для начала работы'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить склад
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <Badge variant={warehouseTypeBadgeVariants[warehouse.type]}>
                      {warehouseTypeLabels[warehouse.type]}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWarehouse(warehouse)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить склад?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить склад "{warehouse.name}"? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWarehouse(warehouse.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {warehouse.address && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{warehouse.address}</span>
                  </div>
                )}
                
                {warehouse.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{warehouse.phone}</span>
                  </div>
                )}
                
                {warehouse.manager && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{warehouse.manager.firstName} {warehouse.manager.lastName}</span>
                  </div>
                )}

                {warehouse._count && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Товаров в наличии: {warehouse._count.stockBalances}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Просмотр остатков
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог редактирования */}
      <Dialog open={!!editingWarehouse} onOpenChange={() => setEditingWarehouse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать склад</DialogTitle>
          </DialogHeader>
          {editingWarehouse && (
            <WarehouseForm
              warehouse={editingWarehouse}
              onSubmit={handleUpdateWarehouse}
              onCancel={() => setEditingWarehouse(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
