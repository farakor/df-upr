import React, { useState } from 'react';
import { Plus, Download, Trash2, Database, HardDrive, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import {
  useBackups,
  useCreateBackup,
  useDownloadBackup,
  useDeleteBackup,
} from '@/hooks/useBackups';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const BackupsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);

  // Hooks
  const { data: backupsData, isLoading } = useBackups(page, 20);
  const createBackupMutation = useCreateBackup();
  const downloadBackupMutation = useDownloadBackup();
  const deleteBackupMutation = useDeleteBackup();

  // Обработчики
  const handleCreateBackup = async () => {
    try {
      await createBackupMutation.mutateAsync();
      toast.success('Резервное копирование запущено');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при создании резервной копии');
    }
  };

  const handleDownloadBackup = async (backupId: number) => {
    try {
      await downloadBackupMutation.mutateAsync(backupId);
      toast.success('Резервная копия скачивается...');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при скачивании резервной копии');
    }
  };

  const handleDeleteBackup = (backupId: number) => {
    setSelectedBackupId(backupId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBackupId) return;
    try {
      await deleteBackupMutation.mutateAsync(selectedBackupId);
      toast.success('Резервная копия удалена');
      setIsDeleteDialogOpen(false);
      setSelectedBackupId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при удалении резервной копии');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      COMPLETED: { label: 'Завершено', variant: 'default' },
      IN_PROGRESS: { label: 'В процессе', variant: 'secondary' },
      FAILED: { label: 'Ошибка', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      MANUAL: { label: 'Ручное', variant: 'default' },
      AUTOMATIC: { label: 'Автоматическое', variant: 'secondary' },
      SCHEDULED: { label: 'По расписанию', variant: 'outline' },
    };
    const config = typeConfig[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const backups = backupsData?.backups || [];
  const pagination = backupsData?.pagination;

  // Статистика
  const totalBackups = pagination?.total || 0;
  const completedBackups = backups.filter((b: any) => b.status === 'COMPLETED').length;
  const totalSize = backups
    .filter((b: any) => b.status === 'COMPLETED')
    .reduce((sum: number, b: any) => sum + Number(b.size), 0);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Резервное копирование</h2>
          <p className="text-gray-600">Управление резервными копиями базы данных</p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={createBackupMutation.isPending}
        >
          {createBackupMutation.isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Создание...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Создать резервную копию
            </>
          )}
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Всего резервных копий</div>
              <div className="text-2xl font-bold">{totalBackups}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Успешных</div>
              <div className="text-2xl font-bold text-green-600">{completedBackups}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Общий размер</div>
              <div className="text-2xl font-bold text-purple-600">{formatFileSize(totalSize)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Таблица резервных копий */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Файл</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Размер</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Дата завершения</TableHead>
              <TableHead>Создал</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups && backups.length > 0 ? (
              backups.map((backup: any) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {backup.filename}
                    </code>
                  </TableCell>
                  <TableCell>{getTypeBadge(backup.type)}</TableCell>
                  <TableCell>{getStatusBadge(backup.status)}</TableCell>
                  <TableCell>
                    {backup.status === 'COMPLETED' ? formatFileSize(Number(backup.size)) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(backup.startedAt), 'dd.MM.yyyy', { locale: ru })}
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      {format(new Date(backup.startedAt), 'HH:mm', { locale: ru })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {backup.completedAt ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(backup.completedAt), 'dd.MM.yyyy', { locale: ru })}
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        {format(new Date(backup.completedAt), 'HH:mm', { locale: ru })}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {backup.createdBy ? (
                      <div>
                        <div className="font-medium text-sm">
                          {backup.createdBy.firstName} {backup.createdBy.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{backup.createdBy.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Система</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {backup.status === 'COMPLETED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-gray-500">Резервные копии не найдены</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreateBackup}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать первую резервную копию
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Показано {(pagination.currentPage - 1) * pagination.limit + 1}-
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} из{' '}
              {pagination.total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Назад
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Вперед
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Информация */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="p-2 bg-blue-100 rounded-lg h-fit">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-blue-900">О резервном копировании</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• Резервная копия содержит полный снимок базы данных</li>
              <li>• Автоматическое удаление копий старше 30 дней</li>
              <li>• Рекомендуется создавать копии перед важными обновлениями</li>
              <li>• Копии хранятся на сервере в защищенной директории</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить резервную копию?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Файл резервной копии будет удален с сервера.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
