import React, { useState, useEffect } from 'react';
import { Plus, Store, UtensilsCrossed, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/spinner';
import { useMenu } from '../../hooks/useMenu';
import { useWarehouses } from '../../hooks/useWarehouses';

const WarehouseMenuPage: React.FC = () => {
  const {
    menus: allMenus,
    loading: menusLoading,
    error: menusError,
    fetchMenus,
    addWarehouseMenu,
    getWarehouseMenus,
    updateWarehouseMenu,
    removeWarehouseMenu,
  } = useMenu();

  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();

  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [warehouseMenus, setWarehouseMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableMenus, setAvailableMenus] = useState<any[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  useEffect(() => {
    fetchMenus({ isActive: true });
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadWarehouseMenus();
    } else {
      setWarehouseMenus([]);
    }
  }, [selectedWarehouse]);

  const loadWarehouseMenus = async () => {
    if (!selectedWarehouse) return;

    setLoading(true);
    setError(null);
    try {
      const menus = await getWarehouseMenus(selectedWarehouse as number);
      setWarehouseMenus(menus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки меню склада');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value === '' ? '' : parseInt(value));
    setWarehouseMenus([]);
  };

  const handleAddMenuClick = () => {
    // Находим меню, которые еще не привязаны к складу
    const attachedMenuIds = warehouseMenus.map(wm => wm.menu.id);
    const available = allMenus.filter(menu => !attachedMenuIds.includes(menu.id) && menu.isActive);
    setAvailableMenus(available);
    setSelectedMenuId('');
    setAddDialogOpen(true);
  };

  const handleAddMenu = async () => {
    if (!selectedWarehouse || !selectedMenuId) return;

    const menuId = parseInt(selectedMenuId);
    const success = await addWarehouseMenu({
      warehouseId: selectedWarehouse as number,
      menuId,
      isActive: true,
    });

    if (success) {
      await loadWarehouseMenus();
      setAddDialogOpen(false);
      setSelectedMenuId('');
    }
  };

  const handleToggleActive = async (menuId: number, currentActive: boolean) => {
    if (!selectedWarehouse) return;

    const success = await updateWarehouseMenu(
      selectedWarehouse as number,
      menuId,
      { isActive: !currentActive }
    );

    if (success) {
      await loadWarehouseMenus();
    }
  };

  const handleRemoveMenu = async (menuId: number) => {
    if (!selectedWarehouse) return;

    if (window.confirm('Вы уверены, что хотите отвязать это меню от склада?')) {
      const success = await removeWarehouseMenu(selectedWarehouse as number, menuId);
      if (success) {
        await loadWarehouseMenus();
      }
    }
  };

  if (warehousesLoading || menusLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройка меню по складам</h1>
          <p className="text-muted-foreground">
            Привязка меню к складам для управления доступностью
          </p>
        </div>
      </div>

      {/* Ошибки */}
      {(error || menusError) && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="text-sm text-destructive">{error || menusError}</div>
        </div>
      )}

      {/* Выбор склада */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Выбор склада
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedWarehouse?.toString() || ''} onValueChange={handleWarehouseChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите склад" />
            </SelectTrigger>
            <SelectContent>
              {warehouses
                .filter((w) => w.isActive)
                .map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name} ({warehouse.type === 'MAIN' ? 'Основной' : warehouse.type === 'KITCHEN' ? 'Кухня' : 'Торговая точка'})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Меню склада */}
      {selectedWarehouse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                Меню склада
              </CardTitle>
              <Button onClick={handleAddMenuClick} className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить меню
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : warehouseMenus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет привязанных меню к этому складу
              </div>
            ) : (
              <div className="space-y-4">
                {warehouseMenus.map((warehouseMenu) => (
                  <div
                    key={warehouseMenu.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{warehouseMenu.menu.name}</h3>
                        <Badge variant={warehouseMenu.isActive ? 'default' : 'secondary'}>
                          {warehouseMenu.isActive ? 'Активно' : 'Неактивно'}
                        </Badge>
                        <Badge variant="outline">
                          {warehouseMenu.menu.menuItems?.length || 0} позиций
                        </Badge>
                      </div>
                      {warehouseMenu.menu.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {warehouseMenu.menu.description}
                        </p>
                      )}
                      {(warehouseMenu.menu.startDate || warehouseMenu.menu.endDate) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {warehouseMenu.menu.startDate && `С ${new Date(warehouseMenu.menu.startDate).toLocaleDateString()}`}
                          {warehouseMenu.menu.endDate && ` по ${new Date(warehouseMenu.menu.endDate).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(warehouseMenu.menu.id, warehouseMenu.isActive)}
                      >
                        {warehouseMenu.isActive ? 'Деактивировать' : 'Активировать'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMenu(warehouseMenu.menu.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Диалог добавления меню */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить меню к складу</DialogTitle>
            <DialogDescription>
              Выберите меню, которое будет доступно для выбранного склада
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Выберите меню</label>
              <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите меню" />
                </SelectTrigger>
                <SelectContent>
                  {availableMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id.toString()}>
                      {menu.name}
                      {menu.description && ` - ${menu.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddMenu} disabled={!selectedMenuId}>
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseMenuPage;