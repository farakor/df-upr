import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, ChefHat, Clock, DollarSign, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';

import { useRecipes, useDeleteRecipe, useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import type { RecipeFilters, CreateRecipeData } from '@/types/recipes';
import { difficultyLabels, DifficultyLevel, type DifficultyLevelType } from '@/types/recipes';
import { formatCurrency, formatTime } from '@/utils/formatters';
import { RecipeForm } from '@/components/forms/RecipeForm';
import { RecipeViewDialog } from '@/components/common/RecipeViewDialog';

const RecipesListPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [filters, setFilters] = useState<RecipeFilters>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    // isActive не установлен - показываем все рецепты по умолчанию
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const { data: recipesData, isLoading, error } = useRecipes(filters);
  const deleteRecipeMutation = useDeleteRecipe();
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();

  const canManageRecipes = useMemo(() => {
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }, [user]);

  const handleFilterChange = (newFilters: Partial<RecipeFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Сбрасываем на первую страницу при изменении фильтров
    }));
  };

  const handleDeleteClick = (recipeId: number) => {
    setRecipeToDelete(recipeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (recipeToDelete) {
      await deleteRecipeMutation.mutateAsync(recipeToDelete);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const handleCreateRecipe = async (data: CreateRecipeData) => {
    await createRecipeMutation.mutateAsync(data);
    setCreateFormOpen(false);
  };

  const handleUpdateRecipe = async (data: CreateRecipeData) => {
    if (selectedRecipeId) {
      await updateRecipeMutation.mutateAsync({ id: selectedRecipeId, data });
      setEditFormOpen(false);
      setSelectedRecipeId(null);
    }
  };

  const handleViewRecipe = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setViewDialogOpen(true);
  };

  const handleEditRecipe = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setEditFormOpen(true);
  };

  const getDifficultyColor = (level?: number) => {
    if (!level) return 'secondary';
    switch (level) {
      case 1:
      case 2:
        return 'default';
      case 3:
        return 'secondary';
      case 4:
      case 5:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Загрузка рецептов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Ошибка загрузки рецептов. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Рецептуры</h1>
          <p className="text-muted-foreground">
            Управление рецептами и калькуляция себестоимости
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {/* TODO: Открыть анализ рентабельности */}}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Анализ рентабельности
          </Button>
          {canManageRecipes && (
            <Button onClick={() => setCreateFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать рецепт
            </Button>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск рецептов..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={filters.difficultyLevel?.toString() || 'all'}
                onValueChange={(value) => handleFilterChange({ 
                  difficultyLevel: value === 'all' ? undefined : Number(value) 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Сложность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="number"
                placeholder="Макс. время (мин)"
                value={filters.cookingTimeMax || ''}
                onChange={(e) => handleFilterChange({ 
                  cookingTimeMax: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
            <div>
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => handleFilterChange({ 
                  isActive: value === 'all' ? undefined : value === 'active'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все рецепты</SelectItem>
                  <SelectItem value="active">Только активные</SelectItem>
                  <SelectItem value="inactive">Только неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список рецептов */}
      {recipesData?.recipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Рецепты не найдены</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.difficultyLevel || filters.cookingTimeMax
              ? 'Попробуйте изменить параметры поиска'
              : 'Создайте свой первый рецепт'}
          </p>
          {canManageRecipes && (
            <Button onClick={() => setCreateFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать рецепт
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipesData?.recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{recipe.name}</CardTitle>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === recipe.id ? null : recipe.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === recipe.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-48 bg-popover border rounded-md shadow-md py-1">
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleViewRecipe(recipe.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотреть
                          </button>
                          {canManageRecipes && (
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleEditRecipe(recipe.id);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </button>
                          )}
                          {user?.role === 'ADMIN' && (
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center text-destructive"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDeleteClick(recipe.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <ChefHat className="h-3 w-3 mr-1" />
                    {recipe.portionSize} порц.
                  </Badge>
                  {recipe.cookingTime && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(recipe.cookingTime)}
                    </Badge>
                  )}
                  {recipe.difficultyLevel && (
                    <Badge variant={getDifficultyColor(recipe.difficultyLevel) as any}>
                      {difficultyLabels[recipe.difficultyLevel as DifficultyLevelType]}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {recipe.costPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Себестоимость:</span>
                      <span>{formatCurrency(parseFloat(recipe.costPrice))}</span>
                    </div>
                  )}
                  {recipe.sellingPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Цена продажи:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(recipe.sellingPrice))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Наценка:</span>
                    <Badge variant="secondary">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {recipe.marginPercent}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ингредиентов:</span>
                    <span>{recipe.ingredients?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {recipesData && recipesData.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange({ page: Math.max(1, filters.page! - 1) })}
              disabled={filters.page === 1}
            >
              Предыдущая
            </Button>
            <div className="flex items-center px-4 py-2 text-sm">
              Страница {recipesData.page} из {recipesData.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => handleFilterChange({ page: Math.min(recipesData.totalPages, filters.page! + 1) })}
              disabled={filters.page === recipesData.totalPages}
            >
              Следующая
            </Button>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteRecipeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecipeMutation.isPending ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Форма создания рецепта */}
      <RecipeForm
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreateRecipe}
        isLoading={createRecipeMutation.isPending}
      />

      {/* Форма редактирования рецепта */}
      <RecipeForm
        isOpen={editFormOpen}
        onClose={() => {
          setEditFormOpen(false);
          setSelectedRecipeId(null);
        }}
        onSubmit={handleUpdateRecipe}
        isLoading={updateRecipeMutation.isPending}
        recipeId={selectedRecipeId || undefined}
      />

      {/* Диалог просмотра рецепта */}
      <RecipeViewDialog
        recipeId={selectedRecipeId}
        isOpen={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedRecipeId(null);
        }}
        onEdit={canManageRecipes ? handleEditRecipe : undefined}
      />
    </div>
  );
};

export default RecipesListPage;