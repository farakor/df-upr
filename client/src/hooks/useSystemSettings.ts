import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  category: string;
  description?: string;
  isPublic: boolean;
  updatedBy?: number;
  updatedAt: string;
  createdAt: string;
}

export const useSystemSettings = (includePrivate: boolean = false) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['settings', includePrivate],
    queryFn: async () => {
      const response = await api.get(`/settings?includePrivate=${includePrivate}`);
      return response.data.data;
    },
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['settings', 'categories'],
    queryFn: async () => {
      const response = await api.get('/settings/categories');
      return response.data.data;
    },
  });

  const upsertSetting = useMutation({
    mutationFn: async (data: {
      key: string;
      value: any;
      category: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const response = await api.post('/settings', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updateValue = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updateMultiple = useMutation({
    mutationFn: async (settings: Array<{ key: string; value: any }>) => {
      const response = await api.put('/settings', { settings });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const deleteSetting = useMutation({
    mutationFn: async (key: string) => {
      const response = await api.delete(`/settings/${key}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const exportSettings = useMutation({
    mutationFn: async () => {
      const response = await api.get('/settings/export');
      return response.data.data;
    },
  });

  const importSettings = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const response = await api.post('/settings/import', { settings });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async (category?: string) => {
      const response = await api.post('/settings/reset', { category });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings,
    categories,
    isLoading,
    upsertSetting,
    updateValue,
    updateMultiple,
    deleteSetting,
    exportSettings,
    importSettings,
    resetToDefaults,
  };
};

export const useSettingsByCategory = (category: string, includePrivate: boolean = false) => {
  return useQuery<SystemSetting[]>({
    queryKey: ['settings', 'category', category, includePrivate],
    queryFn: async () => {
      const response = await api.get(`/settings/category/${category}?includePrivate=${includePrivate}`);
      return response.data.data;
    },
    enabled: !!category,
  });
};

export const useSetting = (key: string) => {
  return useQuery<SystemSetting>({
    queryKey: ['settings', 'key', key],
    queryFn: async () => {
      const response = await api.get(`/settings/${key}`);
      return response.data.data;
    },
    enabled: !!key,
  });
};

// Отдельные хуки для мутаций
export const useUpsertSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      key: string;
      value: any;
      category: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const response = await api.post('/settings', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useDeleteSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await api.delete(`/settings/${key}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdateMultipleSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Array<{ key: string; value: any }>) => {
      const response = await api.put('/settings', { settings });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useExportSettings = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get('/settings/export');
      return response.data.data;
    },
  });
};

export const useImportSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const response = await api.post('/settings/import', { settings });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useResetSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category?: string) => {
      const response = await api.post('/settings/reset', { category });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
