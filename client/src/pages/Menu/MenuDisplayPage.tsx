import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Info, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useWarehouses } from '../../hooks/useWarehouses';

const MenuDisplayPage: React.FC = () => {
  const {
    getAvailableMenu,
    checkItemAvailability,
    loading,
    error,
  } = useMenuItems();

  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();

  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [menuData, setMenuData] = useState<any>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<number, any>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // useWarehouses автоматически загружает данные, поэтому useEffect не нужен

  useEffect(() => {
    if (selectedWarehouse) {
      loadMenu();
    }
  }, [selectedWarehouse]);

  const loadMenu = async () => {
    if (!selectedWarehouse) return;

    try {
      const menu = await getAvailableMenu(selectedWarehouse as number);
      setMenuData(menu);

      // Проверяем доступность каждого блюда
      const availability: Record<number, any> = {};
      if (menu?.categories) {
        for (const category of menu.categories) {
          for (const item of category.menuItems) {
            if (item.recipe) {
              const result = await checkItemAvailability(item.id, selectedWarehouse as number);
              if (result) {
                availability[item.id] = result;
              }
            }
          }
        }
      }
      setAvailabilityData(availability);
    } catch (err) {
      console.error('Error loading menu:', err);
    }
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value === '' ? '' : parseInt(value));
    setMenuData(null);
    setAvailabilityData({});
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const getEffectivePrice = (item: any) => {
    const warehouseItem = item.warehouseMenuItems?.[0];
    return warehouseItem?.priceOverride || item.price;
  };

  const getAvailabilityIcon = (item: any) => {
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
          Нет ингредиентов
        </Badge>
      );
    }
  };

  const getRecipeInfo = (item: any) => {
    if (!item.recipe) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Состав: {item.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Порция: {item.recipe.portionSize}г
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Ингредиенты:</h4>
              {item.recipe.ingredients.map((ingredient: any, index: number) => (
                <div key={index} className="text-sm flex justify-between">
                  <span>{ingredient.product.name}</span>
                  <span>{ingredient.quantity} {ingredient.unit.shortName}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Меню</h1>
          <p className="text-muted-foreground">
            Просмотр доступного меню для выбранной точки продаж
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="max-w-md">
        <label htmlFor="warehouse" className="block text-sm font-medium mb-2">
          Выберите точку продаж
        </label>
        <Select value={selectedWarehouse?.toString() || ''} onValueChange={handleWarehouseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите точку продаж" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.filter(w => w.type === 'KITCHEN' || w.type === 'RETAIL').map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                {warehouse.name} ({warehouse.type === 'KITCHEN' ? 'Кухня' : 'Торговая точка'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedWarehouse && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : menuData?.categories ? (
            <div className="space-y-4">
              {menuData.categories.map((category: any) => {
                const isExpanded = expandedCategories.includes(category.id.toString());
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCategory(category.id.toString())}
                      >
                        <CardTitle className="flex items-center space-x-2">
                          <UtensilsCrossed className="h-5 w-5" />
                          <span>{category.name}</span>
                          <Badge variant="outline">
                            {category.menuItems.length} позиций
                          </Badge>
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {category.menuItems.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden">
                              <div className="aspect-video relative bg-muted">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 flex space-x-1">
                                  {getAvailabilityIcon(item)}
                                  {getRecipeInfo(item)}
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold truncate">{item.name}</h3>
                                    <span className="text-lg font-bold text-primary">
                                      {formatPrice(getEffectivePrice(item))}
                                    </span>
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex space-x-1">
                                      <Badge variant={item.isAvailable ? "default" : "destructive"}>
                                        {item.isAvailable ? 'Доступно' : 'Недоступно'}
                                      </Badge>
                                      {availabilityData[item.id] && !availabilityData[item.id].isAvailable && (
                                        <Badge variant="destructive">
                                          Нет ингредиентов
                                        </Badge>
                                      )}
                                    </div>
                                    {item.recipe && (
                                      <Badge variant="outline" className="text-xs">
                                        {item.recipe.portionSize}г
                                      </Badge>
                                    )}
                                  </div>

                                  {item.costPrice && (
                                    <div className="text-xs text-muted-foreground">
                                      Себестоимость: {formatPrice(item.costPrice)}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Меню не настроено</h3>
                <p className="text-muted-foreground text-center">
                  Меню для выбранной точки продаж пусто или не настроено.
                  Перейдите в настройки меню по складам для добавления позиций.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedWarehouse && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Выберите точку продаж</h3>
            <p className="text-muted-foreground text-center">
              Выберите склад или торговую точку, чтобы просмотреть доступное меню.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenuDisplayPage;