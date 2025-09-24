import React, { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Package,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { 
  useCreateInventory, 
  useCreateInventoryFromBalances,
  useGenerateInventorySheet 
} from '../../hooks/useInventory';
import { CreateInventoryData, GenerateSheetOptions } from '../../services/api/inventory';

const schema = yup.object({
  warehouseId: yup.number().required('Выберите склад'),
  date: yup.string().required('Укажите дату инвентаризации'),
  responsiblePersonId: yup.number().optional(),
  notes: yup.string().optional(),
  includeZeroBalances: yup.boolean().default(false),
  categoryIds: yup.array().of(yup.number()).optional(),
  productIds: yup.array().of(yup.number()).optional(),
});

type FormData = yup.InferType<typeof schema>;

const CreateInventory: React.FC = () => {
  const navigate = useNavigate();
  const [createWithBalances, setCreateWithBalances] = useState(true);
  const [previewSheet, setPreviewSheet] = useState(false);

  const { data: warehouses } = useWarehouses();
  const { data: categories } = useCategories();
  const { data: products } = useProducts();

  const createInventoryMutation = useCreateInventory();
  const createInventoryFromBalancesMutation = useCreateInventoryFromBalances();
  const generateSheetMutation = useGenerateInventorySheet();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      includeZeroBalances: false,
      categoryIds: [],
      productIds: [],
    },
  });

  const watchedWarehouseId = watch('warehouseId');
  const watchedCategoryIds = watch('categoryIds');
  const watchedProductIds = watch('productIds');
  const watchedIncludeZeroBalances = watch('includeZeroBalances');

  const onSubmit = async (data: FormData) => {
    try {
      const inventoryData: CreateInventoryData = {
        warehouseId: data.warehouseId,
        date: data.date,
        responsiblePersonId: data.responsiblePersonId,
        notes: data.notes,
      };

      if (createWithBalances) {
        const sheetOptions: GenerateSheetOptions = {
          warehouseId: data.warehouseId,
          categoryIds: data.categoryIds?.length ? data.categoryIds : undefined,
          productIds: data.productIds?.length ? data.productIds : undefined,
          includeZeroBalances: data.includeZeroBalances,
        };

        const result = await createInventoryFromBalancesMutation.mutateAsync({
          ...inventoryData,
          ...sheetOptions,
        });

        navigate(`/inventory/${result.id}`);
      } else {
        const result = await createInventoryMutation.mutateAsync(inventoryData);
        navigate(`/inventory/${result.id}`);
      }
    } catch (error) {
      console.error('Ошибка при создании инвентаризации:', error);
    }
  };

  const handlePreviewSheet = async () => {
    if (!watchedWarehouseId) return;

    const options: GenerateSheetOptions = {
      warehouseId: watchedWarehouseId,
      categoryIds: watchedCategoryIds?.length ? watchedCategoryIds : undefined,
      productIds: watchedProductIds?.length ? watchedProductIds : undefined,
      includeZeroBalances: watchedIncludeZeroBalances,
    };

    try {
      await generateSheetMutation.mutateAsync(options);
      setPreviewSheet(true);
    } catch (error) {
      console.error('Ошибка при генерации ведомости:', error);
    }
  };

  const selectedWarehouse = warehouses?.find(w => w.id === watchedWarehouseId);
  const selectedCategories = categories?.filter(c => watchedCategoryIds?.includes(c.id));
  const selectedProducts = products?.products?.filter(p => watchedProductIds?.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/inventory')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Создание инвентаризации
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Склад *
                    </label>
                    <Controller
                      name="warehouseId"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          >
                            <SelectTrigger className={errors.warehouseId ? 'border-red-500' : ''}>
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
                          {errors.warehouseId && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.warehouseId.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата инвентаризации *
                    </label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Input
                            {...field}
                            type="date"
                            className={errors.date ? 'border-red-500' : ''}
                          />
                          {errors.date && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.date.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Примечания
                  </label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <textarea
                          {...field}
                          rows={3}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.notes ? 'border-red-500' : ''
                          }`}
                          placeholder="Введите примечания..."
                        />
                        {errors.notes && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.notes.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Настройки создания */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Настройки создания</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createWithBalances"
                    checked={createWithBalances}
                    onChange={(e) => setCreateWithBalances(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="createWithBalances" className="text-sm font-medium text-gray-700">
                    Создать с позициями из остатков
                  </label>
                </div>

                {createWithBalances && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                          Инвентаризация будет создана с позициями на основе текущих остатков склада
                        </p>
                      </div>
                    </div>

                    <Controller
                      name="includeZeroBalances"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="includeZeroBalances"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="includeZeroBalances" className="text-sm font-medium text-gray-700">
                            Включить товары с нулевыми остатками
                          </label>
                        </div>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Фильтры товаров */}
        {createWithBalances && (
          <Card>
            <CardHeader>
              <CardTitle>Фильтры товаров</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категории
                  </label>
                  <Controller
                    name="categoryIds"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Select
                          value={field.value?.join(',') || ''}
                          onValueChange={(value) => {
                            const ids = value ? value.split(',').map(Number) : [];
                            field.onChange(ids);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категории" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCategories && selectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCategories.map((category) => (
                              <Badge key={category.id} variant="secondary">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Товары
                  </label>
                  <Controller
                    name="productIds"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Select
                          value={field.value?.join(',') || ''}
                          onValueChange={(value) => {
                            const ids = value ? value.split(',').map(Number) : [];
                            field.onChange(ids);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите товары" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.products?.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedProducts && selectedProducts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedProducts.map((product) => (
                              <Badge key={product.id} variant="secondary">
                                {product.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {watchedWarehouseId && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviewSheet}
                    disabled={generateSheetMutation.isPending}
                  >
                    {generateSheetMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    Предварительный просмотр
                  </Button>

                  {generateSheetMutation.data && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-green-800">
                          Ведомость содержит {generateSheetMutation.data.length} позиций
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Кнопки действий */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={
              createInventoryMutation.isPending || 
              createInventoryFromBalancesMutation.isPending
            }
          >
            {createInventoryMutation.isPending || createInventoryFromBalancesMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Создать инвентаризацию
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/inventory')}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInventory;
