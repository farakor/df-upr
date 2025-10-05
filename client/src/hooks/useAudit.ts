import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditFilters {
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useAuditLogs = (filters?: AuditFilters) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit', 'logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId.toString());
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.entityId) params.append('entityId', filters.entityId.toString());
      if (filters?.action) params.append('action', filters.action);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/audit?${params.toString()}`);
      return {
        logs: response.data.logs,
        pagination: response.data.pagination,
      };
    },
  });
};

export const useUserAuditLogs = (userId: number, page: number = 1, limit: number = 50) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit', 'user', userId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/audit/user/${userId}?page=${page}&limit=${limit}`);
      return {
        logs: response.data.logs,
        pagination: response.data.pagination,
      };
    },
    enabled: !!userId,
  });
};

export const useEntityAuditLogs = (
  entityType: string,
  entityId: number,
  page: number = 1,
  limit: number = 50
) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit', 'entity', entityType, entityId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/audit/entity/${entityType}/${entityId}?page=${page}&limit=${limit}`);
      return {
        logs: response.data.logs,
        pagination: response.data.pagination,
      };
    },
    enabled: !!(entityType && entityId),
  });
};

export const useAuditStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['audit', 'stats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/audit/stats?${params.toString()}`);
      return response.data.data;
    },
  });
};

