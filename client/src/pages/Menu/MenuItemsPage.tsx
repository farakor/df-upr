import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UtensilsCrossed, Filter, Eye, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/spinner';
import { useMenuItems, MenuItemCreateData, MenuItemUpdateData } from '../../hooks/useMenuItems';
import { useMenuCategories } from '../../hooks/useMenuCategories';
import { useRecipes } from '../../hooks/useRecipes';

const MenuItemsPage: React.FC = () => {
  const {
    items,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  } = useMenuItems();

  const { categories, fetchCategories } = useMenuCategories();
  const { data: recipes, isLoading: recipesLoading } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<MenuItemCreateData>({
    name: '',
    description: '',
    recipeId: undefined,
    categoryId: undefined,
    price: 0,
    costPrice: undefined,
    imageUrl: '',
    sortOrder: 0,
  });

  useEffect(() => {
    fetchItems({
      search: searchQuery,
      categoryId: categoryFilter || undefined,
      page: currentPage,
      limit: 20,
    });
  }, [searchQuery, categoryFilter, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value === 'all' ? '' : parseInt(value));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        recipeId: item.recipeId || undefined,
        categoryId: item.categoryId || undefined,
        price: item.price,
        costPrice: item.costPrice || undefined,
        imageUrl: item.imageUrl || '',
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        recipeId: undefined,
        categoryId: undefined,
        price: 0,
        costPrice: undefined,
        imageUrl: '',
        sortOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      recipeId: undefined,
      categoryId: undefined,
      price: 0,
      costPrice: undefined,
      imageUrl: '',
      sortOrder: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) {
      return;
    }

    let success = false;
    if (editingItem) {
      const result = await updateItem(editingItem.id, formData as MenuItemUpdateData);
      success = result !== null;
    } else {
      const result = await createItem(formData);
      success = result !== null;
    }

    if (success) {
      handleCloseDialog();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteItem(id);
  };

  const handleInputChange = (field: keyof MenuItemCreateData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: ['price', 'costPrice', 'sortOrder'].includes(field)
        ? parseFloat(e.target.value) || 0
        : e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof MenuItemCreateData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (value === 'no-category' || value === 'no-recipe') ? undefined : parseInt(value),
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Позиции меню</h1>
          <p className="text-muted-foreground">
            Управление позициями меню и их настройками
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить позицию
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Редактировать позицию меню' : 'Создать позицию меню'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Название *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Введите название позиции"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">
                    Категория
                  </label>
                  <Select
                    value={formData.categoryId?.toString() || 'no-category'}
                    onValueChange={handleSelectChange('categoryId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-category">Без категории</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Введите описание позиции"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="recipeId" className="text-sm font-medium">
                    Рецепт
                  </label>
                  <Select
                    value={formData.recipeId?.toString() || 'no-recipe'}
                    onValueChange={handleSelectChange('recipeId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите рецепт" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-recipe">Без рецепта</SelectItem>
                      {recipes?.recipes?.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id.toString()}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">
                    URL изображения
                  </label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange('imageUrl')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Цена *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="costPrice" className="text-sm font-medium">
                    Себестоимость
                  </label>
                  <Input
                    id="costPrice"
                    type="number"
                    value={formData.costPrice || ''}
                    onChange={handleInputChange('costPrice')}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sortOrder" className="text-sm font-medium">
                    Порядок
                  </label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={handleInputChange('sortOrder')}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Отмена
                </Button>
                <Button type="submit" disabled={!formData.name.trim() || formData.price <= 0 || loading}>
                  {editingItem ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск позиций меню..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter?.toString() || 'all'} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список позиций */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить позицию меню?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Позиция будет удалена навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{item.name}</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.price)}
                </span>
              </CardTitle>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                {item.category ? (
                  <Badge variant="outline">
                    {item.category.name}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Без категории</Badge>
                )}
                {item.recipe && (
                  <Badge variant="outline" className="flex items-center">
                    <ChefHat className="mr-1 h-3 w-3" />
                    Рецепт
                  </Badge>
                )}
              </div>
              
              {item.costPrice && (
                <div className="text-sm text-muted-foreground">
                  Себестоимость: {formatPrice(item.costPrice)}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                  <Badge variant={item.isAvailable ? "default" : "destructive"}>
                    {item.isAvailable ? 'Доступна' : 'Недоступна'}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  #{item.sortOrder}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Предыдущая
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Следующая
          </Button>
        </div>
      )}

      {/* Пустое состояние */}
      {items.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Позиции меню не найдены</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || categoryFilter
                ? 'По вашим фильтрам позиции не найдены. Попробуйте изменить параметры поиска.'
                : 'У вас пока нет позиций меню. Создайте первую позицию для вашего меню.'}
            </p>
            {!searchQuery && !categoryFilter && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Создать позицию
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenuItemsPage;