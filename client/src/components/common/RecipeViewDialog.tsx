import React from 'react';
import { X, ChefHat, Clock, DollarSign, Scale, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';
import { useRecipe } from '@/hooks/useRecipes';
import { difficultyLabels, type DifficultyLevelType } from '@/types/recipes';
import { formatCurrency, formatTime } from '@/utils/formatters';

interface RecipeViewDialogProps {
  recipeId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (recipeId: number) => void;
}

export const RecipeViewDialog: React.FC<RecipeViewDialogProps> = ({
  recipeId,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { data: recipe, isLoading } = useRecipe(recipeId || 0, isOpen && !!recipeId);

  if (!recipeId) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Просмотр рецепта
            </DialogTitle>
            {onEdit && recipe && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(recipe.id);
                  onClose();
                }}
              >
                Редактировать
              </Button>
            )}
          </div>
          <DialogDescription>
            Подробная информация о рецепте, ингредиентах и финансовых показателях
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : recipe ? (
          <div className="space-y-6 py-4">
            {/* Основная информация */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{recipe.name}</h2>
              {recipe.description && (
                <p className="text-muted-foreground">{recipe.description}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">
                  <Scale className="h-3 w-3 mr-1" />
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
            </div>

            {/* Финансовая информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Финансовые показатели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Себестоимость</p>
                    <p className="text-xl font-bold">
                      {recipe.costPrice ? formatCurrency(parseFloat(recipe.costPrice)) : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Цена продажи</p>
                    <p className="text-xl font-bold text-primary">
                      {recipe.sellingPrice ? formatCurrency(parseFloat(recipe.sellingPrice)) : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Прибыль</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-green-600">
                        {recipe.sellingPrice && recipe.costPrice
                          ? formatCurrency(
                              parseFloat(recipe.sellingPrice) - parseFloat(recipe.costPrice)
                            )
                          : '—'}
                      </p>
                      {recipe.marginPercent && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.marginPercent}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ингредиенты */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ингредиенты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <div className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <div
                          key={ingredient.id}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              {index + 1}.
                            </span>
                            <div>
                              <p className="font-medium">
                                {ingredient.product?.name || 'Неизвестный продукт'}
                                {ingredient.isMain && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Основной
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {ingredient.quantity} {ingredient.unit?.shortName || ''}
                              </p>
                            </div>
                          </div>
                          {ingredient.costPerUnit && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Стоимость</p>
                              <p className="font-medium">
                                {formatCurrency(
                                  parseFloat(ingredient.quantity) *
                                    parseFloat(ingredient.costPerUnit)
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Нет ингредиентов
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Инструкции */}
            {recipe.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Инструкции по приготовлению</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {recipe.instructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Метаинформация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Дополнительная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Создано</p>
                    <p className="font-medium">
                      {new Date(recipe.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Обновлено</p>
                    <p className="font-medium">
                      {new Date(recipe.updatedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {recipe.createdBy && (
                    <div>
                      <p className="text-muted-foreground">Автор</p>
                      <p className="font-medium">{recipe.createdBy.fullName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Статус</p>
                    <Badge variant={recipe.isActive ? 'default' : 'secondary'}>
                      {recipe.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Рецепт не найден</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
