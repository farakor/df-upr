import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { Category, CreateCategoryData, UpdateCategoryData } from '@/types/nomenclature';

// Схема валидации
const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название не может превышать 255 символов'),
  parentId: z.number().optional(),
  description: z.string().max(1000, 'Описание не может превышать 1000 символов').optional(),
  sortOrder: z.number().min(0, 'Порядок сортировки не может быть отрицательным').optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  parentCategory?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  parentCategory,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!category;
  
  // Хуки для данных
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  // Форма
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: undefined,
      description: '',
      sortOrder: 0,
    },
  });

  // Заполнение формы при редактировании или создании подкатегории
  useEffect(() => {
    if (category && isOpen) {
      // Редактирование существующей категории
      reset({
        name: category.name,
        parentId: category.parentId || undefined,
        description: category.description || '',
        sortOrder: category.sortOrder,
      });
    } else if (parentCategory && isOpen) {
      // Создание подкатегории
      reset({
        name: '',
        parentId: parentCategory.id,
        description: '',
        sortOrder: 0,
      });
    } else if (!category && !parentCategory && isOpen) {
      // Создание корневой категории
      reset({
        name: '',
        parentId: undefined,
        description: '',
        sortOrder: 0,
      });
    }
  }, [category, parentCategory, isOpen, reset]);

  // Обработка отправки формы
  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Очистка пустых строк
      const cleanData = {
        ...data,
        description: data.description?.trim() || undefined,
        parentId: data.parentId || undefined,
      };

      if (isEditing && category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          data: cleanData as UpdateCategoryData,
        });
      } else {
        await createCategoryMutation.mutateAsync(cleanData as CreateCategoryData);
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

  // Фильтрация категорий для выбора родительской (исключаем текущую и её потомков)
  const availableParentCategories = React.useMemo(() => {
    if (!categories) return [];
    
    if (!isEditing) return categories;
    
    // При редактировании исключаем текущую категорию и её потомков
    const excludeIds = new Set<number>();
    
    const addDescendants = (cat: Category) => {
      excludeIds.add(cat.id);
      if (cat.children) {
        cat.children.forEach(addDescendants);
      }
    };
    
    if (category) {
      addDescendants(category);
    }
    
    return categories.filter(cat => !excludeIds.has(cat.id));
  }, [categories, category, isEditing]);

  if (!isOpen) return null;

  const isLoading = categoriesLoading;
  const isMutating = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing 
                ? 'Редактирование категории' 
                : parentCategory 
                  ? `Создание подкатегории в "${parentCategory.name}"`
                  : 'Создание категории'
              }
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
            <div className="flex items-center justify-center h-32">
              <Spinner size="lg" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Название */}
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Введите название категории"
                  error={errors.name?.message}
                />
              </div>

              {/* Родительская категория */}
              <div>
                <Label htmlFor="parentId">Родительская категория</Label>
                <select
                  id="parentId"
                  {...register('parentId', { 
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!parentCategory} // Заблокировано если создаем подкатегорию
                >
                  <option value="">Корневая категория</option>
                  {availableParentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.parentId && (
                  <p className="text-sm text-red-600 mt-1">{errors.parentId.message}</p>
                )}
                {parentCategory && (
                  <p className="text-sm text-gray-600 mt-1">
                    Будет создана как подкатегория "{parentCategory.name}"
                  </p>
                )}
              </div>

              {/* Описание */}
              <div>
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Введите описание категории"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Порядок сортировки */}
              <div>
                <Label htmlFor="sortOrder">Порядок сортировки</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  {...register('sortOrder', { valueAsNumber: true })}
                  placeholder="0"
                  error={errors.sortOrder?.message}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Чем меньше число, тем выше в списке
                </p>
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
