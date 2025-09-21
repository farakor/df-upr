import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, ArrowRightLeft, Package, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

import { useStockMovements } from '@/hooks/useStockMovements';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/utils/cn';

const movementTypeLabels = {
  IN: 'Поступление',
  OUT: 'Расход',
  TRANSFER_IN: 'Перемещение (приход)',
  TRANSFER_OUT: 'Перемещение (расход)',
  WRITEOFF: 'Списание',
  PRODUCTION_USE: 'Производство'
};

const movementTypeVariants = {
  IN: 'default' as const,
  OUT: 'destructive' as const,
  TRANSFER_IN: 'secondary' as const,
  TRANSFER_OUT: 'outline' as const,
  WRITEOFF: 'destructive' as const,
  PRODUCTION_USE: 'outline' as const
};

const movementTypeIcons = {
  IN: TrendingUp,
  OUT: TrendingDown,
  TRANSFER_IN: ArrowRightLeft,
  TRANSFER_OUT: ArrowRightLeft,
  WRITEOFF: TrendingDown,
  PRODUCTION_USE: Package
};

export function StockMovementsPage() {
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  
  const { data: movementsData, isLoading, error } = useStockMovements({
    page,
    limit: 20,
    warehouseId: warehouseFilter ? parseInt(warehouseFilter) : undefined,
    productId: productFilter ? parseInt(productFilter) : undefined,
    type: typeFilter || undefined,
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
  });

  const handleClearFilters = () => {
    setWarehouseFilter('');
    setProductFilter('');
    setTypeFilter('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Ошибка при загрузке движений товаров</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">История движений товаров</h1>
        <p className="text-muted-foreground">
          Просмотр всех движений товаров по складам
        </p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Фильтры</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Склад */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Склад</label>
              <Select value={warehouseFilter || 'all'} onValueChange={(value) => setWarehouseFilter(value === 'all' ? '' : value)}>
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

            {/* Товар */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Товар</label>
              <Select value={productFilter || 'all'} onValueChange={(value) => setProductFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все товары" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  {products?.data?.slice(0, 50).map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Тип движения */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип движения</label>
              <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="IN">Поступление</SelectItem>
                  <SelectItem value="OUT">Расход</SelectItem>
                  <SelectItem value="TRANSFER_IN">Перемещение (приход)</SelectItem>
                  <SelectItem value="TRANSFER_OUT">Перемещение (расход)</SelectItem>
                  <SelectItem value="WRITEOFF">Списание</SelectItem>
                  <SelectItem value="PRODUCTION_USE">Производство</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Период */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Период</label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd.MM.yy") : "От"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd.MM.yy") : "До"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearFilters}>
              Очистить фильтры
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список движений */}
      {isLoading ? (
        <div className="space-y-4">
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
      ) : movementsData?.data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Движения не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры фильтрации
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {movementsData?.data.map((movement) => {
            const IconComponent = movementTypeIcons[movement.type];
            return (
              <Card key={movement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center space-x-2">
                            <IconComponent className="h-5 w-5" />
                            <span>{movement.product.name}</span>
                          </h3>
                          {movement.product.article && (
                            <p className="text-sm text-muted-foreground">
                              Артикул: {movement.product.article}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Склад: {movement.warehouse.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={movementTypeVariants[movement.type]}>
                            {movementTypeLabels[movement.type]}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Количество</p>
                          <p className="font-semibold">
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity.toFixed(2)} {movement.product.unit.shortName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Цена за единицу</p>
                          <p className="font-semibold">{movement.price.toFixed(2)} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Сумма</p>
                          <p className="font-semibold">
                            {(Math.abs(movement.quantity) * movement.price).toFixed(2)} ₽
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Дата</p>
                          <p className="font-semibold">
                            {format(new Date(movement.createdAt), 'PPp', { locale: ru })}
                          </p>
                        </div>
                      </div>

                      {/* Дополнительная информация */}
                      {(movement.document || movement.batchNumber || movement.expiryDate) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 mt-3 border-t">
                          {movement.document && (
                            <div>
                              <p className="text-sm text-muted-foreground">Документ</p>
                              <p className="font-semibold">{movement.document.number}</p>
                            </div>
                          )}
                          {movement.batchNumber && (
                            <div>
                              <p className="text-sm text-muted-foreground">Партия</p>
                              <p className="font-semibold">{movement.batchNumber}</p>
                            </div>
                          )}
                          {movement.expiryDate && (
                            <div>
                              <p className="text-sm text-muted-foreground">Срок годности</p>
                              <p className="font-semibold">
                                {format(new Date(movement.expiryDate), 'PPP', { locale: ru })}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Пагинация */}
          {movementsData && movementsData.pagination.pages > 1 && (
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
                  Страница {movementsData.pagination.page} из {movementsData.pagination.pages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= movementsData.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Следующая
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
