import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LowStockNotifications } from '../LowStockNotifications';
import { cn } from '@/utils/cn';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Мобильное меню - overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Боковое меню */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onItemClick={() => setSidebarOpen(false)} />
      </div>

      {/* Основной контент */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Заголовок */}
        <header className="bg-background border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Открыть меню</span>
            </Button>
            <Header />
          </div>
        </header>

        {/* Контент страницы */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Уведомления о низких остатках */}
      <LowStockNotifications />
    </div>
  );
};