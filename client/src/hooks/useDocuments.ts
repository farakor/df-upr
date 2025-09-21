import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  documentsApi, 
  Document, 
  DocumentItem,
  CreateDocumentData, 
  UpdateDocumentData,
  AddDocumentItemData,
  DocumentsQuery 
} from '@/services/api/documents';

// Получить все документы
export const useDocuments = (params?: DocumentsQuery) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.getAll(params),
    staleTime: 30000, // 30 секунд
  });
};

// Получить документ по ID
export const useDocument = (id: number) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
};

// Создать документ
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Документ успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при создании документа');
    },
  });
};

// Обновить документ
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDocumentData }) =>
      documentsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
      toast.success('Документ успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении документа');
    },
  });
};

// Удалить документ
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Документ успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при удалении документа');
    },
  });
};

// Добавить позицию в документ
export const useAddDocumentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: AddDocumentItemData }) =>
      documentsApi.addItem(documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
      toast.success('Позиция добавлена в документ');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при добавлении позиции');
    },
  });
};

// Удалить позицию из документа
export const useRemoveDocumentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, itemId }: { documentId: number; itemId: number }) =>
      documentsApi.removeItem(documentId, itemId),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
      toast.success('Позиция удалена из документа');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при удалении позиции');
    },
  });
};

// Провести документ
export const useApproveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.approve,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
      toast.success('Документ успешно проведен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при проведении документа');
    },
  });
};

// Отменить проведение документа
export const useCancelDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.cancel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
      toast.success('Проведение документа отменено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка при отмене проведения документа');
    },
  });
};

// Экспорт типов
export type { Document, DocumentItem, CreateDocumentData, UpdateDocumentData, AddDocumentItemData };
