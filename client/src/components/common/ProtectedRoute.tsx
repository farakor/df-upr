import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока проверяется аутентификация
  if (state.isLoading) {
    return (
      fallback || (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress size={60} />
        </Box>
      )
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на логин
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка ролей, если они указаны
  if (requiredRole && requiredRole.length > 0) {
    if (!requiredRole.includes(state.user.role)) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          flexDirection="column"
          gap={2}
        >
          <h2>Доступ запрещен</h2>
          <p>У вас недостаточно прав для просмотра этой страницы.</p>
        </Box>
      );
    }
  }

  return <>{children}</>;
};
