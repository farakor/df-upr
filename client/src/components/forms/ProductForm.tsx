import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useRecipes } from '@/hooks/useRecipes';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import type { Product, CreateProductData, UpdateProductData } from '@/types/nomenclature';

// Вспомогательная функция для преобразования NaN в undefined
const nanToUndefined = (val: any) => (typeof val === 'number' && isNaN(val) ? undefined : val);

// Схема валидации
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название не может превышать 255 символов'),
  article: z.string().max(50, 'Артикул не может превышать 50 символов').optional(),
  barcode: z.string().max(50, 'Штрихкод не может превышать 50 символов').optional(),
  categoryId: z.preprocess(nanToUndefined, z.number().optional()),
  unitId: z.number().min(1, 'Единица измерения обязательна'),
  isDish: z.boolean().default(false),
  recipeId: z.preprocess(nanToUndefined, z.number().optional()),
  shelfLifeDays: z.preprocess(nanToUndefined, z.number().min(0, 'Срок годности не может быть отрицательным').optional()),
  storageTemperatureMin: z.preprocess(nanToUndefined, z.number().min(-100, 'Минимальная температура не может быть меньше -100°C').max(100, 'Минимальная температура не может быть больше 100°C').optional()),
  storageTemperatureMax: z.preprocess(nanToUndefined, z.number().min(-100, 'Максимальная температура не может быть меньше -100°C').max(100, 'Максимальная температура не может быть больше 100°C').optional()),
  storageConditions: z.string().max(500, 'Условия хранения не могут превышать 500 символов').optional(),
  description: z.string().max(1000, 'Описание не может превышать 1000 символов').optional(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.storageTemperatureMin !== undefined && data.storageTemperatureMax !== undefined) {
    return data.storageTemperatureMax > data.storageTemperatureMin;
  }
  return true;
}, {
  message: 'Максимальная температура должна быть больше минимальной',
  path: ['storageTemperatureMax'],
}).refine((data) => {
  // Если это блюдо, то рецептура обязательна
  if (data.isDish && !data.recipeId) {
    return false;
  }
  return true;
}, {
  message: 'Для блюда обязательно указать рецептуру',
  path: ['recipeId'],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!product;
  
  // Хуки для данных
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: recipesData, isLoading: recipesLoading } = useRecipes({ isActive: true });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Форма
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      article: '',
      barcode: '',
      categoryId: undefined,
      unitId: undefined,
      isDish: false,
      recipeId: undefined,
      shelfLifeDays: undefined,
      storageTemperatureMin: undefined,
      storageTemperatureMax: undefined,
      storageConditions: '',
      description: '',
      isActive: true,
    },
  });

  // Заполнение формы при редактировании
  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name,
        article: product.article || '',
        barcode: product.barcode || '',
        categoryId: product.categoryId || undefined,
        unitId: product.unitId,
        isDish: product.isDish,
        recipeId: product.recipeId || undefined,
        shelfLifeDays: product.shelfLifeDays || undefined,
        storageTemperatureMin: product.storageTemperatureMin ? parseFloat(product.storageTemperatureMin) : undefined,
        storageTemperatureMax: product.storageTemperatureMax ? parseFloat(product.storageTemperatureMax) : undefined,
        storageConditions: product.storageConditions || '',
        description: product.description || '',
        isActive: product.isActive,
      });
    } else if (!product && isOpen) {
      reset({
        name: '',
        article: '',
        barcode: '',
        categoryId: undefined,
        unitId: undefined,
        isDish: false,
        recipeId: undefined,
        shelfLifeDays: undefined,
        storageTemperatureMin: undefined,
        storageTemperatureMax: undefined,
        storageConditions: '',
        description: '',
        isActive: true,
      });
    }
  }, [product, isOpen, reset]);

  // Обработка отправки формы
  const onSubmit = async (data: ProductFormData) => {
    try {
      // Очистка пустых строк и NaN значений
      const cleanData = {
        ...data,
        article: data.article?.trim() || undefined,
        barcode: data.barcode?.trim() || undefined,
        storageConditions: data.storageConditions?.trim() || undefined,
        description: data.description?.trim() || undefined,
        // Преобразуем NaN в undefined для необязательных полей
        categoryId: data.categoryId && !isNaN(data.categoryId) ? data.categoryId : undefined,
        recipeId: data.recipeId && !isNaN(data.recipeId) ? data.recipeId : undefined,
        shelfLifeDays: data.shelfLifeDays && !isNaN(data.shelfLifeDays) ? data.shelfLifeDays : undefined,
        storageTemperatureMin: data.storageTemperatureMin && !isNaN(data.storageTemperatureMin) ? data.storageTemperatureMin : undefined,
        storageTemperatureMax: data.storageTemperatureMax && !isNaN(data.storageTemperatureMax) ? data.storageTemperatureMax : undefined,
      };

      if (isEditing && product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          data: cleanData as UpdateProductData,
        });
      } else {
        await createProductMutation.mutateAsync(cleanData as CreateProductData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  };

  // Обработка закрытия
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = categoriesLoading || unitsLoading || recipesLoading;
  const isMutating = createProductMutation.isPending || updateProductMutation.isPending;
  const recipes = recipesData?.recipes || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Редактирование товара' : 'Создание товара'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Основная информация</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Введите название товара"
                      error={errors.name?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="article">Артикул</Label>
                    <Input
                      id="article"
                      {...register('article')}
                      placeholder="Введите артикул"
                      error={errors.article?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="barcode">Штрихкод</Label>
                    <Input
                      id="barcode"
                      {...register('barcode')}
                      placeholder="Введите штрихкод"
                      error={errors.barcode?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Категория</Label>
                    <select
                      id="categoryId"
                      {...register('categoryId', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="unitId">Единица измерения *</Label>
                    <select
                      id="unitId"
                      {...register('unitId', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите единицу</option>
                      {units?.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.shortName})
                        </option>
                      ))}
                    </select>
                    {errors.unitId && (
                      <p className="text-sm text-red-600 mt-1">{errors.unitId.message}</p>
                    )}
                  </div>
                </div>

                {/* Флаг "Блюдо" */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <Controller
                    name="isDish"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="isDish"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="isDish" className="cursor-pointer">
                          <span className="font-medium">Это готовое блюдо</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Для блюд обязательно указывается рецептура
                          </p>
                        </Label>
                      </>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="recipeId">
                    Рецептура {watch('isDish') && <span className="text-red-600">*</span>}
                  </Label>
                  <select
                    id="recipeId"
                    {...register('recipeId', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {watch('isDish') ? 'Выберите рецептуру' : 'Без рецепта (простой продукт)'}
                    </option>
                    {recipes.map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name} (порция: {recipe.portionSize})
                      </option>
                    ))}
                  </select>
                  {errors.recipeId && (
                    <p className="text-sm text-red-600 mt-1">{errors.recipeId.message}</p>
                  )}
                  {!watch('isDish') && (
                    <p className="text-sm text-gray-500 mt-1">
                      Если товар является готовым блюдом, включите флаг "Это готовое блюдо" выше
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    placeholder="Введите описание товара"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Статус товара */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Switch
                          id="isActive"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">
                          {field.value ? 'Статус: Активен' : 'Статус: Неактивен'}
                        </Label>
                      </>
                    )}
                  />
                </div>
              </div>

              {/* Условия хранения */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Условия хранения</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shelfLifeDays">Срок годности (дни)</Label>
                    <Input
                      id="shelfLifeDays"
                      type="number"
                      min="0"
                      {...register('shelfLifeDays', { valueAsNumber: true })}
                      placeholder="0"
                      error={errors.shelfLifeDays?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="storageTemperatureMin">Мин. температура (°C)</Label>
                    <Input
                      id="storageTemperatureMin"
                      type="number"
                      min="-100"
                      max="100"
                      step="0.1"
                      {...register('storageTemperatureMin', { valueAsNumber: true })}
                      placeholder="-18"
                      error={errors.storageTemperatureMin?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="storageTemperatureMax">Макс. температура (°C)</Label>
                    <Input
                      id="storageTemperatureMax"
                      type="number"
                      min="-100"
                      max="100"
                      step="0.1"
                      {...register('storageTemperatureMax', { valueAsNumber: true })}
                      placeholder="25"
                      error={errors.storageTemperatureMax?.message}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storageConditions">Условия хранения</Label>
                  <textarea
                    id="storageConditions"
                    {...register('storageConditions')}
                    placeholder="Описание условий хранения"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.storageConditions && (
                    <p className="text-sm text-red-600 mt-1">{errors.storageConditions.message}</p>
                  )}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isMutating}
                >
                  {(isSubmitting || isMutating) && <Spinner size="sm" className="mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};
