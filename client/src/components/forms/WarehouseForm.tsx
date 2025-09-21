import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateWarehouseData, UpdateWarehouseData, Warehouse } from '@/hooks/useWarehouses';

// Схема валидации
const warehouseSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа').max(100, 'Название не должно превышать 100 символов'),
  type: z.enum(['MAIN', 'KITCHEN', 'RETAIL'], { required_error: 'Выберите тип склада' }),
  address: z.string().max(255, 'Адрес не должен превышать 255 символов').optional().or(z.literal('')),
  phone: z.string().max(20, 'Телефон не должен превышать 20 символов').optional().or(z.literal('')),
  managerId: z.number().optional().or(z.literal('')),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const warehouseTypeLabels = {
  MAIN: 'Основной склад',
  KITCHEN: 'Кухня',
  RETAIL: 'Торговый зал'
};

export function WarehouseForm({ warehouse, onSubmit, onCancel, isLoading }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name || '',
      type: warehouse?.type || 'MAIN',
      address: warehouse?.address || '',
      phone: warehouse?.phone || '',
      managerId: warehouse?.managerId || undefined,
    }
  });

  const selectedType = watch('type');

  const handleFormSubmit = (data: WarehouseFormData) => {
    const submitData = {
      ...data,
      address: data.address || undefined,
      phone: data.phone || undefined,
      managerId: data.managerId || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {warehouse ? 'Редактировать склад' : 'Создать новый склад'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="name">Название склада *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Введите название склада"
              error={errors.name?.message}
            />
          </div>

          {/* Тип склада */}
          <div className="space-y-2">
            <Label htmlFor="type">Тип склада *</Label>
            <Select
              value={selectedType}
              onValueChange={(value: 'MAIN' | 'KITCHEN' | 'RETAIL') => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип склада" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(warehouseTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Адрес */}
          <div className="space-y-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Введите адрес склада"
              error={errors.address?.message}
            />
          </div>

          {/* Телефон */}
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Введите телефон"
              error={errors.phone?.message}
            />
          </div>

          {/* Менеджер - пока оставим как текстовое поле, позже можно заменить на Select с пользователями */}
          <div className="space-y-2">
            <Label htmlFor="managerId">ID менеджера</Label>
            <Input
              id="managerId"
              type="number"
              {...register('managerId', { valueAsNumber: true })}
              placeholder="Введите ID менеджера"
              error={errors.managerId?.message}
            />
            <p className="text-sm text-muted-foreground">
              Оставьте пустым, если менеджер не назначен
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : warehouse ? 'Обновить' : 'Создать'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
