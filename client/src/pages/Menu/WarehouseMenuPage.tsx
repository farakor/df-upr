import React, { useState, useEffect } from 'react';
import { Plus, Store, UtensilsCrossed, CheckCircle, AlertTriangle, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useWarehouses } from '../../hooks/useWarehouses';

const WarehouseMenuPage: React.FC = () => {
  const {
    items: allMenuItems,
    loading: itemsLoading,
    error: itemsError,
    fetchItems,
    setWarehouseMenuItem,
    getWarehouseMenuItems,
    removeWarehouseMenuItem,
    checkItemAvailability,
  } = useMenuItems();

  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();

  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [warehouseMenuItems, setWarehouseMenuItems] = useState<any[]>([]);
  const [availabilityData, setAvailabilityData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    fetchItems({ isActive: true });
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadWarehouseMenu();
    }
  }, [selectedWarehouse]);

  const loadWarehouseMenu = async () => {
    if (!selectedWarehouse) return;

    setLoading(true);
    setError(null);
    try {
      const items = await getWarehouseMenuItems(selectedWarehouse as number);
      setWarehouseMenuItems(items);

      // Проверяем доступность каждого блюда
      const availability: Record<number, any> = {};
      for (const item of items) {
        if (item.recipe) {
          const result = await checkItemAvailability(item.id, selectedWarehouse as number);
          if (result) {
            availability[item.id] = result;
          }
        }
      }
      setAvailabilityData(availability);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки меню склада');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value === '' ? '' : parseInt(value));
    setWarehouseMenuItems([]);
    setAvailabilityData({});
  };

  const handleAvailabilityToggle = async (menuItemId: number, isAvailable: boolean) => {
    if (!selectedWarehouse) return;

    const success = await setWarehouseMenuItem({
      warehouseId: selectedWarehouse as number,
      menuItemId,
      isAvailable,
    });

    if (success) {
      await loadWarehouseMenu();
    }
  };

  const handlePriceOverride = async (menuItemId: number, priceOverride: number | null) => {
    if (!selectedWarehouse) return;

    const success = await setWarehouseMenuItem({
      warehouseId: selectedWarehouse as number,
      menuItemId,
      priceOverride,
    });

    if (success) {
      await loadWarehouseMenu();
    }
  };

  const handleRemoveItem = async (menuItemId: number) => {
    if (!selectedWarehouse) return;

    if (window.confirm('Вы уверены, что хотите удалить эту позицию из меню склада?')) {
      const success = await removeWarehouseMenuItem(selectedWarehouse as number, menuItemId);
      if (success) {
        await loadWarehouseMenu();
      }
    }
  };

  const handleOpenAddDialog = () => {
    // Фильтруем позиции, которых еще нет в меню склада
    const existingItemIds = warehouseMenuItems.map(item => item.id);
    const available = allMenuItems.filter(item => !existingItemIds.includes(item.id));
    setAvailableItems(available);
    setAddDialogOpen(true);
  };

  const handleAddItem = async (menuItemId: number) => {
    if (!selectedWarehouse) return;

    const success = await setWarehouseMenuItem({
      warehouseId: selectedWarehouse as number,
      menuItemId,
      isAvailable: true,
    });

    if (success) {
      setAddDialogOpen(false);
      await loadWarehouseMenu();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const getAvailabilityStatus = (item: any) => {
    const availability = availabilityData[item.id];
    if (!availability) return null;

    if (availability.isAvailable) {
      return (
        <Badge variant="default" className="flex items-center">
          <CheckCircle className="mr-1 h-3 w-3" />
          Доступно
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Недостает {availability.missingIngredients.length} ингр.
        </Badge>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройка меню по складам</h1>
          <p className="text-muted-foreground">
            Управление доступностью позиций меню на различных складах
          </p>
        </div>
      </div>

      {(error || itemsError) && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="text-sm text-destructive">{error || itemsError}</div>
        </div>
      )}

      <div className="max-w-md">
        <label htmlFor="warehouse" className="block text-sm font-medium mb-2">
          Выберите склад
        </label>
        <Select value={selectedWarehouse?.toString() || ''} onValueChange={handleWarehouseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите склад" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                {warehouse.name} ({warehouse.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedWarehouse && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <h2 className="text-xl font-semibold">
                Меню склада: {warehouses.find(w => w.id === selectedWarehouse)?.name}
              </h2>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить позицию
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Добавить позицию в меню склада</DialogTitle>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                  {availableItems.length === 0 ? (
                    <div className="text-center py-8">
                      <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Все доступные позиции уже добавлены в меню этого склада.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {availableItems.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAddItem(item.id)}>
                          <CardContent className="flex items-center space-x-4 p-4">
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.category && (
                                <Badge variant="outline" className="mt-1">
                                  {item.category.name}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading || itemsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-4">
              {warehouseMenuItems.map((item) => {
                const warehouseItem = item.warehouseMenuItems?.[0];
                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.category && (
                              <Badge variant="outline">
                                {item.category.name}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            {getAvailabilityStatus(item)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                              Базовая цена
                            </div>
                            <div className="font-semibold">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                              Цена на складе
                            </div>
                            <Input
                              type="number"
                              value={warehouseItem?.priceOverride || ''}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : null;
                                handlePriceOverride(item.id, value);
                              }}
                              placeholder={formatPrice(item.price)}
                              className="w-24 text-right"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={warehouseItem?.isAvailable || false}
                                onChange={(e) => handleAvailabilityToggle(item.id, e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">Активна</span>
                            </label>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {warehouseMenuItems.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Меню склада пусто</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Добавьте позиции меню для этого склада, чтобы они стали доступны для продажи.
                </p>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить позицию
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default WarehouseMenuPage;