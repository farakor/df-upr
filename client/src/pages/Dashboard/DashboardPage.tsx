import React from 'react';
import {
  TrendingUp,
  Package,
  ChefHat,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { state } = useAuth();

  const stats = [
    {
      title: 'Выручка за сегодня',
      value: '₽ 45,230',
      icon: <DollarSign className="h-4 w-4" />,
      trend: '+12% к вчера',
      description: 'Общая выручка за текущий день',
    },
    {
      title: 'Товаров в наличии',
      value: '1,234',
      icon: <Package className="h-4 w-4" />,
      description: 'Количество товаров на складе',
    },
    {
      title: 'Блюд продано',
      value: '89',
      icon: <ChefHat className="h-4 w-4" />,
      trend: '+5% к вчера',
      description: 'Количество проданных блюд',
    },
    {
      title: 'Средний чек',
      value: '₽ 508',
      icon: <TrendingUp className="h-4 w-4" />,
      trend: '+3% к вчера',
      description: 'Средняя сумма заказа',
    },
  ];

  const recentOperations = [
    { action: 'Продажа', item: 'Борщ украинский', amount: '₽ 250', time: '10:30' },
    { action: 'Поступление', item: 'Молоко 3.2%', amount: '50 л', time: '09:15' },
    { action: 'Продажа', item: 'Котлета с пюре', amount: '₽ 320', time: '08:45' },
    { action: 'Продажа', item: 'Салат Цезарь', amount: '₽ 180', time: '08:30' },
    { action: 'Поступление', item: 'Хлеб белый', amount: '20 шт', time: '08:00' },
  ];

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Добро пожаловать, {state.user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Вот краткий обзор вашего бизнеса на сегодня
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>График продаж</CardTitle>
            <CardDescription>
              Динамика продаж за последние 7 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>График будет реализован в следующих этапах</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Последние операции</CardTitle>
            <CardDescription>
              Недавние продажи и поступления
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOperations.map((operation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {operation.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {operation.item}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">
                      {operation.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {operation.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};