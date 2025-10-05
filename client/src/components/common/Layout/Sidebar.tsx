import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ChefHat,
  MenuSquare,
  Warehouse,
  FileText,
  BarChart2,
  TrendingUp,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  List,
  Grid3X3,
  Store,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import foodcostLogo from '@/assets/foodcost-services-logo.svg';
import farukBadge from '@/assets/faruk-badge.svg';

interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: SubMenuItem[];
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
    id: 'categories',
    label: 'Категории',
    icon: <FolderTree className="h-5 w-5" />,
    path: '/categories',
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
    subItems: [
      {
        id: 'menu-display',
        label: 'Просмотр меню',
        icon: <Eye className="h-4 w-4" />,
        path: '/menu',
      },
      {
        id: 'menu-categories',
        label: 'Категории',
        icon: <Grid3X3 className="h-4 w-4" />,
        path: '/menu/categories',
      },
      {
        id: 'menu-items',
        label: 'Позиции меню',
        icon: <List className="h-4 w-4" />,
        path: '/menu/items',
      },
      {
        id: 'menu-warehouse-settings',
        label: 'Настройки по складам',
        icon: <Store className="h-4 w-4" />,
        path: '/menu/warehouse-settings',
      },
    ],
  },
  {
    id: 'warehouse',
    label: 'Склад',
    icon: <Warehouse className="h-5 w-5" />,
    path: '/warehouse',
  },
  {
    id: 'documents',
    label: 'Документы',
    icon: <FileText className="h-5 w-5" />,
    path: '/documents',
  },
  {
    id: 'stock-balances',
    label: 'Остатки',
    icon: <BarChart2 className="h-5 w-5" />,
    path: '/stock-balances',
  },
  {
    id: 'stock-movements',
    label: 'Движения',
    icon: <TrendingUp className="h-5 w-5" />,
    path: '/stock-movements',
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
    subItems: [
      {
        id: 'sales-cashier',
        label: 'Касса',
        icon: <ShoppingCart className="h-4 w-4" />,
        path: '/sales',
      },
      {
        id: 'sales-dashboard',
        label: 'Дашборд продаж',
        icon: <BarChart3 className="h-4 w-4" />,
        path: '/sales/dashboard',
      },
    ],
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
    roles: ['ADMIN', 'MANAGER'],
  },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  const isItemOrSubItemActive = (item: MenuItem) => {
    if (item.path && isItemActive(item.path)) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => isItemActive(subItem.path));
    }
    return false;
  };

  const canAccessItem = (item: MenuItem | SubMenuItem) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return state.user && item.roles.includes(state.user.role);
  };

  // Автоматически раскрываем подменю, если пользователь находится на одной из его страниц
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems && isItemOrSubItemActive(item)) {
        setExpandedItems(prev => 
          prev.includes(item.id) ? prev : [...prev, item.id]
        );
      }
    });
  }, [location.pathname]);

  return (
    <div className="flex h-full flex-col">
      {/* Логотип и название */}
      <div className="border-b p-6">
        <div className="flex flex-col items-center gap-2">
          <img 
            src={foodcostLogo} 
            alt="FoodCost Services" 
            className="h-12 w-auto"
          />
          <div className="text-center text-xs text-muted-foreground">
            Версия 1.0.0
          </div>
        </div>
      </div>

      {/* Меню навигации */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (!canAccessItem(item)) {
              return null;
            }

            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.id);
            const isActive = isItemOrSubItemActive(item);

            return (
              <div key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.id);
                    } else if (item.path) {
                      handleItemClick(item.path);
                    }
                  }}
                >
                  {item.icon}
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {hasSubItems && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  )}
                </Button>

                {/* Подменю */}
                {hasSubItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => {
                      if (!canAccessItem(subItem)) {
                        return null;
                      }

                      const isSubItemActive = isItemActive(subItem.path);

                      return (
                        <Button
                          key={subItem.id}
                          variant={isSubItemActive ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-3 h-9",
                            isSubItemActive && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => handleItemClick(subItem.path)}
                        >
                          {subItem.icon}
                          <span className="truncate">{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Разработчик */}
      <div className="border-t p-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Developed by</span>
          <img 
            src={farukBadge} 
            alt="Faruk Oripov" 
            className="h-8 w-auto"
          />
        </div>
      </div>
    </div>
  );
};