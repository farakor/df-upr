import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm } from '@/components/forms/DocumentForm';
import { 
  useCreateDocument, 
  useAddDocumentItem,
  CreateDocumentData,
  AddDocumentItemData
} from '@/hooks/useDocuments';

export function WriteoffPage() {
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useCreateDocument();
  const addItemMutation = useAddDocumentItem();

  const handleCreateWriteoff = async (documentData: CreateDocumentData, items: AddDocumentItemData[]) => {
    try {
      const document = await createMutation.mutateAsync(documentData);
      
      // Добавляем все позиции в документ
      for (const item of items) {
        await addItemMutation.mutateAsync({ documentId: document.id, data: item });
      }
      
      setIsCreating(false);
    } catch (error) {
      console.error('Ошибка при создании документа списания:', error);
    }
  };

  if (isCreating) {
    return (
      <div className="p-6">
        <DocumentForm
          type="WRITEOFF"
          onSubmit={handleCreateWriteoff}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isPending || addItemMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Списание товаров</h1>
        <p className="text-muted-foreground">
          Создание документов списания товаров со склада
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Создать списание</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Списание товаров</h3>
            <p className="text-muted-foreground mb-4">
              Создайте документ для списания товаров со склада (порча, брак, истечение срока годности)
            </p>
            <Button onClick={() => setIsCreating(true)} variant="destructive">
              Создать документ списания
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
