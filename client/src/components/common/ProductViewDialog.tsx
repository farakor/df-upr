import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/spinner';
import { useProduct } from '@/hooks/useProducts';
import type { Product } from '@/types/nomenclature';

interface ProductViewDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductViewDialog: React.FC<ProductViewDialogProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  // Загружаем полные данные товара с остатками
  const { data: fullProduct, isLoading } = useProduct(product?.id || 0, isOpen && !!product);
  
  // Используем полные данные, если они загружены, иначе базовые данные
  const displayProduct = fullProduct || product;

  if (!displayProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Информация о товаре</DialogTitle>
          <DialogDescription>
            Подробная информация о товаре, включая характеристики, остатки на складах и историю движения
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Название
                </label>
                <p className="text-base text-gray-900">{displayProduct.name}</p>
              </div>

              {displayProduct.article && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Артикул
                  </label>
                  <p className="text-base text-gray-900">{displayProduct.article}</p>
                </div>
              )}

              {displayProduct.barcode && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Штрихкод
                  </label>
                  <p className="text-base text-gray-900">{displayProduct.barcode}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Единица измерения
                </label>
                <p className="text-base text-gray-900">
                  {displayProduct.unit.name} ({displayProduct.unit.shortName})
                </p>
              </div>

              {displayProduct.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Категория
                  </label>
                  <p className="text-base text-gray-900">{displayProduct.category.name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Статус
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    displayProduct.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {displayProduct.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>

            {displayProduct.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Описание
                </label>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {displayProduct.description}
                </p>
              </div>
            )}
          </div>

          {/* Рецептура */}
          {displayProduct.recipe && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900">
                Рецептура (готовое блюдо)
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Название рецепта
                    </label>
                    <p className="text-base text-gray-900">{displayProduct.recipe.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Размер порции
                    </label>
                    <p className="text-base text-gray-900">{displayProduct.recipe.portionSize}</p>
                  </div>
                  {displayProduct.recipe.cookingTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Время приготовления
                      </label>
                      <p className="text-base text-gray-900">{displayProduct.recipe.cookingTime} мин</p>
                    </div>
                  )}
                  {displayProduct.recipe.costPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Себестоимость
                      </label>
                      <p className="text-base text-gray-900">{parseFloat(displayProduct.recipe.costPrice).toFixed(2)} ₽</p>
                    </div>
                  )}
                  {displayProduct.recipe.sellingPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Цена продажи
                      </label>
                      <p className="text-base text-gray-900">{parseFloat(displayProduct.recipe.sellingPrice).toFixed(2)} ₽</p>
                    </div>
                  )}
                </div>

                {displayProduct.recipe.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Описание рецепта
                    </label>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {displayProduct.recipe.description}
                    </p>
                  </div>
                )}

                {displayProduct.recipe.ingredients && displayProduct.recipe.ingredients.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Ингредиенты
                    </label>
                    <div className="bg-white rounded-md border">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Продукт
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                              Количество
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                              Ед. изм.
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {displayProduct.recipe.ingredients.map((ingredient) => (
                            <tr key={ingredient.id}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {ingredient.product.name}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 text-right">
                                {parseFloat(ingredient.quantity).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 text-right">
                                {ingredient.unit.shortName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Условия хранения */}
          {(displayProduct.shelfLifeDays ||
            displayProduct.storageTemperatureMin ||
            displayProduct.storageTemperatureMax ||
            displayProduct.storageConditions) && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900">
                Условия хранения
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProduct.shelfLifeDays && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Срок годности
                    </label>
                    <p className="text-base text-gray-900">
                      {displayProduct.shelfLifeDays} дней
                    </p>
                  </div>
                )}

                {(displayProduct.storageTemperatureMin || displayProduct.storageTemperatureMax) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Температура хранения
                    </label>
                    <p className="text-base text-gray-900">
                      {displayProduct.storageTemperatureMin && displayProduct.storageTemperatureMax
                        ? `от ${displayProduct.storageTemperatureMin}°C до ${displayProduct.storageTemperatureMax}°C`
                        : displayProduct.storageTemperatureMin
                        ? `от ${displayProduct.storageTemperatureMin}°C`
                        : `до ${displayProduct.storageTemperatureMax}°C`}
                    </p>
                  </div>
                )}

                {displayProduct.storageConditions && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Условия хранения
                    </label>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {displayProduct.storageConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Остатки на складах */}
          {displayProduct.stockBalances && displayProduct.stockBalances.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900">
                Остатки на складах
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Склад
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Количество
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Средняя цена
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Сумма
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayProduct.stockBalances.map((balance) => (
                      <tr key={balance.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {balance.warehouse.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {parseFloat(balance.quantity).toFixed(2)} {displayProduct.unit.shortName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {parseFloat(balance.avgPrice).toFixed(2)} ₽
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {parseFloat(balance.totalValue).toFixed(2)} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900">Итого</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {displayProduct.stockBalances
                          .reduce((sum, b) => sum + parseFloat(b.quantity), 0)
                          .toFixed(2)}{' '}
                        {displayProduct.unit.shortName}
                      </td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {displayProduct.stockBalances
                          .reduce((sum, b) => sum + parseFloat(b.totalValue), 0)
                          .toFixed(2)}{' '}
                        ₽
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Системная информация */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900">
              Системная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Создан
                </label>
                <p className="text-base text-gray-900">
                  {new Date(displayProduct.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Обновлён
                </label>
                <p className="text-base text-gray-900">
                  {new Date(displayProduct.updatedAt).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

