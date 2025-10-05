import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useWarehouses } from '@/hooks/useWarehouses';
import { useWarehouseStockBalances } from '@/hooks/useWarehouses';
import { useCreateDocument, useAddDocumentItem } from '@/hooks/useDocuments';
import toast from 'react-hot-toast';

interface TransferItem {
  productId: number;
  productName: string;
  unitName: string;
  quantity: number;
  maxQuantity: number;
  price: number;
}

export function CreateTransferPage() {
  const navigate = useNavigate();
  const [warehouseFromId, setWarehouseFromId] = useState<number | null>(null);
  const [warehouseToId, setWarehouseToId] = useState<number | null>(null);
  const [transferDate, setTransferDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const { data: warehouses } = useWarehouses();
  const { data: stockBalancesData, isLoading: isLoadingBalances } = useWarehouseStockBalances(
    warehouseFromId || 0,
    { limit: 100 }
  );

  const createDocument = useCreateDocument();
  const addDocumentItem = useAddDocumentItem();


  // Фильтруем склады для выбора (кроме выбранного склада-источника для получателя)
  const availableWarehousesTo = warehouses?.filter(w => w.id !== warehouseFromId) || [];
  const availableWarehousesFrom = warehouses?.filter(w => w.id !== warehouseToId) || [];

  // Получаем доступные товары для добавления (еще не добавленные)
  const availableProducts = stockBalancesData?.data?.filter(
    (balance: any) => !items.some(item => item.productId === balance.productId) && balance.quantity > 0
  ) || [];

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const product = stockBalancesData?.data?.find(
      (b: any) => b.productId === parseInt(selectedProductId)
    );

    if (!product) return;

    const newItem: TransferItem = {
      productId: product.productId,
      productName: product.product.name,
      unitName: product.product.unit.shortName,
      quantity: 1,
      maxQuantity: parseFloat(product.quantity),
      price: parseFloat(product.avgPrice),
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems(items.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: Math.min(Math.max(0, numValue), item.maxQuantity)
        };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    // Валидация
    if (!warehouseFromId || !warehouseToId) {
      toast.error('Выберите склад отправителя и получателя');
      return;
    }

    if (items.length === 0) {
      toast.error('Добавьте хотя бы один товар');
      return;
    }

    if (items.some(item => item.quantity <= 0)) {
      toast.error('Количество должно быть больше нуля');
      return;
    }

    const toastId = toast.loading('Создание документа перемещения...');
    
    try {
      // Создаем документ перемещения
      const document = await createDocument.mutateAsync({
        type: 'TRANSFER',
        date: transferDate,
        warehouseFromId,
        warehouseToId,
        notes,
      });

      // Добавляем позиции
      for (const item of items) {
        await addDocumentItem.mutateAsync({
          documentId: document.id,
          data: {
            productId: item.productId,
            quantity: item.quantity,
            unitId: stockBalancesData?.data?.find((b: any) => b.productId === item.productId)?.product.unit.id || 0,
            price: item.price,
          },
        });
      }

      toast.success('Документ перемещения создан успешно. Не забудьте провести его!', { id: toastId });
      navigate('/documents');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при создании перемещения', { id: toastId });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const canAddProduct = !!warehouseFromId && !!selectedProductId && availableProducts.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/stock-movements')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-8 w-8" />
            Создание перемещения товаров
          </h1>
          <p className="text-muted-foreground">
            Перемещение товаров между складами
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация о документе */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о перемещении</CardTitle>
              <CardDescription>
                Выберите склады и дату перемещения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Склад отправитель */}
                <div className="space-y-2">
                  <Label htmlFor="warehouseFrom">Склад отправитель *</Label>
                  <Select
                    value={warehouseFromId?.toString() || ''}
                    onValueChange={(value) => {
                      setWarehouseFromId(parseInt(value));
                      setItems([]); // Сбрасываем товары при смене склада
                    }}
                  >
                    <SelectTrigger id="warehouseFrom">
                      <SelectValue placeholder="Выберите склад" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWarehousesFrom.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Склад получатель */}
                <div className="space-y-2">
                  <Label htmlFor="warehouseTo">Склад получатель *</Label>
                  <Select
                    value={warehouseToId?.toString() || ''}
                    onValueChange={(value) => setWarehouseToId(parseInt(value))}
                  >
                    <SelectTrigger id="warehouseTo">
                      <SelectValue placeholder="Выберите склад" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWarehousesTo.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Дата */}
              <div className="space-y-2">
                <Label htmlFor="date">Дата перемещения *</Label>
                <Input
                  id="date"
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                />
              </div>

              {/* Примечание */}
              <div className="space-y-2">
                <Label htmlFor="notes">Примечание</Label>
                <Input
                  id="notes"
                  placeholder="Дополнительная информация"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Добавление товаров */}
          {warehouseFromId && (
            <Card>
              <CardHeader>
                <CardTitle>Товары для перемещения</CardTitle>
                <CardDescription>
                  Добавьте товары, доступные на складе отправителе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Добавление товара */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={selectedProductId}
                      onValueChange={setSelectedProductId}
                      disabled={isLoadingBalances}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingBalances ? "Загрузка..." : "Выберите товар"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingBalances ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Загрузка товаров...
                          </div>
                        ) : availableProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {items.length > 0 ? 'Все доступные товары добавлены' : 'Нет товаров на складе'}
                          </div>
                        ) : (
                          <>
                            {stockBalancesData && stockBalancesData.pagination && stockBalancesData.pagination.total > 100 && (
                              <div className="px-4 py-2 text-xs text-amber-600 bg-amber-50 border-b">
                                ⚠️ Показаны первые 100 из {stockBalancesData.pagination.total} товаров
                              </div>
                            )}
                              {availableProducts.map((balance: any) => (
                                <SelectItem
                                  key={balance.productId}
                                  value={balance.productId.toString()}
                                >
                                  {balance.product.name} (Доступно: {parseFloat(balance.quantity).toFixed(2)} {balance.product.unit.shortName})
                                </SelectItem>
                              ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddProduct}
                    disabled={!canAddProduct || isLoadingBalances}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>

                {/* Предупреждение, если нет товаров */}
                {!warehouseFromId && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Сначала выберите склад отправитель
                    </AlertDescription>
                  </Alert>
                )}

                {/* Список добавленных товаров */}
                {items.length > 0 ? (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <Card key={item.productId} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Доступно: {item.maxQuantity.toFixed(2)} {item.unitName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Цена: {item.price.toFixed(2)} ₽
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={item.maxQuantity}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[40px]">
                              {item.unitName}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm font-medium">
                            Сумма: {(item.quantity * item.price).toFixed(2)} ₽
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Товары не добавлены
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Итоговая информация */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товаров:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Позиций:</span>
                  <span className="font-medium">
                    {items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Общая сумма:</span>
                  <span className="font-semibold text-lg">{totalAmount.toFixed(2)} ₽</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={
                    !warehouseFromId ||
                    !warehouseToId ||
                    items.length === 0 ||
                    createDocument.isPending ||
                    addDocumentItem.isPending
                  }
                >
                  {createDocument.isPending || addDocumentItem.isPending
                    ? 'Создание...'
                    : 'Создать перемещение'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/stock-movements')}
                  disabled={createDocument.isPending || addDocumentItem.isPending}
                >
                  Отмена
                </Button>
              </div>

              {/* Подсказки */}
              <div className="pt-4 border-t space-y-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Можно перемещать только товары, которые есть на складе</li>
                      <li>Количество ограничено остатками</li>
                      <li>После создания документ можно будет провести</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
