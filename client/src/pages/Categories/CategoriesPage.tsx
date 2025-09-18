import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderPlus, Move, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tree, TreeNode } from '@/components/ui/tree';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { 
  useCategoryTree, 
  useDeleteCategory, 
  useMoveCategory,
  useReorderCategories 
} from '@/hooks/useCategories';
import type { Category } from '@/types/nomenclature';

interface CategoriesPageProps {}

export const CategoriesPage: React.FC<CategoriesPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [parentForNewCategory, setParentForNewCategory] = useState<Category | undefined>();
  const [draggedNodeId, setDraggedNodeId] = useState<string | number | undefined>();

  // Запросы данных
  const { data: categories, isLoading, error } = useCategoryTree();
  const deleteCategoryMutation = useDeleteCategory();
  const moveCategoryMutation = useMoveCategory();
  const reorderCategoriesMutation = useReorderCategories();

  // Преобразование категорий в формат дерева
  const treeData = useMemo(() => {
    if (!categories) return [];

    const convertToTreeNode = (category: Category): TreeNode => {
      const isExpanded = expandedNodes.has(category.id);
      const isSelected = selectedCategory?.id === category.id;
      
      return {
        id: category.id,
        label: category.name,
        data: category,
        isExpanded,
        isSelected,
        badge: category._count?.products || 0,
        children: category.children?.map(convertToTreeNode) || [],
      };
    };

    return categories.map(convertToTreeNode);
  }, [categories, expandedNodes, selectedCategory]);

  // Фильтрация дерева по поисковому запросу
  const filteredTreeData = useMemo(() => {
    if (!searchQuery.trim()) return treeData;

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node) => {
        const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterTree(node.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
            isExpanded: true, // Раскрываем все узлы при поиске
          });
        }
        
        return acc;
      }, []);
    };

    return filterTree(treeData);
  }, [treeData, searchQuery]);

  // Обработчики
  const handleToggleNode = (nodeId: string | number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleSelectNode = (node: TreeNode) => {
    setSelectedCategory(node.data as Category);
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setParentForNewCategory(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleCreateSubcategory = (node: TreeNode) => {
    setEditingCategory(undefined);
    setParentForNewCategory(node.data as Category);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (node: TreeNode) => {
    setEditingCategory(node.data as Category);
    setParentForNewCategory(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (node: TreeNode) => {
    const category = node.data as Category;
    const hasChildren = category.children && category.children.length > 0;
    const hasProducts = (category._count?.products || 0) > 0;
    
    let confirmMessage = `Вы уверены, что хотите удалить категорию "${category.name}"?`;
    
    if (hasChildren) {
      confirmMessage += '\n\nВнимание: У категории есть подкатегории!';
    }
    
    if (hasProducts) {
      confirmMessage += `\n\nВнимание: В категории ${category._count?.products} товаров!`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteCategoryMutation.mutateAsync(category.id);
        if (selectedCategory?.id === category.id) {
          setSelectedCategory(null);
        }
      } catch (error) {
        // Ошибка уже обработана в хуке
      }
    }
  };

  const handleMoveCategory = (node: TreeNode) => {
    // TODO: Реализовать модал для выбора новой родительской категории
    console.log('Move category:', node.data);
  };

  const handleCloseCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setEditingCategory(undefined);
    setParentForNewCategory(undefined);
  };

  const handleCategoryFormSuccess = () => {
    // Форма сама закроется и обновит данные через React Query
  };

  // Drag & Drop обработчики
  const handleDragStart = (node: TreeNode) => {
    setDraggedNodeId(node.id);
  };

  const handleDragOver = (e: React.DragEvent, node: TreeNode) => {
    e.preventDefault();
    // Можно добавить визуальную обратную связь
  };

  const handleDrop = async (e: React.DragEvent, targetNode: TreeNode) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetNode.id.toString()) {
      setDraggedNodeId(undefined);
      return;
    }

    try {
      const targetCategory = targetNode.data as Category;
      await moveCategoryMutation.mutateAsync({
        id: parseInt(draggedId),
        data: { parentId: targetCategory.id },
      });
    } catch (error) {
      // Ошибка уже обработана в хуке
    } finally {
      setDraggedNodeId(undefined);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки категорий</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Категории товаров</h1>
          <p className="text-gray-600">
            Управление древовидной структурой категорий
          </p>
        </div>
        <Button onClick={handleCreateCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Создать категорию
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Дерево категорий */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск категорий..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedNodes(new Set())}
                >
                  Свернуть все
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allIds = new Set<string | number>();
                    const collectIds = (nodes: TreeNode[]) => {
                      nodes.forEach(node => {
                        allIds.add(node.id);
                        if (node.children) {
                          collectIds(node.children);
                        }
                      });
                    };
                    collectIds(treeData);
                    setExpandedNodes(allIds);
                  }}
                >
                  Развернуть все
                </Button>
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner size="lg" />
                </div>
              ) : (
                <Tree
                  data={filteredTreeData}
                  onToggle={handleToggleNode}
                  onSelect={handleSelectNode}
                  onAdd={handleCreateSubcategory}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onMove={handleMoveCategory}
                  showActions={true}
                  emptyMessage={
                    searchQuery 
                      ? "Категории не найдены" 
                      : "Нет категорий. Создайте первую категорию."
                  }
                  draggedNodeId={draggedNodeId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Панель информации о выбранной категории */}
        <div>
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Информация о категории</h3>
            </div>
            <div className="p-4">
              {selectedCategory ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCategory.name}</h4>
                    {selectedCategory.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCategory.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Товаров:</span>
                      <div className="font-medium">{selectedCategory._count?.products || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Подкатегорий:</span>
                      <div className="font-medium">{selectedCategory._count?.children || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Порядок:</span>
                      <div className="font-medium">{selectedCategory.sortOrder}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Статус:</span>
                      <div className={`font-medium ${selectedCategory.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCategory.isActive ? 'Активна' : 'Неактивна'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCreateSubcategory({ id: selectedCategory.id, label: selectedCategory.name, data: selectedCategory })}
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Создать подкатегорию
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditCategory({ id: selectedCategory.id, label: selectedCategory.name, data: selectedCategory })}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDeleteCategory({ id: selectedCategory.id, label: selectedCategory.name, data: selectedCategory })}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FolderPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Выберите категорию для просмотра информации</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Форма категории */}
      <CategoryForm
        category={editingCategory}
        parentCategory={parentForNewCategory}
        isOpen={isCategoryFormOpen}
        onClose={handleCloseCategoryForm}
        onSuccess={handleCategoryFormSuccess}
      />
    </div>
  );
};
