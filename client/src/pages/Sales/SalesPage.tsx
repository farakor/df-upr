import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/Badge';
import { Separator } from '../../components/ui/Separator';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { useAvailableMenu, useCreateSale } from '../../hooks/useSales';
import { useWarehouses } from '../../hooks/useWarehouses';
import { MenuItem, SaleItem } from '../../services/api/sales';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CartItem extends SaleItem {
  menuItem: MenuItem;
  total: number;
}

export const SalesPage: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'MIXED'>('CASH');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { data: warehouses } = useWarehouses();
  const { data: menuCategories, isLoading: isMenuLoading } = useAvailableMenu(selectedWarehouse || 0);
  const createSaleMutation = useCreateSale();

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      updateCartItemQuantity(menuItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        menuItemId: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        discountPercent: 0,
        menuItem,
        total: menuItem.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCart(cart.map(item => {
      if (item.menuItemId === menuItemId) {
        const price = item.price || 0;
        const discountPercent = item.discountPercent || 0;
        const discountAmount = (price * quantity * discountPercent) / 100;
        const total = (price * quantity) - discountAmount;
        return { ...item, quantity, total };
      }
      return item;
    }));
  };

  const updateCartItemDiscount = (menuItemId: number, discountPercent: number) => {
    setCart(cart.map(item => {
      if (item.menuItemId === menuItemId) {
        const price = item.price || 0;
        const discountAmount = (price * item.quantity * discountPercent) / 100;
        const total = (price * item.quantity) - discountAmount;
        return { ...item, discountPercent, total };
      }
      return item;
    }));
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setDiscountAmount(0);
    setNotes('');
  };

  const getTotalAmount = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    return Math.max(0, subtotal - discountAmount);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = async () => {
    if (!selectedWarehouse) {
      toast.error('Выберите склад');
      return;
    }

    if (cart.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        warehouseId: selectedWarehouse,
        customerName: customerName || undefined,
        paymentMethod,
        discountAmount,
        notes: notes || undefined,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          discountPercent: item.discountPercent
        }))
      });

      clearCart();
      setIsCheckoutOpen(false);
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  };

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
        <h1 className="text-3xl font-bold">Касса</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="warehouse">Склад:</Label>
            <Select
              value={selectedWarehouse?.toString() || ''}
              onValueChange={(value) => setSelectedWarehouse(parseInt(value))}
            >
              <SelectTrigger className="w-48">
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Меню */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Меню</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedWarehouse ? (
                <div className="text-center py-8 text-muted-foreground">
                  Выберите склад для отображения меню
                </div>
              ) : isMenuLoading ? (
                <div className="text-center py-8">Загрузка меню...</div>
              ) : !menuCategories || menuCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Меню недоступно для выбранного склада
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {menuCategories.map((category: any) => (
                      <div key={category.id || 'no-category'}>
                        <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {category.items.map((item: any) => (
                            <Card
                              key={item.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                !item.isAvailable ? 'opacity-50' : ''
                              }`}
                              onClick={() => item.isAvailable && addToCart(item)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">
                                      {item.price.toFixed(2)} ₽
                                    </div>
                                    {item.availabilityInfo && (
                                      <Badge
                                        variant={item.availabilityInfo.maxPortions > 0 ? 'default' : 'destructive'}
                                        className="text-xs"
                                      >
                                        {item.availabilityInfo.maxPortions > 0
                                          ? `${item.availabilityInfo.maxPortions} порций`
                                          : 'Нет в наличии'
                                        }
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex justify-between items-center">
                                  <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                                    {item.isAvailable ? 'Доступно' : 'Недоступно'}
                                  </Badge>
                                  {item.isAvailable && (
                                    <Button size="sm" variant="outline">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Корзина */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Корзина ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Корзина пуста
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px] mb-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.menuItemId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-sm">
                              {(item.price || 0).toFixed(2)} ₽
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Скидка %:</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discountPercent}
                                onChange={(e) => updateCartItemDiscount(
                                  item.menuItemId,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-16 h-6 text-xs"
                              />
                            </div>
                            <div className="font-bold">
                              {item.total.toFixed(2)} ₽
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Подытог:</span>
                      <span>{getSubtotal().toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Общая скидка:</span>
                      <span>-{discountAmount.toFixed(2)} ₽</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Итого:</span>
                      <span>{getTotalAmount().toFixed(2)} ₽</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full"
                    >
                      Очистить корзину
                    </Button>

                    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={cart.length === 0}>
                          <Receipt className="h-4 w-4 mr-2" />
                          Оформить заказ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Оформление заказа</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="customer">Имя клиента (необязательно)</Label>
                            <Input
                              id="customer"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Введите имя клиента"
                            />
                          </div>

                          <div>
                            <Label htmlFor="payment">Способ оплаты</Label>
                            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">
                                  <div className="flex items-center gap-2">
                                    <Banknote className="h-4 w-4" />
                                    Наличные
                                  </div>
                                </SelectItem>
                                <SelectItem value="CARD">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Карта
                                  </div>
                                </SelectItem>
                                <SelectItem value="TRANSFER">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Перевод
                                  </div>
                                </SelectItem>
                                <SelectItem value="MIXED">Смешанная оплата</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="discount">Общая скидка (₽)</Label>
                            <Input
                              id="discount"
                              type="number"
                              min="0"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="notes">Примечания</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Дополнительные примечания"
                              rows={3}
                            />
                          </div>

                          <div className="border rounded-lg p-3 bg-muted">
                            <div className="flex justify-between font-bold text-lg">
                              <span>К оплате:</span>
                              <span>{getTotalAmount().toFixed(2)} ₽</span>
                            </div>
                          </div>

                          <Button
                            onClick={handleCheckout}
                            className="w-full"
                            disabled={createSaleMutation.isPending}
                          >
                            {createSaleMutation.isPending ? 'Обработка...' : 'Подтвердить заказ'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
