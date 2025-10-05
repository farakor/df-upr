import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Key, UserCheck, UserX } from 'lucide-react';
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
  DialogFooter,
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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangeUserPassword, useChangeUserRole, type User } from '@/hooks/useUsers';
import { toast } from 'react-hot-toast';

type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: UserRole;
  phone?: string;
}

export const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'OPERATOR',
    phone: '',
  });
  const [newPassword, setNewPassword] = useState('');

  // Hooks
  const { users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const changePasswordMutation = useChangeUserPassword();
  const changeRoleMutation = useChangeUserRole();

  // Фильтрация пользователей
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Обработчики
  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'OPERATOR',
      phone: '',
    });
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
    });
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleChangePassword = (userId: number) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleSubmitUser = async () => {
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
        });
        toast.success('Пользователь успешно обновлен');
      } else {
        if (!formData.password) {
          toast('Введите пароль');
          return;
        }
        await createUserMutation.mutateAsync({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
        });
        toast.success('Пользователь успешно создан');
      }
      setIsUserFormOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при сохранении пользователя');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUserMutation.mutateAsync(selectedUserId);
      toast.success('Пользователь успешно удален');
      setIsDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при удалении пользователя');
    }
  };

  const handleSubmitPassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast('Введите новый пароль');
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        id: selectedUserId,
        newPassword,
      });
      toast.success('Пароль успешно изменен');
      setIsPasswordDialogOpen(false);
      setSelectedUserId(null);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении пароля');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { isActive: !user.isActive },
      });
      toast.success(user.isActive ? 'Пользователь деактивирован' : 'Пользователь активирован');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении статуса');
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    try {
      await changeRoleMutation.mutateAsync({ id: userId, role: newRole });
      toast.success('Роль успешно изменена');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при изменении роли');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ADMIN: { label: 'Администратор', variant: 'destructive' },
      MANAGER: { label: 'Менеджер', variant: 'default' },
      OPERATOR: { label: 'Оператор', variant: 'secondary' },
      VIEWER: { label: 'Наблюдатель', variant: 'outline' },
    };
    const config = roleConfig[role];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
          <p className="text-gray-600">Создание и редактирование учетных записей</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="w-4 h-4 mr-2" />
          Создать пользователя
        </Button>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по email, имени или фамилии..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole | 'ALL')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все роли</SelectItem>
              <SelectItem value="ADMIN">Администратор</SelectItem>
              <SelectItem value="MANAGER">Менеджер</SelectItem>
              <SelectItem value="OPERATOR">Оператор</SelectItem>
              <SelectItem value="VIEWER">Наблюдатель</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Таблица пользователей */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleChangeRole(user.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Администратор</SelectItem>
                        <SelectItem value="MANAGER">Менеджер</SelectItem>
                        <SelectItem value="OPERATOR">Оператор</SelectItem>
                        <SelectItem value="VIEWER">Наблюдатель</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default">Активен</Badge>
                    ) : (
                      <Badge variant="outline">Неактивен</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangePassword(user.id)}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Пользователи не найдены</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Диалог создания/редактирования пользователя */}
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Измените данные пользователя'
                : 'Заполните данные для нового пользователя'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Введите имя"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Введите фамилию"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Введите пароль"
                />
              </div>
            )}
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="role">Роль</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATOR">Оператор</SelectItem>
                    <SelectItem value="MANAGER">Менеджер</SelectItem>
                    <SelectItem value="ADMIN">Администратор</SelectItem>
                    <SelectItem value="VIEWER">Наблюдатель</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserFormOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmitUser}>
              {editingUser ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог смены пароля */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription>
              Введите новый пароль для пользователя
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="newPassword">Новый пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Введите новый пароль"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmitPassword}>Изменить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить пользователя?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Пользователь будет удален из системы.
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
