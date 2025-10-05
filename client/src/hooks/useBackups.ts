import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface Backup {
  id: number;
  filename: string;
  size: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  type: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED';
  startedAt: string;
  completedAt?: string;
  error?: string;
  createdById?: number;
  createdAt: string;
  createdBy?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface BackupsResponse {
  backups: Backup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useBackups = (page: number = 1, limit: number = 20) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<BackupsResponse>({
    queryKey: ['backups', page, limit],
    queryFn: async () => {
      const response = await api.get(`/backups?page=${page}&limit=${limit}`);
      return {
        backups: response.data.backups,
        pagination: response.data.pagination,
      };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['backups', 'stats'],
    queryFn: async () => {
      const response = await api.get('/backups/stats');
      return response.data.data;
    },
  });

  const createBackup = useMutation({
    mutationFn: async (type?: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED') => {
      const response = await api.post('/backups', { type });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const restoreBackup = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/backups/${id}/restore`);
      return response.data;
    },
  });

  const deleteBackup = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/backups/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const cleanOldBackups = useMutation({
    mutationFn: async (daysToKeep: number = 30) => {
      const response = await api.post('/backups/clean', { daysToKeep });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  return {
    backups: data?.backups,
    pagination: data?.pagination,
    stats,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
  };
};

export const useBackup = (id: number) => {
  return useQuery<Backup>({
    queryKey: ['backups', id],
    queryFn: async () => {
      const response = await api.get(`/backups/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Отдельные хуки для мутаций
export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (type?: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED') => {
      const response = await api.post('/backups', { type: type || 'MANUAL' });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
};

export const useDeleteBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/backups/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
};

export const useDownloadBackup = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.get(`/backups/${id}/download`, {
        responseType: 'blob',
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${id}_${new Date().toISOString()}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/backups/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
};
