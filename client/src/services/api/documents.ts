import { apiClient } from './client';

export interface Document {
  id: number;
  number: string;
  type: 'RECEIPT' | 'TRANSFER' | 'WRITEOFF' | 'INVENTORY_ADJUSTMENT';
  date: string;
  status: 'DRAFT' | 'APPROVED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  supplier?: {
    id: number;
    name: string;
  };
  warehouseFrom?: {
    id: number;
    name: string;
  };
  warehouseTo?: {
    id: number;
    name: string;
  };
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
  items?: DocumentItem[];
}

export interface DocumentItem {
  id: number;
  documentId: number;
  productId: number;
  quantity: number;
  unitId: number;
  price: number;
  total: number;
  expiryDate?: string;
  batchNumber?: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    article?: string;
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
    category?: {
      id: number;
      name: string;
    };
  };
  unit: {
    id: number;
    name: string;
    shortName: string;
  };
}

export interface CreateDocumentData {
  type: 'RECEIPT' | 'TRANSFER' | 'WRITEOFF' | 'INVENTORY_ADJUSTMENT';
  date: string;
  supplierId?: number;
  warehouseFromId?: number;
  warehouseToId?: number;
  notes?: string;
}

export interface UpdateDocumentData {
  date?: string;
  supplierId?: number;
  warehouseFromId?: number;
  warehouseToId?: number;
  notes?: string;
}

export interface AddDocumentItemData {
  productId: number;
  quantity: number;
  unitId: number;
  price: number;
  expiryDate?: string;
  batchNumber?: string;
}

export interface DocumentsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  warehouseId?: number;
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentsResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const documentsApi = {
  // Получить все документы
  getAll: async (params?: DocumentsQuery): Promise<DocumentsResponse> => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
  },

  // Получить документ по ID
  getById: async (id: number): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Создать документ
  create: async (data: CreateDocumentData): Promise<Document> => {
    const response = await apiClient.post('/documents', data);
    return response.data;
  },

  // Обновить документ
  update: async (id: number, data: UpdateDocumentData): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  // Удалить документ
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  // Добавить позицию в документ
  addItem: async (documentId: number, data: AddDocumentItemData): Promise<DocumentItem> => {
    const response = await apiClient.post(`/documents/${documentId}/items`, data);
    return response.data;
  },

  // Удалить позицию из документа
  removeItem: async (documentId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}/items/${itemId}`);
  },

  // Провести документ
  approve: async (id: number): Promise<Document> => {
    const response = await apiClient.post(`/documents/${id}/approve`);
    return response.data;
  },

  // Отменить проведение документа
  cancel: async (id: number): Promise<Document> => {
    const response = await apiClient.post(`/documents/${id}/cancel`);
    return response.data;
  }
};
