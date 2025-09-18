import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ChefHat,
  MenuSquare,
  Warehouse,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Дашборд',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard',
  },
  {
    id: 'products',
    label: 'Номенклатура',
    icon: <Package className="h-5 w-5" />,
    path: '/products',
  },
  {
    id: 'recipes',
    label: 'Рецептуры',
    icon: <ChefHat className="h-5 w-5" />,
    path: '/recipes',
  },
  {
    id: 'menu',
    label: 'Меню',
    icon: <MenuSquare className="h-5 w-5" />,
    path: '/menu',
  },
  {
    id: 'warehouse',
    label: 'Склад',
    icon: <Warehouse className="h-5 w-5" />,
    path: '/warehouse',
  },
  {
    id: 'inventory',
    label: 'Инвентаризация',
    icon: <ClipboardList className="h-5 w-5" />,
    path: '/inventory',
  },
  {
    id: 'sales',
    label: 'Продажи',
    icon: <ShoppingCart className="h-5 w-5" />,
    path: '/sales',
  },
  {
    id: 'reports',
    label: 'Отчеты',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/reports',
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
    roles: ['admin', 'manager'],
  },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  const canAccessItem = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return state.user && item.roles.includes(state.user.role);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Администратор',
      manager: 'Менеджер',
      operator: 'Оператор',
      viewer: 'Наблюдатель',
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Логотип и название */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            DF
          </div>
          <div>
            <h1 className="text-lg font-semibold">DF-UPR</h1>
            <p className="text-sm text-muted-foreground">Управление столовыми</p>
          </div>
        </div>
      </div>

      {/* Информация о пользователе */}
      {state.user && (
        <div className="border-b bg-muted/30 p-4">
          <div className="text-sm font-medium">
            {state.user.firstName} {state.user.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {getRoleLabel(state.user.role)}
          </div>
        </div>
      )}

      {/* Меню навигации */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (!canAccessItem(item)) {
              return null;
            }

            const isActive = isItemActive(item.path);

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleItemClick(item.path)}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Версия приложения */}
      <div className="border-t p-4">
        <div className="text-center text-xs text-muted-foreground">
          Версия 1.0.0
        </div>
      </div>
    </div>
  );
};