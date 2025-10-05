import { Eye, X, Package, Calendar, User, Warehouse, FileText, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { useDocument } from '@/hooks/useDocuments';

interface DocumentViewDialogProps {
  documentId: number | null;
  open: boolean;
  onClose: () => void;
}

const documentTypeLabels = {
  RECEIPT: 'Приход',
  TRANSFER: 'Перемещение',
  WRITEOFF: 'Списание',
  INVENTORY_ADJUSTMENT: 'Корректировка'
};

const documentStatusLabels = {
  DRAFT: 'Черновик',
  APPROVED: 'Проведен',
  CANCELLED: 'Отменен'
};

const documentStatusVariants = {
  DRAFT: 'secondary' as const,
  APPROVED: 'default' as const,
  CANCELLED: 'destructive' as const
};

const documentTypeVariants = {
  RECEIPT: 'default' as const,
  TRANSFER: 'secondary' as const,
  WRITEOFF: 'destructive' as const,
  INVENTORY_ADJUSTMENT: 'outline' as const
};

export function DocumentViewDialog({ documentId, open, onClose }: DocumentViewDialogProps) {
  const { data: document, isLoading } = useDocument(documentId || 0);

  if (!open || !documentId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Просмотр документа</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Просмотр полной информации о документе, включая позиции и суммы
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : document ? (
          <div className="space-y-6">
            {/* Заголовок документа */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{document.number}</h2>
                  <Badge variant={documentTypeVariants[document.type]}>
                    {documentTypeLabels[document.type]}
                  </Badge>
                  <Badge variant={documentStatusVariants[document.status]}>
                    {documentStatusLabels[document.status]}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(document.date), 'PPP', { locale: ru })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Number(document.totalAmount).toFixed(2)} ₽
                </div>
                <div className="text-sm text-muted-foreground">
                  Общая сумма
                </div>
              </div>
            </div>

            {/* Информация о документе */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {document.supplier && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>Поставщик</span>
                  </div>
                  <div className="font-medium">{document.supplier.name}</div>
                </div>
              )}

              {document.warehouseFrom && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Warehouse className="h-4 w-4 mr-1" />
                    <span>Склад (откуда)</span>
                  </div>
                  <div className="font-medium">{document.warehouseFrom.name}</div>
                </div>
              )}

              {document.warehouseTo && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Warehouse className="h-4 w-4 mr-1" />
                    <span>Склад (куда)</span>
                  </div>
                  <div className="font-medium">{document.warehouseTo.name}</div>
                </div>
              )}

              {document.notes && (
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Примечание</span>
                  </div>
                  <div className="text-sm">{document.notes}</div>
                </div>
              )}
            </div>

            {/* Позиции документа */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  Позиции документа ({document.items?.length || 0})
                </h3>
              </div>

              {document.items && document.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr className="text-left text-sm">
                        <th className="px-4 py-3 font-medium">№</th>
                        <th className="px-4 py-3 font-medium">Товар</th>
                        <th className="px-4 py-3 font-medium text-right">Количество</th>
                        <th className="px-4 py-3 font-medium text-right">Цена</th>
                        <th className="px-4 py-3 font-medium text-right">Сумма</th>
                        <th className="px-4 py-3 font-medium">Партия</th>
                        <th className="px-4 py-3 font-medium">Срок годности</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {document.items.map((item, index) => (
                        <tr key={item.id} className="text-sm">
                          <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.product?.name}</div>
                            {item.product?.article && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {item.product.article}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(item.quantity).toFixed(2)} {item.unit?.shortName || item.unit?.name}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(item.price).toFixed(2)} ₽
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {(Number(item.quantity) * Number(item.price)).toFixed(2)} ₽
                          </td>
                          <td className="px-4 py-3">
                            {item.batchNumber || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {item.expiryDate 
                              ? format(new Date(item.expiryDate), 'dd.MM.yyyy', { locale: ru })
                              : '—'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr className="text-sm">
                        <td colSpan={4} className="px-4 py-3 text-right">
                          Итого:
                        </td>
                        <td className="px-4 py-3 text-right">
                          {Number(document.totalAmount).toFixed(2)} ₽
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Нет позиций в документе</p>
                </div>
              )}
            </div>

            {/* Служебная информация */}
            {(document.createdAt || document.updatedAt) && (
              <div className="border-t pt-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {document.createdAt && (
                    <div>
                      Создан: {format(new Date(document.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </div>
                  )}
                  {document.updatedAt && (
                    <div>
                      Изменен: {format(new Date(document.updatedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Документ не найден</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
