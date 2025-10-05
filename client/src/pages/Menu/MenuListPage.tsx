import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Search, Edit, Trash2, Calendar, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/spinner';
import { useMenu } from '@/hooks/useMenu';
import type { MenuCreateData, MenuUpdateData } from '@/services/api/menu';

const MenuListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    menus,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
  } = useMenu();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [formData, setFormData] = useState<MenuCreateData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchMenus({
      search: searchQuery,
      page: currentPage,
      limit: 20,
    });
  }, [searchQuery, currentPage]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleOpenDialog = (menu?: any) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name,
        description: menu.description || '',
        startDate: menu.startDate ? menu.startDate.split('T')[0] : '',
        endDate: menu.endDate ? menu.endDate.split('T')[0] : '',
      });
    } else {
      setEditingMenu(null);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMenu) {
      const success = await updateMenu(editingMenu.id, formData);
      if (success) {
        handleCloseDialog();
      }
    } else {
      const success = await createMenu(formData);
      if (success) {
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это меню?')) {
      await deleteMenu(id);
    }
  };

  const handleToggleActive = async (menu: any) => {
    await updateMenu(menu.id, { isActive: !menu.isActive });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading && menus.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Меню</h1>
            <p className="text-sm text-gray-500">Управление меню ресторана</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Создать меню
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ошибка */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Список меню */}
      <div className="grid gap-4">
        {menus.map((menu) => (
          <Card key={menu.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                    <Badge variant={menu.isActive ? 'success' : 'secondary'}>
                      {menu.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Активно
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Неактивно
                        </>
                      )}
                    </Badge>
                    {menu._count && (
                      <Badge variant="outline">
                        {menu._count.menuItems} {menu._count.menuItems === 1 ? 'позиция' : 'позиций'}
                      </Badge>
                    )}
                  </div>
                  
                  {menu.description && (
                    <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {(menu.startDate || menu.endDate) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(menu.startDate)} - {formatDate(menu.endDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/menu/${menu.id}/edit`)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Настроить
                  </Button>
                  <Button
                    variant={menu.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(menu)}
                  >
                    {menu.isActive ? 'Деактивировать' : 'Активировать'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(menu)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(menu.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Показано {menus.length} из {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Назад
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Далее
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Редактировать меню' : 'Создать меню'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о меню: название, описание и статус активности
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Сохранение...
                  </>
                ) : (
                  editingMenu ? 'Сохранить' : 'Создать'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuListPage;
