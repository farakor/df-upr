import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  Restaurant as RecipesIcon,
  MenuBook as MenuIcon,
  Warehouse as WarehouseIcon,
  Assignment as InventoryIcon,
  PointOfSale as SalesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

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
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'products',
    label: 'Номенклатура',
    icon: <ProductsIcon />,
    path: '/products',
  },
  {
    id: 'recipes',
    label: 'Рецептуры',
    icon: <RecipesIcon />,
    path: '/recipes',
  },
  {
    id: 'menu',
    label: 'Меню',
    icon: <MenuIcon />,
    path: '/menu',
  },
  {
    id: 'warehouse',
    label: 'Склад',
    icon: <WarehouseIcon />,
    path: '/warehouse',
  },
  {
    id: 'inventory',
    label: 'Инвентаризация',
    icon: <InventoryIcon />,
    path: '/inventory',
  },
  {
    id: 'sales',
    label: 'Продажи',
    icon: <SalesIcon />,
    path: '/sales',
  },
  {
    id: 'reports',
    label: 'Отчеты',
    icon: <ReportsIcon />,
    path: '/reports',
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: <SettingsIcon />,
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Логотип и название */}
      <Toolbar
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            DF
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              DF-UPR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Управление столовыми
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* Информация о пользователе */}
      {state.user && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {state.user.firstName} {state.user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {state.user.role === 'admin' && 'Администратор'}
            {state.user.role === 'manager' && 'Менеджер'}
            {state.user.role === 'operator' && 'Оператор'}
            {state.user.role === 'viewer' && 'Наблюдатель'}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Меню навигации */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 1 }}>
          {menuItems.map((item) => {
            if (!canAccessItem(item)) {
              return null;
            }

            const isActive = isItemActive(item.path);

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'grey.100',
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'white' : 'text.secondary',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Версия приложения */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Версия 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};
