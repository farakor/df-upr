import React, { useState } from 'react';
import { Users, FileText, Settings as SettingsIcon, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UsersPage } from './UsersPage';
import { AuditLogsPage } from './AuditLogsPage';
import { SystemSettingsPage } from './SystemSettingsPage';
import { BackupsPage } from './BackupsPage';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Настройки и администрирование</h1>
        <p className="text-gray-600 mt-2">
          Управление пользователями, системными настройками и резервным копированием
        </p>
      </div>

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Журнал аудита
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Системные настройки
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Резервное копирование
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersPage />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogsPage />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SystemSettingsPage />
        </TabsContent>

        <TabsContent value="backups" className="mt-6">
          <BackupsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};
