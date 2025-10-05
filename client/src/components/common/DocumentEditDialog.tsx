import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus, Trash2, Package, Save, X } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';

import { useDocument, useUpdateDocument, useAddDocumentItem, useRemoveDocumentItem } from '@/hooks/useDocuments';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { cn } from '@/utils/cn';
import { SupplierCombobox } from '@/components/common/SupplierCombobox';

const documentSchema = z.object({
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

interface DocumentEditDialogProps {
  documentId: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const documentTypeLabels = {
  RECEIPT: 'Приход',
  TRANSFER: 'Перемещение',
  WRITEOFF: 'Списание',
  INVENTORY_ADJUSTMENT: 'Корректировка'
};

export function DocumentEditDialog({ documentId, open, onClose, onSuccess }: DocumentEditDialogProps) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const { data: document, isLoading: isLoadingDocument } = useDocument(documentId || 0);
  const { data: suppliers } = useSuppliers();
  const { data: warehouses } = useWarehouses();
  const { data: products, isLoading: isLoadingProducts } = useProducts({ isActive: true });
  const { data: units, isLoading: isLoadingUnits } = useUnits();

  const updateMutation = useUpdateDocument();
  const addItemMutation = useAddDocumentItem();
  const removeItemMutation = useRemoveDocumentItem();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
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
  const watchedItemExpiryDate = watchItem('expiryDate');

  // Загружаем данные документа в форму
  useEffect(() => {
    if (document && open) {
      reset({
        date: new Date(document.date),
        supplierId: document.supplier?.id,
        warehouseFromId: document.warehouseFrom?.id,
        warehouseToId: document.warehouseTo?.id,
        notes: document.notes || '',
      });
    }
  }, [document, open, reset]);

  // Автоматически устанавливаем единицу измерения при выборе товара
  useEffect(() => {
    if (watchedItemProductId && products) {
      const selectedProduct = products.products?.find(p => p.id === watchedItemProductId);
      if (selectedProduct?.unit) {
        setValueItem('unitId', selectedProduct.unit.id);
      }
    }
  }, [watchedItemProductId, products, setValueItem]);

  const handleSupplierChange = useCallback((value: number) => {
    setValue('supplierId', value);
  }, [setValue]);

  const handleFormSubmit = async (data: DocumentFormData) => {
    if (!documentId) return;

    try {
      await updateMutation.mutateAsync({
        id: documentId,
        data: {
          date: data.date.toISOString(),
          supplierId: data.supplierId,
          warehouseFromId: data.warehouseFromId,
          warehouseToId: data.warehouseToId,
          notes: data.notes,
        },
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении документа:', error);
    }
  };

  const handleAddItem = async (itemData: DocumentItemFormData) => {
    if (!documentId) return;

    console.log('Данные позиции для добавления:', itemData);

    try {
      const dataToSend = {
        productId: itemData.productId,
        quantity: itemData.quantity,
        unitId: itemData.unitId,
        price: itemData.price,
        expiryDate: itemData.expiryDate?.toISOString(),
        batchNumber: itemData.batchNumber,
      };
      
      console.log('Отправка данных на сервер:', dataToSend);
      
      const result = await addItemMutation.mutateAsync({
        documentId,
        data: dataToSend,
      });
      
      console.log('Результат добавления позиции:', result);
      
      resetItem();
      setShowItemForm(false);
    } catch (error) {
      console.error('Ошибка при добавлении позиции:', error);
      console.error('Детали ошибки:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!documentId) return;

    try {
      await removeItemMutation.mutateAsync({
        documentId,
        itemId,
      });
    } catch (error) {
      console.error('Ошибка при удалении позиции:', error);
    }
  };

  if (!open || !documentId) {
    return null;
  }

  const totalAmount = document?.items?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Редактирование документа</span>
              {document && (
                <>
                  <Badge variant="outline">{document.number}</Badge>
                  <Badge variant="outline">{documentTypeLabels[document.type]}</Badge>
                </>
              )}
            </DialogTitle>
          </div>
          <DialogDescription>
            Редактирование информации о документе и его позициях
          </DialogDescription>
        </DialogHeader>

        {isLoadingDocument ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : document ? (
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
                  {document.type === 'RECEIPT' && (
                    <div className="space-y-2">
                      <Label htmlFor="supplierId">Поставщик</Label>
                      <SupplierCombobox
                        value={watchedSupplierId}
                        onChange={handleSupplierChange}
                        suppliers={suppliers?.data || []}
                      />
                      {errors.supplierId && (
                        <p className="text-sm text-red-600">{errors.supplierId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Склад откуда (для перемещения и списания) */}
                  {(document.type === 'TRANSFER' || document.type === 'WRITEOFF') && (
                    <div className="space-y-2">
                      <Label htmlFor="warehouseFromId">Склад (откуда)</Label>
                      <Select
                        value={watch('warehouseFromId')?.toString() || ''}
                        onValueChange={(value) => setValue('warehouseFromId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите склад" />
                        </SelectTrigger>
                        <SelectContent>
                          {(warehouses || []).map((warehouse) => (
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

                  {/* Склад куда */}
                  {(document.type === 'RECEIPT' || document.type === 'TRANSFER' || document.type === 'INVENTORY_ADJUSTMENT') && (
                    <div className="space-y-2">
                      <Label htmlFor="warehouseToId">
                        {document.type === 'TRANSFER' ? 'Склад (куда)' : 'Склад'}
                      </Label>
                      <Select
                        value={watch('warehouseToId')?.toString() || ''}
                        onValueChange={(value) => setValue('warehouseToId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите склад" />
                        </SelectTrigger>
                        <SelectContent>
                          {(warehouses || []).map((warehouse) => (
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

                  {/* Примечание */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Примечание</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Дополнительная информация о документе"
                      className="min-h-20"
                    />
                  </div>
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
              <CardContent className="space-y-4">
                {/* Форма добавления позиции */}
                {showItemForm && (
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">Новая позиция</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Скрытые поля для регистрации в react-hook-form */}
                        <input type="hidden" {...registerItem('productId', { valueAsNumber: true })} />
                        <input type="hidden" {...registerItem('unitId', { valueAsNumber: true })} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Товар */}
                          <div className="space-y-2">
                            <Label>Товар *</Label>
                            <Select
                              value={watchedItemProductId?.toString() || ''}
                              onValueChange={(value) => setValueItem('productId', parseInt(value))}
                              disabled={isLoadingProducts}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingProducts ? "Загрузка товаров..." : "Выберите товар"} />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingProducts ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">Загрузка...</div>
                                ) : (products?.products || []).length === 0 ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">Нет доступных товаров</div>
                                ) : (
                                  (products?.products || []).map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} {product.article && `(${product.article})`}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {itemErrors.productId && (
                              <p className="text-sm text-red-600">{itemErrors.productId.message}</p>
                            )}
                          </div>

                          {/* Количество */}
                          <div className="space-y-2">
                            <Label>Количество *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...registerItem('quantity', { valueAsNumber: true })}
                            />
                            {itemErrors.quantity && (
                              <p className="text-sm text-red-600">{itemErrors.quantity.message}</p>
                            )}
                          </div>

                          {/* Единица измерения */}
                          <div className="space-y-2">
                            <Label>Единица измерения *</Label>
                            <Select
                              value={watchItem('unitId')?.toString() || ''}
                              onValueChange={(value) => setValueItem('unitId', parseInt(value))}
                              disabled={isLoadingUnits}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingUnits ? "Загрузка единиц..." : "Выберите единицу"} />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingUnits ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">Загрузка...</div>
                                ) : (units || []).length === 0 ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">Нет доступных единиц измерения</div>
                                ) : (
                                  (units || []).map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                      {unit.name} ({unit.shortName})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {itemErrors.unitId && (
                              <p className="text-sm text-red-600">{itemErrors.unitId.message}</p>
                            )}
                          </div>

                          {/* Цена */}
                          <div className="space-y-2">
                            <Label>Цена *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...registerItem('price', { valueAsNumber: true })}
                            />
                            {itemErrors.price && (
                              <p className="text-sm text-red-600">{itemErrors.price.message}</p>
                            )}
                          </div>

                          {/* Номер партии */}
                          <div className="space-y-2">
                            <Label>Номер партии</Label>
                            <Input
                              placeholder="Введите номер партии"
                              {...registerItem('batchNumber')}
                            />
                          </div>

                          {/* Срок годности */}
                          <div className="space-y-2">
                            <Label>Срок годности</Label>
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
                                  {watchedItemExpiryDate
                                    ? format(watchedItemExpiryDate, "PPP", { locale: ru })
                                    : "Выберите дату"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={watchedItemExpiryDate}
                                  onSelect={(date) => date && setValueItem('expiryDate', date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowItemForm(false);
                              resetItem();
                            }}
                          >
                            Отмена
                          </Button>
                          <Button 
                            type="button" 
                            disabled={addItemMutation.isPending}
                            onClick={handleSubmitItem(handleAddItem)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {addItemMutation.isPending ? 'Добавление...' : 'Добавить'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Список позиций */}
                {document.items && document.items.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr className="text-left text-sm">
                          <th className="px-4 py-3 font-medium">№</th>
                          <th className="px-4 py-3 font-medium">Товар</th>
                          <th className="px-4 py-3 font-medium text-right">Количество</th>
                          <th className="px-4 py-3 font-medium text-right">Цена</th>
                          <th className="px-4 py-3 font-medium text-right">Сумма</th>
                          <th className="px-4 py-3 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {document.items.map((item, index) => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{item.product?.name}</div>
                              {item.batchNumber && (
                                <div className="text-xs text-muted-foreground">
                                  Партия: {item.batchNumber}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {Number(item.quantity).toFixed(2)} {item.unit?.shortName}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {Number(item.price).toFixed(2)} ₽
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {(Number(item.quantity) * Number(item.price)).toFixed(2)} ₽
                            </td>
                            <td className="px-4 py-3">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Удалить позицию</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Вы уверены, что хотите удалить позицию "{item.product?.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted font-semibold">
                        <tr className="text-sm">
                          <td colSpan={4} className="px-4 py-3 text-right">
                            Итого:
                          </td>
                          <td className="px-4 py-3 text-right">
                            {totalAmount.toFixed(2)} ₽
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Нет позиций в документе</p>
                    <p className="text-sm mt-1">Добавьте первую позицию</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Документ не найден</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
