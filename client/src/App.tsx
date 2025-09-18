import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { ProductsListPage } from '@/pages/Products';
import { CategoriesPage } from '@/pages/Categories';
import { StyleTest } from '@/components/test/StyleTest';

// Создание клиента React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/test-styles" element={<StyleTest />} />
              
              {/* Защищенные маршруты */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Номенклатура */}
                <Route path="products" element={<ProductsListPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="recipes" element={<div className="p-6">Рецептуры (в разработке)</div>} />
                <Route path="menu" element={<div className="p-6">Меню (в разработке)</div>} />
                <Route path="warehouse" element={<div className="p-6">Склад (в разработке)</div>} />
                <Route path="inventory" element={<div className="p-6">Инвентаризация (в разработке)</div>} />
                <Route path="sales" element={<div className="p-6">Продажи (в разработке)</div>} />
                <Route path="reports" element={<div className="p-6">Отчеты (в разработке)</div>} />
                <Route path="settings" element={<div className="p-6">Настройки (в разработке)</div>} />
              </Route>
              
              {/* Обработка несуществующих маршрутов */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
        
        {/* Уведомления */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--destructive-foreground))',
              },
            },
          }}
        />
      </div>
      
      {/* React Query DevTools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;