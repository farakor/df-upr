import React, { useState } from 'react';
import { Save, Plus, Edit, Trash2, Download, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  useSystemSettings,
  useUpsertSystemSetting,
  useDeleteSystemSetting,
} from '@/hooks/useSystemSettings';
import { toast } from 'react-hot-toast';

interface SettingFormData {
  key: string;
  value: any;
  category: string;
  description: string;
  isPublic: boolean;
}

export const SystemSettingsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingFormOpen, setIsSettingFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SettingFormData>({
    key: '',
    value: '',
    category: 'general',
    description: '',
    isPublic: false,
  });

  // Hooks
  const { data: settings, isLoading } = useSystemSettings();
  const upsertSettingMutation = useUpsertSystemSetting();
  const deleteSettingMutation = useDeleteSystemSetting();

  // Категории настроек
  const categories = [
    { value: 'all', label: 'Все настройки' },
    { value: 'general', label: 'Общие' },
    { value: 'security', label: 'Безопасность' },
    { value: 'notifications', label: 'Уведомления' },
    { value: 'integration', label: 'Интеграции' },
    { value: 'appearance', label: 'Внешний вид' },
    { value: 'backup', label: 'Резервное копирование' },
  ];

  // Фильтрация настроек
  const filteredSettings = settings?.filter((setting) => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesSearch =
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Группировка настроек по категориям
  const groupedSettings = filteredSettings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, any[]>);

  // Обработчики
  const handleCreateSetting = () => {
    setEditingSetting(null);
    setFormData({
      key: '',
      value: '',
      category: 'general',
      description: '',
      isPublic: false,
    });
    setIsSettingFormOpen(true);
  };

  const handleEditSetting = (setting: any) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: JSON.stringify(setting.value, null, 2),
      category: setting.category,
      description: setting.description || '',
      isPublic: setting.isPublic || false,
    });
    setIsSettingFormOpen(true);
  };

  const handleDeleteSetting = (key: string) => {
    setSelectedSettingKey(key);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitSetting = async () => {
    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(formData.value);
      } catch {
        parsedValue = formData.value;
      }

      await upsertSettingMutation.mutateAsync({
        key: formData.key,
        value: parsedValue,
        category: formData.category,
        description: formData.description,
        isPublic: formData.isPublic,
      });

      toast.success(editingSetting ? 'Настройка обновлена' : 'Настройка создана');
      setIsSettingFormOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при сохранении настройки');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSettingKey) return;
    try {
      await deleteSettingMutation.mutateAsync(selectedSettingKey);
      toast.success('Настройка удалена');
      setIsDeleteDialogOpen(false);
      setSelectedSettingKey(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при удалении настройки');
    }
  };

  const handleExportSettings = () => {
    if (!settings) return;
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings_${new Date().toISOString()}.json`;
    link.click();
    toast.success('Настройки экспортированы');
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.label || category;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Системные настройки</h2>
          <p className="text-gray-600">Конфигурация приложения</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button onClick={handleCreateSetting}>
            <Plus className="w-4 h-4 mr-2" />
            Создать настройку
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск настроек..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Табы по категориям */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <div className="space-y-4">
              {category.value === 'all' ? (
                // Показываем все настройки сгруппированные по категориям
                Object.entries(groupedSettings || {}).map(([cat, catSettings]) => (
                  <Card key={cat} className="p-4">
                    <h3 className="text-lg font-semibold mb-4">{getCategoryLabel(cat)}</h3>
                    <div className="space-y-3">
                      {catSettings.map((setting: any) => (
                        <div
                          key={setting.id}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-semibold">
                                {setting.key}
                              </code>
                              {setting.isPublic && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Публичная
                                </span>
                              )}
                            </div>
                            {setting.description && (
                              <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                            )}
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Значение: </span>
                              <code className="text-xs bg-white px-2 py-1 rounded border">
                                {JSON.stringify(setting.value)}
                              </code>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSetting(setting)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSetting(setting.key)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                // Показываем настройки выбранной категории
                <Card className="p-4">
                  <div className="space-y-3">
                    {groupedSettings?.[category.value]?.map((setting: any) => (
                      <div
                        key={setting.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-semibold">{setting.key}</code>
                            {setting.isPublic && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Публичная
                              </span>
                            )}
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          )}
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Значение: </span>
                            <code className="text-xs bg-white px-2 py-1 rounded border">
                              {JSON.stringify(setting.value)}
                            </code>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSetting(setting)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSetting(setting.key)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Настройки не найдены</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Диалог создания/редактирования настройки */}
      <Dialog open={isSettingFormOpen} onOpenChange={setIsSettingFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? 'Редактировать настройку' : 'Создать настройку'}
            </DialogTitle>
            <DialogDescription>
              {editingSetting
                ? 'Измените параметры настройки'
                : 'Заполните данные для новой настройки'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key">Ключ *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="app.feature.enabled"
                disabled={!!editingSetting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Уникальный идентификатор настройки (только латиница, цифры, точки и подчеркивания)
              </p>
            </div>
            <div>
              <Label htmlFor="category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Общие</SelectItem>
                  <SelectItem value="security">Безопасность</SelectItem>
                  <SelectItem value="notifications">Уведомления</SelectItem>
                  <SelectItem value="integration">Интеграции</SelectItem>
                  <SelectItem value="appearance">Внешний вид</SelectItem>
                  <SelectItem value="backup">Резервное копирование</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Значение * (JSON)</Label>
              <textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder='{"key": "value"} или "string" или 123 или true'
                className="w-full h-32 px-3 py-2 text-sm border rounded-md font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Значение в формате JSON (объект, строка, число, булево)
              </p>
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание назначения настройки"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Публичная настройка (доступна без авторизации)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingFormOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmitSetting}>
              {editingSetting ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить настройку?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Настройка будет удалена из системы.
              <br />
              <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {selectedSettingKey}
              </code>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
