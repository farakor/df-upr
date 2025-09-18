import { PrismaClient, Category, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CategoryCreateInput {
  name: string;
  parentId?: number;
  description?: string;
  sortOrder?: number;
}

export interface CategoryUpdateInput {
  name?: string;
  parentId?: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  parent?: Category;
  _count?: {
    products: number;
    children: number;
  };
}

export class CategoryService {
  async createCategory(data: CategoryCreateInput): Promise<Category> {
    try {
      // Проверяем, что родительская категория существует
      if (data.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: data.parentId },
        });
        if (!parentCategory) {
          throw new Error('Родительская категория не найдена');
        }
      }

      const category = await prisma.category.create({
        data,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Категория с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async getCategories(includeInactive = false): Promise<CategoryWithChildren[]> {
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories as CategoryWithChildren[];
  }

  async getCategoryTree(includeInactive = false): Promise<CategoryWithChildren[]> {
    const allCategories = await this.getCategories(includeInactive);
    
    // Создаем дерево категорий
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // Сначала создаем мапу всех категорий
    allCategories.forEach((category: CategoryWithChildren) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Затем строим дерево
    allCategories.forEach((category: CategoryWithChildren) => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  async getCategoryById(id: number): Promise<CategoryWithChildren | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
        products: {
          where: { isActive: true },
          include: {
            unit: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    return category as CategoryWithChildren | null;
  }

  async updateCategory(id: number, data: CategoryUpdateInput): Promise<Category> {
    try {
      // Проверяем, что не создается циклическая ссылка
      if (data.parentId) {
        const isCircular = await this.checkCircularReference(id, data.parentId);
        if (isCircular) {
          throw new Error('Нельзя установить категорию как родительскую для самой себя или её потомков');
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Категория с таким названием уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Категория не найдена');
        }
      }
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      // Проверяем, есть ли дочерние категории
      const childrenCount = await prisma.category.count({
        where: { parentId: id, isActive: true },
      });

      if (childrenCount > 0) {
        throw new Error('Нельзя удалить категорию, содержащую подкатегории');
      }

      // Проверяем, есть ли товары в категории
      const productsCount = await prisma.product.count({
        where: { categoryId: id, isActive: true },
      });

      if (productsCount > 0) {
        throw new Error('Нельзя удалить категорию, содержащую товары');
      }

      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Категория не найдена');
        }
      }
      throw error;
    }
  }

  async getCategoryPath(id: number): Promise<Category[]> {
    const path: Category[] = [];
    let currentId: number | null = id;

    while (currentId) {
      const category: Category | null = await prisma.category.findUnique({
        where: { id: currentId },
      });

      if (!category) break;

      path.unshift(category);
      currentId = category.parentId;
    }

    return path;
  }

  private async checkCircularReference(categoryId: number, parentId: number): Promise<boolean> {
    if (categoryId === parentId) {
      return true;
    }

    const parent = await prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parent || !parent.parentId) {
      return false;
    }

    return this.checkCircularReference(categoryId, parent.parentId);
  }

  async moveCategory(id: number, newParentId: number | null): Promise<Category> {
    // Проверяем циклические ссылки
    if (newParentId) {
      const isCircular = await this.checkCircularReference(id, newParentId);
      if (isCircular) {
        throw new Error('Нельзя переместить категорию в её собственную подкатегорию');
      }
    }

    return await this.updateCategory(id, { parentId: newParentId || undefined });
  }

  async reorderCategories(categoryOrders: { id: number; sortOrder: number }[]): Promise<void> {
    await prisma.$transaction(
      categoryOrders.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );
  }
}

export const categoryService = new CategoryService();
