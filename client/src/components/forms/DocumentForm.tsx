import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';

import { CreateDocumentData, AddDocumentItemData } from '@/hooks/useDocuments';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { cn } from '@/utils/cn';
import { SupplierCombobox } from '@/components/common/SupplierCombobox';

const documentSchema = z.object({
  type: z.enum(['RECEIPT', 'TRANSFER', 'WRITEOFF', 'INVENTORY_ADJUSTMENT']),
  date: z.date(),
  supplierId: z.number().optional(),
  warehouseFromId: z.number().optional(),
  warehouseToId: z.number().optional(),
  notes: z.string().optional(),
});

const documentItemSchema = z.object({
  productId: z.number({ required_error: 'Выберите товар' }),
  quantity: z.number({ required_error: 'Укажите количество' }).positive('Количество должно быть положительным'),
  unitId: z.number({ required_error: 'Выберите единицу измерения' }),
  price: z.number({ required_error: 'Укажите цену' }).positive('Цена должна быть положительной'),
  expiryDate: z.date().optional(),
  batchNumber: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;
type DocumentItemFormData = z.infer<typeof documentItemSchema>;

interface DocumentFormProps {
  type: 'RECEIPT' | 'TRANSFER' | 'WRITEOFF' | 'INVENTORY_ADJUSTMENT';
  onSubmit: (data: CreateDocumentData, items: AddDocumentItemData[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const documentTypeLabels = {
  RECEIPT: 'Приход товара',
  TRANSFER: 'Перемещение товара',
  WRITEOFF: 'Списание товара',
  INVENTORY_ADJUSTMENT: 'Корректировка остатков'
};

export function DocumentForm({ type, onSubmit, onCancel, isLoading = false }: DocumentFormProps) {
  const [items, setItems] = useState<(DocumentItemFormData & { tempId: string })[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const { data: suppliers } = useSuppliers();
  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts({ isActive: true }); // Показываем только активные товары
  const { data: units } = useUnits();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type,
      date: new Date(),
    },
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    watch: watchItem,
    setValue: setValueItem,
    reset: resetItem,
    formState: { errors: itemErrors },
  } = useForm<DocumentItemFormData>({
    resolver: zodResolver(documentItemSchema),
  });

  const watchedDate = watch('date');
  const watchedSupplierId = watch('supplierId');
  const watchedItemProductId = watchItem('productId');
  const watchedItemUnitId = watchItem('unitId');
  const watchedItemQuantity = watchItem('quantity');
  const watchedItemPrice = watchItem('price');
  const watchedItemExpiryDate = watchItem('expiryDate');

  // Мемоизируем onChange для поставщика
  const handleSupplierChange = useCallback((value: number) => {
    setValue('supplierId', value);
  }, [setValue]);

  // Автоматически устанавливаем единицу измерения при выборе товара
  useEffect(() => {
    if (watchedItemProductId && products?.products) {
      const product = products.products.find(p => p.id === watchedItemProductId);
      if (product) {
        setValueItem('unitId', product.unitId);
      }
    }
  }, [watchedItemProductId, products, setValueItem]);

  const handleAddItem = (data: DocumentItemFormData) => {
    const tempId = editingItem || Date.now().toString();
    const newItem = { ...data, tempId };

    if (editingItem) {
      setItems(prev => prev.map(item => item.tempId === editingItem ? newItem : item));
      setEditingItem(null);
    } else {
      setItems(prev => [...prev, newItem]);
    }

    resetItem();
    setShowItemForm(false);
  };

  const handleEditItem = (tempId: string) => {
    const item = items.find(i => i.tempId === tempId);
    if (item) {
      setValueItem('productId', item.productId);
      setValueItem('quantity', item.quantity);
      setValueItem('unitId', item.unitId);
      setValueItem('price', item.price);
      setValueItem('expiryDate', item.expiryDate);
      setValueItem('batchNumber', item.batchNumber);
      setEditingItem(tempId);
      setShowItemForm(true);
    }
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const handleCloseItemForm = (open: boolean) => {
    setShowItemForm(open);
    if (!open) {
      setEditingItem(null);
      resetItem();
    }
  };

  const handleFormSubmit = (data: DocumentFormData) => {
    if (items.length === 0) {
      alert('Добавьте хотя бы одну позицию в документ');
      return;
    }

    const documentData: CreateDocumentData = {
      type: data.type,
      date: data.date.toISOString(),
      supplierId: data.supplierId,
      warehouseFromId: data.warehouseFromId,
      warehouseToId: data.warehouseToId,
      notes: data.notes,
    };

    const itemsData: AddDocumentItemData[] = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitId: item.unitId,
      price: item.price,
      expiryDate: item.expiryDate?.toISOString(),
      batchNumber: item.batchNumber,
    }));

    onSubmit(documentData, itemsData);
  };

  const getProduct = (productId: number) => products?.products?.find(p => p.id === productId);
  const getUnit = (unitId: number) => units?.find(u => u.id === unitId);
  const getSupplier = (supplierId: number) => suppliers?.data?.find(s => s.id === supplierId);
  const getWarehouse = (warehouseId: number) => warehouses?.find(w => w.id === warehouseId);

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{documentTypeLabels[type]}</h2>
        <Badge variant="outline">{type}</Badge>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Дата */}
              <div className="space-y-2">
                <Label htmlFor="date">Дата документа</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedDate ? format(watchedDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedDate}
                      onSelect={(date) => date && setValue('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Поставщик (только для прихода) */}
              {type === 'RECEIPT' && (
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Поставщик</Label>
                  <SupplierCombobox
                    value={watchedSupplierId}
                    onChange={handleSupplierChange}
                    placeholder="Выберите или создайте поставщика"
                  />
                  {errors.supplierId && (
                    <p className="text-sm text-red-600">{errors.supplierId.message}</p>
                  )}
                </div>
              )}

              {/* Склад отправитель (для перемещения и списания) */}
              {(type === 'TRANSFER' || type === 'WRITEOFF') && (
                <div className="space-y-2">
                  <Label htmlFor="warehouseFromId">Склад отправитель</Label>
                  <Select onValueChange={(value) => setValue('warehouseFromId', parseInt(value))}>
                    <SelectTrigger>
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
                  {errors.warehouseFromId && (
                    <p className="text-sm text-red-600">{errors.warehouseFromId.message}</p>
                  )}
                </div>
              )}

              {/* Склад получатель (для прихода и перемещения) */}
              {(type === 'RECEIPT' || type === 'TRANSFER') && (
                <div className="space-y-2">
                  <Label htmlFor="warehouseToId">Склад получатель</Label>
                  <Select onValueChange={(value) => setValue('warehouseToId', parseInt(value))}>
                    <SelectTrigger>
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
                  {errors.warehouseToId && (
                    <p className="text-sm text-red-600">{errors.warehouseToId.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Примечания */}
            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Textarea
                {...register('notes')}
                placeholder="Дополнительная информация о документе"
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Позиции документа */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Позиции документа</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowItemForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить позицию
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Позиции не добавлены</p>
                <p className="text-sm">Нажмите "Добавить позицию" для добавления товаров</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const product = getProduct(item.productId);
                  const unit = getUnit(item.unitId);
                  return (
                    <div key={item.tempId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{product?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {unit?.shortName} × {item.price.toFixed(2)} ₽ = {(item.quantity * item.price).toFixed(2)} ₽
                        </div>
                        {item.batchNumber && (
                          <div className="text-sm text-muted-foreground">
                            Партия: {item.batchNumber}
                          </div>
                        )}
                        {item.expiryDate && (
                          <div className="text-sm text-muted-foreground">
                            Срок годности: {format(item.expiryDate, "PPP", { locale: ru })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item.tempId)}
                        >
                          Изменить
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-lg font-semibold">
                    Итого: {totalAmount.toFixed(2)} ₽
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопки управления */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading || items.length === 0}>
            {isLoading ? 'Создание...' : 'Создать документ'}
          </Button>
        </div>
      </form>

      {/* Форма добавления позиции в модальном окне */}
      <Dialog open={showItemForm} onOpenChange={handleCloseItemForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Редактировать позицию' : 'Добавить позицию'}</DialogTitle>
            <DialogDescription>
              Укажите товар, количество, цену и другие параметры позиции документа
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitItem(handleAddItem)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Товар */}
              <div className="space-y-2">
                <Label htmlFor="productId">Товар</Label>
                <Select 
                  value={watchedItemProductId?.toString()} 
                  onValueChange={(value) => setValueItem('productId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} {product.article && `(${product.article})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {itemErrors.productId && (
                  <p className="text-sm text-red-600">{itemErrors.productId.message}</p>
                )}
              </div>

              {/* Единица измерения */}
              <div className="space-y-2">
                <Label htmlFor="unitId">Единица измерения</Label>
                <Select 
                  value={watchedItemUnitId?.toString()} 
                  onValueChange={(value) => setValueItem('unitId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите единицу" />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name} ({unit.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {itemErrors.unitId && (
                  <p className="text-sm text-red-600">{itemErrors.unitId.message}</p>
                )}
              </div>

              {/* Количество */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  {...registerItem('quantity', { valueAsNumber: true })}
                  type="number"
                  step="0.0001"
                  placeholder="0"
                />
                {itemErrors.quantity && (
                  <p className="text-sm text-red-600">{itemErrors.quantity.message}</p>
                )}
              </div>

              {/* Цена */}
              <div className="space-y-2">
                <Label htmlFor="price">Цена за единицу</Label>
                <Input
                  {...registerItem('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
                {itemErrors.price && (
                  <p className="text-sm text-red-600">{itemErrors.price.message}</p>
                )}
              </div>

              {/* Номер партии */}
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Номер партии</Label>
                <Input
                  {...registerItem('batchNumber')}
                  placeholder="Необязательно"
                />
              </div>

              {/* Срок годности */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Срок годности</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedItemExpiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedItemExpiryDate ? format(watchedItemExpiryDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedItemExpiryDate}
                      onSelect={(date) => setValueItem('expiryDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Итого по позиции */}
            {watchedItemQuantity && watchedItemPrice && (
              <div className="text-right text-lg font-semibold">
                Сумма: {(watchedItemQuantity * watchedItemPrice).toFixed(2)} ₽
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  resetItem();
                }}
              >
                Отмена
              </Button>
              <Button type="submit">
                {editingItem ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
