import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogout = async () => {
    handleMenuClose();
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
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      case 'viewer':
        return 'Наблюдатель';
      default:
        return role;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Заголовок страницы */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Система управления столовыми
        </Typography>
      </Box>

      {/* Панель действий */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Уведомления */}
        <Tooltip title="Уведомления">
          <IconButton color="inherit" size="large">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Профиль пользователя */}
        {state.user && (
          <>
            <Tooltip title="Профиль пользователя">
              <IconButton
                onClick={handleMenuOpen}
                size="large"
                sx={{ ml: 1 }}
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {getInitials(state.user.firstName, state.user.lastName)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Информация о пользователе */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {state.user.firstName} {state.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {state.user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getRoleDisplayName(state.user.role)}
                </Typography>
              </Box>

              <Divider />

              {/* Пункты меню */}
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Профиль
              </MenuItem>

              {(state.user.role === 'admin' || state.user.role === 'manager') && (
                <MenuItem onClick={handleSettingsClick}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Настройки
                </MenuItem>
              )}

              <Divider />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Выйти
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};
