import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Separator } from '../../components/ui/Separator';
import { useDailySummary, useSalesStats, useSales } from '../../hooks/useSales';
import { useWarehouses } from '../../hooks/useWarehouses';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

export const SalesDashboard: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'cashier' | 'menuItem'>('day');

  const { data: warehouses } = useWarehouses();
  const { data: dailySummary } = useDailySummary({ 
    warehouseId: selectedWarehouse || undefined 
  });
  const { data: salesStats } = useSalesStats({
    warehouseId: selectedWarehouse || undefined,
    dateFrom,
    dateTo,
    groupBy
  });
  const { data: recentSales } = useSales({
    warehouseId: selectedWarehouse || undefined,
    dateFrom: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfDay(new Date()), 'yyyy-MM-dd'),
    limit: 10
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-4 w-4" />;
      case 'CARD':
        return <CreditCard className="h-4 w-4" />;
      case 'TRANSFER':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Наличные';
      case 'CARD':
        return 'Карта';
      case 'TRANSFER':
        return 'Перевод';
      case 'MIXED':
        return 'Смешанная';
      default:
        return method;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Дашборд продаж</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="warehouse">Склад:</Label>
            <Select
              value={selectedWarehouse?.toString() || 'all'}
              onValueChange={(value) => setSelectedWarehouse(value === 'all' ? null : parseInt(value))}
            >
              <SelectTrigger className="w-48">
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
        </div>
      </div>

      {/* Дневная сводка */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продажи сегодня</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              чеков за сегодня
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка сегодня</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailySummary?.totalAmount?.toFixed(2) || '0.00'} ₽
            </div>
            <p className="text-xs text-muted-foreground">
              общая сумма продаж
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Скидки сегодня</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailySummary?.totalDiscount?.toFixed(2) || '0.00'} ₽
            </div>
            <p className="text-xs text-muted-foreground">
              общая сумма скидок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailySummary && dailySummary.totalSales && dailySummary.totalSales > 0 && dailySummary.totalAmount
                ? (dailySummary.totalAmount / dailySummary.totalSales).toFixed(2)
                : '0.00'
              } ₽
            </div>
            <p className="text-xs text-muted-foreground">
              средняя сумма чека
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Способы оплаты */}
        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySummary && Object.keys(dailySummary.paymentMethods).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(dailySummary.paymentMethods).map(([method, stats]: [string, any]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method)}
                      <span>{getPaymentMethodLabel(method)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.amount.toFixed(2)} ₽</div>
                      <div className="text-sm text-muted-foreground">
                        {stats.count} чеков
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Нет данных о продажах
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кассиры */}
        <Card>
          <CardHeader>
            <CardTitle>Работа кассиров сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySummary && Object.keys(dailySummary.cashiers).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(dailySummary.cashiers)
                  .sort(([,a]: [string, any], [,b]: [string, any]) => b.amount - a.amount)
                  .map(([cashier, stats]: [string, any]) => (
                    <div key={cashier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{cashier}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{stats.amount.toFixed(2)} ₽</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.count} чеков
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Нет данных о кассирах
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Топ блюд */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Популярные блюда сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          {dailySummary && dailySummary.topMenuItems && dailySummary.topMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailySummary.topMenuItems.slice(0, 6).map((item: any, index: number) => (
                <div key={item.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div className="text-sm font-medium">
                      {item.quantity} порций
                    </div>
                  </div>
                  <h4 className="font-medium mb-1">{item.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {item.amount.toFixed(2)} ₽
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Нет данных о продажах блюд
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика за период */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Статистика за период</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom">С:</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo">По:</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="groupBy">Группировка:</Label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">По дням</SelectItem>
                  <SelectItem value="week">По неделям</SelectItem>
                  <SelectItem value="month">По месяцам</SelectItem>
                  <SelectItem value="cashier">По кассирам</SelectItem>
                  <SelectItem value="menuItem">По блюдам</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {salesStats && salesStats.length > 0 ? (
            <div className="space-y-2">
              {salesStats.map((stat: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">
                      {groupBy === 'day' && format(new Date(stat.period), 'dd MMMM yyyy', { locale: ru })}
                      {groupBy === 'week' && `Неделя с ${format(new Date(stat.period), 'dd.MM.yyyy')}`}
                      {groupBy === 'month' && format(new Date(stat.period + '-01'), 'LLLL yyyy', { locale: ru })}
                      {(groupBy === 'cashier' || groupBy === 'menuItem') && stat.period}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.salesCount} продаж
                    </div>
                  </div>
                  <div className="font-bold">
                    {stat.totalAmount.toFixed(2)} ₽
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Нет данных за выбранный период
            </div>
          )}
        </CardContent>
      </Card>

      {/* Последние продажи */}
      <Card>
        <CardHeader>
          <CardTitle>Последние продажи сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales && recentSales.sales && recentSales.sales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.sales.map((sale: any) => (
                <div key={sale.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{sale.number}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(sale.date), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="font-bold">{sale.totalAmount.toFixed(2)} ₽</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {sale.cashier && (
                        <span className="text-sm text-muted-foreground">
                          Кассир: {sale.cashier.firstName} {sale.cashier.lastName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sale.items ? sale.items.length : 0} позиций
                    </div>
                  </div>
                  {sale.customerName && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Клиент: {sale.customerName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Нет продаж сегодня
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
