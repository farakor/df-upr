import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          </div>
        </div>
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Доступ запрещен</h2>
            <p className="text-muted-foreground">
              У вас недостаточно прав для просмотра этой страницы.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};