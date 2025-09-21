import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateSupplierData, UpdateSupplierData, Supplier } from '@/hooks/useSuppliers';

// Схема валидации
const supplierSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа').max(100, 'Название не должно превышать 100 символов'),
  legalName: z.string().max(255, 'Юридическое название не должно превышать 255 символов').optional().or(z.literal('')),
  inn: z.string().regex(/^\d{10}$|^\d{12}$/, 'ИНН должен содержать 10 или 12 цифр').optional().or(z.literal('')),
  kpp: z.string().regex(/^\d{9}$/, 'КПП должен содержать 9 цифр').optional().or(z.literal('')),
  address: z.string().max(500, 'Адрес не должен превышать 500 символов').optional().or(z.literal('')),
  phone: z.string().max(20, 'Телефон не должен превышать 20 символов').optional().or(z.literal('')),
  email: z.string().email('Некорректный формат email').max(100, 'Email не должен превышать 100 символов').optional().or(z.literal('')),
  contactPerson: z.string().max(100, 'Контактное лицо не должно превышать 100 символов').optional().or(z.literal('')),
  paymentTerms: z.number().min(0, 'Условия оплаты не могут быть отрицательными').max(365, 'Условия оплаты не должны превышать 365 дней').optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierForm({ supplier, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || '',
      legalName: supplier?.legalName || '',
      inn: supplier?.inn || '',
      kpp: supplier?.kpp || '',
      address: supplier?.address || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      contactPerson: supplier?.contactPerson || '',
      paymentTerms: supplier?.paymentTerms || 0,
    }
  });

  const handleFormSubmit = (data: SupplierFormData) => {
    const submitData = {
      ...data,
      legalName: data.legalName || undefined,
      inn: data.inn || undefined,
      kpp: data.kpp || undefined,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      contactPerson: data.contactPerson || undefined,
      paymentTerms: data.paymentTerms || 0,
    };
    onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {supplier ? 'Редактировать поставщика' : 'Создать нового поставщика'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="name">Название поставщика *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Введите название поставщика"
                error={errors.name?.message}
              />
            </div>

            {/* Юридическое название */}
            <div className="space-y-2">
              <Label htmlFor="legalName">Юридическое название</Label>
              <Input
                id="legalName"
                {...register('legalName')}
                placeholder="Введите полное юридическое название"
                error={errors.legalName?.message}
              />
            </div>
          </div>

          {/* Реквизиты */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Реквизиты</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ИНН */}
              <div className="space-y-2">
                <Label htmlFor="inn">ИНН</Label>
                <Input
                  id="inn"
                  {...register('inn')}
                  placeholder="1234567890"
                  error={errors.inn?.message}
                />
              </div>

              {/* КПП */}
              <div className="space-y-2">
                <Label htmlFor="kpp">КПП</Label>
                <Input
                  id="kpp"
                  {...register('kpp')}
                  placeholder="123456789"
                  error={errors.kpp?.message}
                />
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Контактная информация</h3>
            
            {/* Адрес */}
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Введите адрес поставщика"
                error={errors.address?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Телефон */}
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+7 (999) 123-45-67"
                  error={errors.phone?.message}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="supplier@example.com"
                  error={errors.email?.message}
                />
              </div>
            </div>

            {/* Контактное лицо */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Контактное лицо</Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                placeholder="Введите ФИО контактного лица"
                error={errors.contactPerson?.message}
              />
            </div>
          </div>

          {/* Условия работы */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Условия работы</h3>
            
            {/* Условия оплаты */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Условия оплаты (дней)</Label>
              <Input
                id="paymentTerms"
                type="number"
                min="0"
                max="365"
                {...register('paymentTerms', { valueAsNumber: true })}
                placeholder="0"
                error={errors.paymentTerms?.message}
              />
              <p className="text-sm text-muted-foreground">
                Количество дней отсрочки платежа (0 - предоплата)
              </p>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : supplier ? 'Обновить' : 'Создать'}
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
