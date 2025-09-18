import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const StyleTest: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-background">
      <h1 className="text-3xl font-bold text-foreground">Тест стилей Tailwind CSS</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Тестовая карточка</CardTitle>
          <CardDescription>Проверка работы компонентов</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Если вы видите красивые стили, значит Tailwind CSS работает правильно!
          </p>
          <div className="space-x-2">
            <Button>Основная кнопка</Button>
            <Button variant="outline">Контурная кнопка</Button>
            <Button variant="ghost">Прозрачная кнопка</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary text-primary-foreground p-4 rounded-lg">
          <h3 className="font-semibold">Primary</h3>
          <p className="text-sm opacity-90">Основной цвет</p>
        </div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
          <h3 className="font-semibold">Secondary</h3>
          <p className="text-sm opacity-90">Вторичный цвет</p>
        </div>
        <div className="bg-accent text-accent-foreground p-4 rounded-lg">
          <h3 className="font-semibold">Accent</h3>
          <p className="text-sm opacity-90">Акцентный цвет</p>
        </div>
      </div>
    </div>
  );
};
