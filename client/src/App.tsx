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
import { WarehousePage } from '@/pages/Warehouse';
import { SuppliersPage } from '@/pages/Suppliers';
import { DocumentsPage } from '@/pages/Documents';
import { ReceiptPage } from '@/pages/Documents/ReceiptPage';
import { TransferPage } from '@/pages/Documents/TransferPage';
import { WriteoffPage } from '@/pages/Documents/WriteoffPage';
import { StockBalancesPage } from '@/pages/StockBalances';
import { StockMovementsPage } from '@/pages/StockMovements';
import { RecipesListPage } from '@/pages/Recipes';
import { MenuCategoriesPage, MenuItemsPage, WarehouseMenuPage, MenuDisplayPage } from '@/pages/Menu';
import { InventoryList, CreateInventory, InventoryDetail, InventoryAnalysis } from '@/pages/Inventory';
import { SalesPage, SalesDashboard } from '@/pages/Sales';
import { ReportsPage } from '@/pages/Reports';
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
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                <Route path="recipes" element={<RecipesListPage />} />
                
                {/* Меню */}
                <Route path="menu" element={<MenuDisplayPage />} />
                <Route path="menu/categories" element={<MenuCategoriesPage />} />
                <Route path="menu/items" element={<MenuItemsPage />} />
                <Route path="menu/warehouse-settings" element={<WarehouseMenuPage />} />
                
                <Route path="warehouse" element={<WarehousePage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="documents/receipt" element={<ReceiptPage />} />
                <Route path="documents/transfer" element={<TransferPage />} />
                <Route path="documents/writeoff" element={<WriteoffPage />} />
                <Route path="stock-balances" element={<StockBalancesPage />} />
                <Route path="stock-movements" element={<StockMovementsPage />} />
                <Route path="inventory" element={<InventoryList />} />
                <Route path="inventory/create" element={<CreateInventory />} />
                <Route path="inventory/:id" element={<InventoryDetail />} />
                <Route path="inventory/:id/analysis" element={<InventoryAnalysis />} />
                
                {/* Продажи */}
                <Route path="sales" element={<SalesPage />} />
                <Route path="sales/dashboard" element={<SalesDashboard />} />
                
                {/* Отчеты */}
                <Route path="reports" element={<ReportsPage />} />
                
                {/* Настройки */}
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