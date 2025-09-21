import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm } from '@/components/forms/DocumentForm';
import { 
  useCreateDocument, 
  useAddDocumentItem,
  CreateDocumentData,
  AddDocumentItemData
} from '@/hooks/useDocuments';

export function TransferPage() {
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useCreateDocument();
  const addItemMutation = useAddDocumentItem();

  const handleCreateTransfer = async (documentData: CreateDocumentData, items: AddDocumentItemData[]) => {
    try {
      const document = await createMutation.mutateAsync(documentData);
      
      // Добавляем все позиции в документ
      for (const item of items) {
        await addItemMutation.mutateAsync({ documentId: document.id, data: item });
      }
      
      setIsCreating(false);
    } catch (error) {
      console.error('Ошибка при создании документа перемещения:', error);
    }
  };

  if (isCreating) {
    return (
      <div className="p-6">
        <DocumentForm
          type="TRANSFER"
          onSubmit={handleCreateTransfer}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isPending || addItemMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Перемещение товаров</h1>
        <p className="text-muted-foreground">
          Создание документов перемещения товаров между складами
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5" />
            <span>Создать перемещение</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Перемещение товаров</h3>
            <p className="text-muted-foreground mb-4">
              Создайте документ для перемещения товаров с одного склада на другой
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Создать документ перемещения
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
