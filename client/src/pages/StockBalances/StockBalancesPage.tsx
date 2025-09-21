import { useState } from 'react';
import { Search, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

import { useStockBalances } from '@/hooks/useStockBalances';
import { useWarehouses } from '@/hooks/useWarehouses';

export function StockBalancesPage() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: warehouses } = useWarehouses();
  const { data: stockBalancesData, isLoading, error } = useStockBalances(
    selectedWarehouseId!,
    {
      page,
      limit: 20,
      search: searchTerm || undefined,
    }
  );

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(parseInt(warehouseId));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const selectedWarehouse = warehouses?.find(w => w.id === selectedWarehouseId);

  // Подсчет статистики
  const totalProducts = stockBalancesData?.data.length || 0;
  const totalValue = stockBalancesData?.data.reduce((sum, balance) => sum + balance.totalValue, 0) || 0;
  const lowStockItems = stockBalancesData?.data.filter(balance => balance.quantity < 10).length || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Ошибка при загрузке остатков</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Остатки товаров</h1>
        <p className="text-muted-foreground">
          Просмотр текущих остатков товаров на складах
        </p>
      </div>

      {/* Выбор склада и поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={handleWarehouseChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedWarehouseId && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedWarehouseId ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Выберите склад</h3>
            <p className="text-muted-foreground">
              Выберите склад для просмотра остатков товаров
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  на складе {selectedWarehouse?.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toFixed(2)} ₽</div>
                <p className="text-xs text-muted-foreground">
                  стоимость остатков
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Низкие остатки</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  товаров с остатком &lt; 10
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Список остатков */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stockBalancesData?.data.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Остатки не найдены</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Попробуйте изменить параметры поиска' 
                    : 'На выбранном складе нет товаров с положительными остатками'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stockBalancesData?.data.map((balance) => (
                <Card key={balance.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{balance.product.name}</h3>
                            {balance.product.article && (
                              <p className="text-sm text-muted-foreground">
                                Артикул: {balance.product.article}
                              </p>
                            )}
                            {balance.product.category && (
                              <Badge variant="outline" className="mt-1">
                                {balance.product.category.name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold">
                                {balance.quantity.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {balance.product.unit.shortName}
                              </span>
                              {balance.quantity < 10 && (
                                <Badge variant="destructive" className="ml-2">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Низкий остаток
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Средняя цена</p>
                            <p className="font-semibold">{balance.avgPrice.toFixed(2)} ₽</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Общая стоимость</p>
                            <p className="font-semibold">{balance.totalValue.toFixed(2)} ₽</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Последнее движение</p>
                            <p className="font-semibold">
                              {balance.lastMovementDate 
                                ? format(new Date(balance.lastMovementDate), 'PPP', { locale: ru })
                                : 'Нет данных'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Пагинация */}
              {stockBalancesData && stockBalancesData.pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Предыдущая
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Страница {stockBalancesData.pagination.page} из {stockBalancesData.pagination.pages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page >= stockBalancesData.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Следующая
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
