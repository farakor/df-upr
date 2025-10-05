import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, UtensilsCrossed, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/spinner';
import { useMenu } from '@/hooks/useMenu';
import { menuApi, type Menu, type MenuItem, type MenuCategory } from '@/services/api/menu';
import { useProducts } from '@/hooks/useProducts';

const MenuEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMenuById, updateMenu } = useMenu();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const products = productsData?.products || [];

  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Диалоги
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Формы
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 0,
  });

  const [itemForm, setItemForm] = useState({
    productId: 0,
    categoryId: 0,
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    marginPercent: 0,
    imageUrl: '',
    sortOrder: 0,
  });

  useEffect(() => {
    loadMenuData();
  }, [id]);

  const loadMenuData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Загружаем меню
      const menuData = await getMenuById(parseInt(id));
      if (menuData) {
        setMenu(menuData);
      }

      // Загружаем категории
      const categoriesResponse = await menuApi.getMenuCategories({ isActive: true, limit: 100 });
      if (categoriesResponse.success && categoriesResponse.data.categories) {
        setCategories(categoriesResponse.data.categories);
      }

      // Загружаем позиции меню для этого меню
      const itemsResponse = await menuApi.getMenuItems({ menuId: parseInt(id), limit: 100 });
      if (itemsResponse.success && itemsResponse.data.items) {
        setMenuItems(itemsResponse.data.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Категории
  const handleOpenCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        sortOrder: categories.length,
      });
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await menuApi.updateMenuCategory(editingCategory.id, categoryForm);
      } else {
        await menuApi.createMenuCategory(categoryForm);
      }
      await loadMenuData();
      setCategoryDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения категории');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Удалить категорию? Позиции меню останутся без категории.')) return;
    
    try {
      await menuApi.deleteMenuCategory(categoryId);
      await loadMenuData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления категории');
    }
  };

  // Позиции меню
  const handleOpenItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      // Рассчитываем наценку в процентах из текущих цен
      const marginPercent = item.costPrice && item.costPrice > 0 
        ? Math.round(((item.price - item.costPrice) / item.costPrice) * 100)
        : 0;
      
      setItemForm({
        productId: item.productId || 0,
        categoryId: item.categoryId || 0,
        name: item.name,
        description: item.description || '',
        price: item.price,
        costPrice: item.costPrice || 0,
        marginPercent: marginPercent,
        imageUrl: item.imageUrl || '',
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        productId: 0,
        categoryId: 0,
        name: '',
        description: '',
        price: 0,
        costPrice: 0,
        marginPercent: 0,
        imageUrl: '',
        sortOrder: menuItems.length,
      });
    }
    setItemDialogOpen(true);
  };

  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItemForm(prev => {
        // Получаем себестоимость из рецептуры, если она есть
        const costPrice = product.recipe?.costPrice 
          ? parseFloat(product.recipe.costPrice) 
          : 0;
        
        return {
          ...prev,
          productId,
          name: product.name,
          description: product.description || '',
          costPrice: costPrice,
          // Цену пользователь вводит сам
        };
      });
    }
  };

  // Обработчик изменения наценки - пересчитываем цену
  const handleMarginChange = (marginPercent: number) => {
    setItemForm(prev => {
      const newPrice = prev.costPrice > 0 
        ? Math.round(prev.costPrice * (1 + marginPercent / 100) * 100) / 100
        : prev.price;
      
      return {
        ...prev,
        marginPercent,
        price: newPrice,
      };
    });
  };

  // Обработчик изменения себестоимости - пересчитываем цену по текущей наценке
  const handleCostPriceChange = (costPrice: number) => {
    setItemForm(prev => {
      const newPrice = costPrice > 0 && prev.marginPercent > 0
        ? Math.round(costPrice * (1 + prev.marginPercent / 100) * 100) / 100
        : prev.price;
      
      return {
        ...prev,
        costPrice,
        price: newPrice,
      };
    });
  };

  // Обработчик изменения цены - пересчитываем наценку
  const handlePriceChange = (price: number) => {
    setItemForm(prev => {
      const marginPercent = prev.costPrice > 0
        ? Math.round(((price - prev.costPrice) / prev.costPrice) * 100)
        : prev.marginPercent;
      
      return {
        ...prev,
        price,
        marginPercent,
      };
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      // Убираем marginPercent, так как это поле только для клиента
      const { marginPercent, ...itemFormData } = itemForm;
      
      const itemData = {
        ...itemFormData,
        menuId: parseInt(id),
        categoryId: itemFormData.categoryId || undefined,
      };

      if (editingItem) {
        await menuApi.updateMenuItem(editingItem.id, itemData);
      } else {
        await menuApi.createMenuItem(itemData);
      }
      await loadMenuData();
      setItemDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения позиции');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Удалить позицию меню?')) return;
    
    try {
      await menuApi.deleteMenuItem(itemId);
      await loadMenuData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции');
    }
  };

  // Группировка позиций по категориям
  const getItemsByCategory = (categoryId: number | null) => {
    return menuItems
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const uncategorizedItems = getItemsByCategory(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Меню не найдено</p>
        <Button onClick={() => navigate('/menu')} className="mt-4">
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/menu')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{menu.name}</h1>
            <p className="text-sm text-gray-500">{menu.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenCategoryDialog()}>
            <Tag className="w-4 h-4 mr-2" />
            Добавить категорию
          </Button>
          <Button onClick={() => handleOpenItemDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить блюдо
          </Button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Категории и позиции */}
      <div className="space-y-6">
        {categories.filter(cat => cat.isActive).map((category) => {
          const categoryItems = getItemsByCategory(category.id);
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{category.name}</CardTitle>
                    <Badge variant="outline">{categoryItems.length} позиций</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCategoryDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant={item.isAvailable ? 'success' : 'secondary'}>
                            {item.isAvailable ? 'Доступно' : 'Недоступно'}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Цена: {item.price} ₽</span>
                          {item.costPrice && <span>Себестоимость: {item.costPrice} ₽</span>}
                          {item.product && <span>Продукт: {item.product.name}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenItemDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Позиции без категории */}
        {uncategorizedItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Без категории</CardTitle>
                  <Badge variant="outline">{uncategorizedItems.length} позиций</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {uncategorizedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant={item.isAvailable ? 'success' : 'secondary'}>
                          {item.isAvailable ? 'Доступно' : 'Недоступно'}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Цена: {item.price} ₽</span>
                        {item.costPrice && <span>Себестоимость: {item.costPrice} ₽</span>}
                        {item.product && <span>Продукт: {item.product.name}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenItemDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Пустое состояние */}
        {menuItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">В меню пока нет позиций</p>
              <Button onClick={() => handleOpenItemDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первое блюдо
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог категории */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
            </DialogTitle>
            <DialogDescription>
              Введите название и сортировку для категории меню
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Название *</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cat-description">Описание</Label>
              <Textarea
                id="cat-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cat-sortOrder">Порядок сортировки</Label>
              <Input
                id="cat-sortOrder"
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог позиции меню */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Редактировать позицию' : 'Добавить позицию'}
            </DialogTitle>
            <DialogDescription>
              Укажите название, описание, цену и категорию для позиции меню
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div>
              <Label htmlFor="item-product">Блюдо (продукт) *</Label>
              <Select
                value={itemForm.productId.toString()}
                onValueChange={(value) => handleProductChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите блюдо" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.isActive).map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.unit.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-category">Категория</Label>
              <Select
                value={itemForm.categoryId.toString()}
                onValueChange={(value) => setItemForm({ ...itemForm, categoryId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Без категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Без категории</SelectItem>
                  {categories.filter(c => c.isActive).map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-name">Название *</Label>
              <Input
                id="item-name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="item-description">Описание</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Ценообразование</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="item-costPrice">Себестоимость</Label>
                    <Input
                      id="item-costPrice"
                      type="number"
                      step="0.01"
                      value={itemForm.costPrice || ''}
                      onChange={(e) => handleCostPriceChange(parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Из рецептуры</p>
                  </div>

                  <div>
                    <Label htmlFor="item-margin">Наценка %</Label>
                    <Input
                      id="item-margin"
                      type="number"
                      step="1"
                      value={itemForm.marginPercent || ''}
                      onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Процент надбавки</p>
                  </div>

                  <div>
                    <Label htmlFor="item-price">Цена продажи *</Label>
                    <Input
                      id="item-price"
                      type="number"
                      step="0.01"
                      value={itemForm.price || ''}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Итоговая цена</p>
                  </div>
                </div>
                
                {itemForm.costPrice > 0 && itemForm.price > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Прибыль:</span> {(itemForm.price - itemForm.costPrice).toFixed(2)} ₽
                    {itemForm.marginPercent > 0 && (
                      <span className="ml-2">({itemForm.marginPercent}%)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="item-imageUrl">URL изображения</Label>
              <Input
                id="item-imageUrl"
                value={itemForm.imageUrl}
                onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="item-sortOrder">Порядок сортировки</Label>
              <Input
                id="item-sortOrder"
                type="number"
                value={itemForm.sortOrder}
                onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuEditPage;
