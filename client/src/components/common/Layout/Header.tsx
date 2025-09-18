import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Ошибка при выходе из системы');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Администратор',
      manager: 'Менеджер',
      operator: 'Оператор',
      viewer: 'Наблюдатель',
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="flex w-full items-center justify-between">
      {/* Заголовок страницы */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          Система управления столовыми
        </h1>
      </div>

      {/* Панель действий */}
      <div className="flex items-center gap-2">
        {/* Уведомления */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
            3
          </span>
          <span className="sr-only">Уведомления</span>
        </Button>

        {/* Профиль пользователя */}
        {state.user && (
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {getInitials(state.user.firstName, state.user.lastName)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {state.user.firstName} {state.user.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getRoleDisplayName(state.user.role)}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Выпадающее меню */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md">
                  {/* Информация о пользователе */}
                  <div className="px-3 py-2 border-b">
                    <div className="font-medium text-sm">
                      {state.user.firstName} {state.user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {state.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRoleDisplayName(state.user.role)}
                    </div>
                  </div>

                  {/* Пункты меню */}
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <User className="h-4 w-4" />
                      Профиль
                    </button>

                    {(state.user.role === 'admin' || state.user.role === 'manager') && (
                      <button
                        onClick={handleSettingsClick}
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        <Settings className="h-4 w-4" />
                        Настройки
                      </button>
                    )}

                    <div className="my-1 border-t" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};