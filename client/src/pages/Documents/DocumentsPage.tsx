import { useState } from 'react';
import { Plus, Search, Filter, FileText, Eye, Edit, Trash2, CheckCircle, XCircle, PackagePlus, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

import { DocumentForm } from '@/components/forms/DocumentForm';
import { DocumentViewDialog } from '@/components/common/DocumentViewDialog';
import { DocumentEditDialog } from '@/components/common/DocumentEditDialog';
import { 
  useDocuments, 
  useCreateDocument, 
  useDeleteDocument,
  useApproveDocument,
  useCancelDocument,
  Document,
  CreateDocumentData,
  AddDocumentItemData
} from '@/hooks/useDocuments';
import { useAddDocumentItem } from '@/hooks/useDocuments';

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

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDocumentType, setCreateDocumentType] = useState<'RECEIPT' | 'TRANSFER' | 'WRITEOFF' | 'INVENTORY_ADJUSTMENT'>('RECEIPT');
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);

  const { data: documentsData, isLoading, error } = useDocuments({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const createMutation = useCreateDocument();
  const addItemMutation = useAddDocumentItem();
  const deleteMutation = useDeleteDocument();
  const approveMutation = useApproveDocument();
  const cancelMutation = useCancelDocument();

  const handleCreateDocument = async (documentData: CreateDocumentData, items: AddDocumentItemData[]) => {
    try {
      const document = await createMutation.mutateAsync(documentData);
      
      // Добавляем все позиции в документ
      for (const item of items) {
        await addItemMutation.mutateAsync({ documentId: document.id, data: item });
      }
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при создании документа:', error);
    }
  };

  const handleDeleteDocument = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleApproveDocument = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleCancelDocument = (id: number) => {
    cancelMutation.mutate(id);
  };

  const handleViewDocument = (id: number) => {
    setViewingDocumentId(id);
  };

  const handleEditDocument = (id: number) => {
    setEditingDocumentId(id);
  };

  const filteredDocuments = documentsData?.data.filter(document => {
    const matchesSearch = document.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.warehouseFrom?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.warehouseTo?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Ошибка при загрузке документов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Документы</h1>
          <p className="text-muted-foreground">
            Управление складскими документами
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/documents/receipt')}
          >
            <PackagePlus className="h-4 w-4 mr-2" />
            Приход
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/stock-movements/create')}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Перемещение
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/documents/writeoff')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Списание
          </Button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по номеру, поставщику, складу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Тип документа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="RECEIPT">Приход</SelectItem>
                <SelectItem value="TRANSFER">Перемещение</SelectItem>
                <SelectItem value="WRITEOFF">Списание</SelectItem>
                <SelectItem value="INVENTORY_ADJUSTMENT">Корректировка</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="DRAFT">Черновик</SelectItem>
                <SelectItem value="APPROVED">Проведен</SelectItem>
                <SelectItem value="CANCELLED">Отменен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список документов */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Документы не найдены</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter || statusFilter 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Создайте первый документ для начала работы'}
            </p>
            {!searchTerm && !typeFilter && !statusFilter && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать документ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{document.number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(document.date), 'PPP', { locale: ru })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={documentTypeVariants[document.type]}>
                      {documentTypeLabels[document.type]}
                    </Badge>
                    <Badge variant={documentStatusVariants[document.status]}>
                      {documentStatusLabels[document.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Информация о складах/поставщике */}
                <div className="space-y-1 text-sm">
                  {document.supplier && (
                    <div>
                      <span className="text-muted-foreground">Поставщик:</span> {document.supplier.name}
                    </div>
                  )}
                  {document.warehouseFrom && (
                    <div>
                      <span className="text-muted-foreground">Откуда:</span> {document.warehouseFrom.name}
                    </div>
                  )}
                  {document.warehouseTo && (
                    <div>
                      <span className="text-muted-foreground">Куда:</span> {document.warehouseTo.name}
                    </div>
                  )}
                </div>

                {/* Сумма и количество позиций */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Позиций: {document._count?.items || 0}
                  </span>
                  <span className="font-semibold">
                    {Number(document.totalAmount).toFixed(2)} ₽
                  </span>
                </div>

                {/* Действия */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(document.id)}
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {document.status === 'DRAFT' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDocument(document.id)}
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    {document.status === 'DRAFT' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveDocument(document.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить документ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить документ {document.number}? 
                                Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDocument(document.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {document.status === 'APPROVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelDocument(document.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {documentsData && documentsData.pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Предыдущая
            </Button>
            <span className="text-sm text-muted-foreground">
              Страница {documentsData.pagination.page} из {documentsData.pagination.pages}
            </span>
            <Button variant="outline" size="sm" disabled>
              Следующая
            </Button>
          </div>
        </div>
      )}

      {/* Диалог просмотра документа */}
      <DocumentViewDialog
        documentId={viewingDocumentId}
        open={viewingDocumentId !== null}
        onClose={() => setViewingDocumentId(null)}
      />

      {/* Диалог редактирования документа */}
      <DocumentEditDialog
        documentId={editingDocumentId}
        open={editingDocumentId !== null}
        onClose={() => setEditingDocumentId(null)}
        onSuccess={() => setEditingDocumentId(null)}
      />
    </div>
  );
}
