import React, { useState } from 'react';
import { Search, Filter, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useAuditLogs } from '@/hooks/useAudit';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Hooks
  const { data: logsData, isLoading } = useAuditLogs(filters);

  // Обработчики
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const getActionBadge = (action: string) => {
    const actionConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      CREATE: { variant: 'default' },
      UPDATE: { variant: 'secondary' },
      DELETE: { variant: 'destructive' },
      LOGIN: { variant: 'outline' },
      LOGOUT: { variant: 'outline' },
    };
    const config = actionConfig[action] || { variant: 'outline' };
    return <Badge variant={config.variant}>{action}</Badge>;
  };

  const getEntityTypeName = (entityType: string) => {
    const typeNames: Record<string, string> = {
      user: 'Пользователь',
      product: 'Товар',
      category: 'Категория',
      recipe: 'Рецептура',
      document: 'Документ',
      inventory: 'Инвентаризация',
      sale: 'Продажа',
      system_setting: 'Настройка',
      backup: 'Резервная копия',
    };
    return typeNames[entityType] || entityType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Журнал аудита</h2>
          <p className="text-gray-600">История действий пользователей в системе</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </Button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="action">Действие</Label>
              <Select
                value={filters.action || ''}
                onValueChange={(value) => handleFilterChange('action', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все действия" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все действия</SelectItem>
                  <SelectItem value="CREATE">Создание</SelectItem>
                  <SelectItem value="UPDATE">Обновление</SelectItem>
                  <SelectItem value="DELETE">Удаление</SelectItem>
                  <SelectItem value="LOGIN">Вход</SelectItem>
                  <SelectItem value="LOGOUT">Выход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entityType">Тип объекта</Label>
              <Select
                value={filters.entityType || ''}
                onValueChange={(value) => handleFilterChange('entityType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все типы</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="product">Товар</SelectItem>
                  <SelectItem value="category">Категория</SelectItem>
                  <SelectItem value="recipe">Рецептура</SelectItem>
                  <SelectItem value="document">Документ</SelectItem>
                  <SelectItem value="inventory">Инвентаризация</SelectItem>
                  <SelectItem value="sale">Продажа</SelectItem>
                  <SelectItem value="system_setting">Настройка</SelectItem>
                  <SelectItem value="backup">Резервная копия</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Всего записей</div>
          <div className="text-2xl font-bold">{pagination?.total || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Создание</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter((l: any) => l.action === 'CREATE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Обновление</div>
          <div className="text-2xl font-bold text-blue-600">
            {logs.filter((l: any) => l.action === 'UPDATE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Удаление</div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter((l: any) => l.action === 'DELETE').length}
          </div>
        </Card>
      </div>

      {/* Таблица логов */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата и время</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Тип объекта</TableHead>
              <TableHead>ID объекта</TableHead>
              <TableHead>IP адрес</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.length > 0 ? (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm:ss', { locale: ru })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <div>
                        <div className="font-medium">
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{log.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Система</span>
                    )}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{getEntityTypeName(log.entityType)}</TableCell>
                  <TableCell>
                    {log.entityId ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        #{log.entityId}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{log.ipAddress || '-'}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Записи не найдены</p>
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
                onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Вперед
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Диалог деталей лога */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали записи аудита</DialogTitle>
            <DialogDescription>
              Подробная информация о действии
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата и время</Label>
                  <div className="text-sm">
                    {format(new Date(selectedLog.createdAt), 'dd MMMM yyyy, HH:mm:ss', {
                      locale: ru,
                    })}
                  </div>
                </div>
                <div>
                  <Label>Пользователь</Label>
                  <div className="text-sm">
                    {selectedLog.user
                      ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.email})`
                      : 'Система'}
                  </div>
                </div>
                <div>
                  <Label>Действие</Label>
                  <div className="text-sm">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label>Тип объекта</Label>
                  <div className="text-sm">{getEntityTypeName(selectedLog.entityType)}</div>
                </div>
                <div>
                  <Label>ID объекта</Label>
                  <div className="text-sm">
                    {selectedLog.entityId ? `#${selectedLog.entityId}` : '-'}
                  </div>
                </div>
                <div>
                  <Label>IP адрес</Label>
                  <div className="text-sm">
                    <code>{selectedLog.ipAddress || '-'}</code>
                  </div>
                </div>
              </div>
              {selectedLog.userAgent && (
                <div>
                  <Label>User Agent</Label>
                  <div className="text-xs text-gray-600 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}
              {selectedLog.changes && (
                <div>
                  <Label>Изменения</Label>
                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
