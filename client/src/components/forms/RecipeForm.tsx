import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Calculator, ChefHat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/textarea';

import { useProducts } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { useCalculateRecipeCost, useRecipe } from '@/hooks/useRecipes';
import type { CreateRecipeData, RecipeIngredientInput, Recipe } from '@/types/recipes';
import { difficultyLabels } from '@/types/recipes';
import { formatCurrency } from '@/utils/formatters';

// Схема валидации для ингредиента
const ingredientSchema = z.object({
  productId: z.number().min(1, 'Выберите продукт'),
  quantity: z.number().min(0.001, 'Количество должно быть больше 0'),
  unitId: z.number().min(1, 'Выберите единицу измерения'),
  costPerUnit: z.number().optional(),
  isMain: z.boolean().default(false),
});

// Схема валидации для рецепта
const recipeSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название слишком длинное'),
  description: z.string().max(1000, 'Описание слишком длинное').optional(),
  portionSize: z.number().min(0.1, 'Размер порции должен быть больше 0'),
  cookingTime: z.number().min(1, 'Время приготовления должно быть больше 0').max(1440, 'Время не может превышать 24 часа').optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  instructions: z.string().max(5000, 'Инструкции слишком длинные').optional(),
  marginPercent: z.number().min(0, 'Наценка не может быть отрицательной').max(1000, 'Наценка слишком большая').optional(),
  ingredients: z.array(ingredientSchema).min(1, 'Добавьте хотя бы один ингредиент'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecipeData) => void;
  isLoading?: boolean;
  recipeId?: number; // Для редактирования
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  recipeId,
}) => {
  const [costCalculation, setCostCalculation] = useState<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: products } = useProducts();
  const { data: units } = useUnits();
  const { data: recipe } = useRecipe(recipeId || 0, !!recipeId && isOpen);
  const calculateCostMutation = useCalculateRecipeCost();

  const isEditMode = !!recipeId;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: '',
      portionSize: 1,
      cookingTime: undefined,
      difficultyLevel: undefined,
      instructions: '',
      marginPercent: 0,
      ingredients: [],
    },
  });

  // Заполняем форму при редактировании
  useEffect(() => {
    if (recipe && isEditMode) {
      reset({
        name: recipe.name,
        description: recipe.description || '',
        portionSize: parseFloat(recipe.portionSize),
        cookingTime: recipe.cookingTime || undefined,
        difficultyLevel: recipe.difficultyLevel || undefined,
        instructions: recipe.instructions || '',
        marginPercent: recipe.marginPercent ? parseFloat(recipe.marginPercent) : 0,
        ingredients: recipe.ingredients?.map(ing => ({
          productId: ing.productId,
          quantity: parseFloat(ing.quantity),
          unitId: ing.unitId,
          costPerUnit: ing.costPerUnit ? parseFloat(ing.costPerUnit) : undefined,
          isMain: ing.isMain,
        })) || [],
      });
    }
  }, [recipe, isEditMode, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const watchedIngredients = watch('ingredients');
  const watchedMarginPercent = watch('marginPercent');

  // Автоматический расчет стоимости при изменении ингредиентов (с debounce)
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (watchedIngredients && watchedIngredients.length > 0) {
      const validIngredients = watchedIngredients.filter(
        (ing) => ing.productId && ing.quantity > 0 && ing.unitId
      );
      
      if (validIngredients.length > 0) {
        // Устанавливаем новый таймер с задержкой 800мс
        debounceTimerRef.current = setTimeout(() => {
          calculateCostMutation.mutate(validIngredients, {
            onSuccess: (data) => {
              setCostCalculation(data);
            },
          });
        }, 800);
      }
    }

    // Очищаем таймер при размонтировании
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watchedIngredients]);

  // Расчет цены продажи при изменении наценки
  const sellingPrice = costCalculation && watchedMarginPercent 
    ? costCalculation.costPerPortion * (1 + watchedMarginPercent / 100)
    : null;

  const handleFormSubmit = (data: RecipeFormData) => {
    onSubmit(data);
  };

  const handleAddIngredient = () => {
    append({
      productId: 0,
      quantity: 0,
      unitId: 0,
      costPerUnit: undefined,
      isMain: false,
    });
  };

  const handleClose = () => {
    reset({
      name: '',
      description: '',
      portionSize: 1,
      cookingTime: undefined,
      difficultyLevel: undefined,
      instructions: '',
      marginPercent: 0,
      ingredients: [],
    });
    setCostCalculation(null);
    onClose();
  };

  const getProductUnit = (productId: number) => {
    const product = products?.products.find(p => p.id === productId);
    return product?.unit;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {isEditMode ? 'Редактировать рецепт' : 'Создать новый рецепт'}
          </DialogTitle>
          <DialogDescription>
            Укажите название, ингредиенты и параметры приготовления для рецепта
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Название рецепта *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Введите название рецепта"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="portionSize">Размер порции *</Label>
                  <Input
                    id="portionSize"
                    type="number"
                    step="0.1"
                    {...register('portionSize', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.portionSize && (
                    <p className="text-sm text-destructive mt-1">{errors.portionSize.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cookingTime">Время приготовления (мин)</Label>
                  <Input
                    id="cookingTime"
                    type="number"
                    {...register('cookingTime', { valueAsNumber: true })}
                    placeholder="30"
                  />
                  {errors.cookingTime && (
                    <p className="text-sm text-destructive mt-1">{errors.cookingTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="difficultyLevel">Уровень сложности</Label>
                  <Select
                    value={watch('difficultyLevel')?.toString() || ''}
                    onValueChange={(value) => setValue('difficultyLevel', value ? Number(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(difficultyLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficultyLevel && (
                    <p className="text-sm text-destructive mt-1">{errors.difficultyLevel.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="marginPercent">Наценка (%)</Label>
                  <Input
                    id="marginPercent"
                    type="number"
                    step="0.1"
                    {...register('marginPercent', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.marginPercent && (
                    <p className="text-sm text-destructive mt-1">{errors.marginPercent.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Краткое описание рецепта"
                    className="min-h-[80px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="instructions">Инструкции по приготовлению</Label>
                  <Textarea
                    id="instructions"
                    {...register('instructions')}
                    placeholder="Подробные инструкции по приготовлению"
                    className="min-h-[120px]"
                  />
                  {errors.instructions && (
                    <p className="text-sm text-destructive mt-1">{errors.instructions.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ингредиенты */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Ингредиенты</CardTitle>
                <Button type="button" onClick={handleAddIngredient} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить ингредиент
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Добавьте ингредиенты для рецепта</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Продукт *</Label>
                      <Select
                        value={watch(`ingredients.${index}.productId`)?.toString() || ''}
                        onValueChange={(value) => {
                          const productId = Number(value);
                          setValue(`ingredients.${index}.productId`, productId);
                          // Автоматически устанавливаем единицу измерения продукта
                          const product = products?.products.find(p => p.id === productId);
                          if (product) {
                            setValue(`ingredients.${index}.unitId`, product.unitId);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите продукт" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Количество *</Label>
                      <Input
                        type="number"
                        step="0.001"
                        {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label>Единица</Label>
                      <Select
                        value={watch(`ingredients.${index}.unitId`)?.toString() || ''}
                        onValueChange={(value) => setValue(`ingredients.${index}.unitId`, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Единица" />
                        </SelectTrigger>
                        <SelectContent>
                          {units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.name} ({unit.shortName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Стоимость за ед.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`ingredients.${index}.costPerUnit`, { valueAsNumber: true })}
                        placeholder="Авто"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {errors.ingredients && (
                <p className="text-sm text-destructive">{errors.ingredients.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Калькуляция стоимости */}
          {costCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Калькуляция стоимости
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Себестоимость</p>
                    <p className="text-2xl font-bold">{formatCurrency(costCalculation.costPerPortion)}</p>
                  </div>
                  {sellingPrice && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Цена продажи</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(sellingPrice)}</p>
                    </div>
                  )}
                  {sellingPrice && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Прибыль</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(sellingPrice - costCalculation.costPerPortion)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (isEditMode ? 'Сохранение...' : 'Создание...') 
                : (isEditMode ? 'Сохранить' : 'Создать рецепт')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

