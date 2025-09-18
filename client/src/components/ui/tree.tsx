import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2, Move } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/utils/cn';

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  data?: any;
  isExpanded?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onToggle?: (nodeId: string | number) => void;
  onSelect?: (node: TreeNode) => void;
  onAdd?: (parentNode: TreeNode) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onMove?: (node: TreeNode) => void;
  showActions?: boolean;
  isDragging?: boolean;
  onDragStart?: (node: TreeNode) => void;
  onDragOver?: (e: React.DragEvent, node: TreeNode) => void;
  onDrop?: (e: React.DragEvent, targetNode: TreeNode) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  level,
  onToggle,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  showActions = false,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded ?? false;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle?.(node.id);
    }
  };

  const handleSelect = () => {
    if (!node.isDisabled) {
      onSelect?.(node);
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id.toString());
    onDragStart?.(node);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(e, node);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.(e, node);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors',
          'hover:bg-gray-100',
          node.isSelected && 'bg-blue-100 text-blue-900',
          node.isDisabled && 'opacity-50 cursor-not-allowed',
          isDragging && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={!node.isDisabled}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Иконка раскрытия/сворачивания */}
        <div className="w-4 h-4 mr-1 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="hover:bg-gray-200 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-3 h-3" />
          )}
        </div>

        {/* Иконка папки или кастомная иконка */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {node.icon || (
            hasChildren ? (
              isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            )
          )}
        </div>

        {/* Название */}
        <span className="flex-1 text-sm truncate">
          {node.label}
        </span>

        {/* Бейдж */}
        {node.badge && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
            {node.badge}
          </span>
        )}

        {/* Действия */}
        {showActions && isHovered && !node.isDisabled && (
          <div className="ml-2 flex items-center gap-1">
            {onAdd && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => handleAction(e, () => onAdd(node))}
                title="Добавить подкатегорию"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => handleAction(e, () => onEdit(node))}
                title="Редактировать"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            {onMove && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => handleAction(e, () => onMove(node))}
                title="Переместить"
              >
                <Move className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => handleAction(e, () => onDelete(node))}
                title="Удалить"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Дочерние элементы */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              showActions={showActions}
              isDragging={isDragging}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export interface TreeProps {
  data: TreeNode[];
  onToggle?: (nodeId: string | number) => void;
  onSelect?: (node: TreeNode) => void;
  onAdd?: (parentNode: TreeNode) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onMove?: (node: TreeNode) => void;
  showActions?: boolean;
  className?: string;
  emptyMessage?: string;
  draggedNodeId?: string | number;
  onDragStart?: (node: TreeNode) => void;
  onDragOver?: (e: React.DragEvent, node: TreeNode) => void;
  onDrop?: (e: React.DragEvent, targetNode: TreeNode) => void;
}

export const Tree: React.FC<TreeProps> = ({
  data,
  onToggle,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  showActions = false,
  className,
  emptyMessage = 'Нет данных для отображения',
  draggedNodeId,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          onToggle={onToggle}
          onSelect={onSelect}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          showActions={showActions}
          isDragging={draggedNodeId === node.id}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};
