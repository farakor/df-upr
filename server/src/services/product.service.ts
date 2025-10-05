import { PrismaClient, Product, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductCreateInput {
  name: string;
  article?: string;
  barcode?: string;
  categoryId?: number;
  unitId: number;
  recipeId?: number;
  shelfLifeDays?: number;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
  storageConditions?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductUpdateInput {
  name?: string;
  article?: string;
  barcode?: string;
  categoryId?: number;
  unitId?: number;
  recipeId?: number;
  shelfLifeDays?: number;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
  storageConditions?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  unitId?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  async createProduct(data: ProductCreateInput): Promise<Product> {
    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          storageTemperatureMin: data.storageTemperatureMin ? new Prisma.Decimal(data.storageTemperatureMin) : null,
          storageTemperatureMax: data.storageTemperatureMax ? new Prisma.Decimal(data.storageTemperatureMax) : null,
        },
        include: {
          category: true,
          unit: true,
          recipe: {
            include: {
              ingredients: {
                include: {
                  product: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Товар с таким артикулом уже существует');
        }
      }
      throw error;
    }
  }

  async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = pagination;
    const { search, categoryId, isActive, unitId } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(categoryId && { categoryId }),
      ...(unitId && { unitId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { article: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          unit: true,
          recipe: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        recipe: {
          include: {
            ingredients: {
              include: {
                product: true,
                unit: true,
              },
            },
          },
        },
        stockBalances: {
          include: {
            warehouse: true,
          },
        },
      },
    });
  }

  async updateProduct(id: number, data: ProductUpdateInput): Promise<Product> {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...data,
          storageTemperatureMin: data.storageTemperatureMin ? new Prisma.Decimal(data.storageTemperatureMin) : undefined,
          storageTemperatureMax: data.storageTemperatureMax ? new Prisma.Decimal(data.storageTemperatureMax) : undefined,
        },
        include: {
          category: true,
          unit: true,
          recipe: true,
        },
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Товар с таким артикулом уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Товар не найден');
        }
      }
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Товар не найден');
        }
      }
      throw error;
    }
  }

  async getProductByArticle(article: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { article },
      include: {
        category: true,
        unit: true,
        recipe: true,
      },
    });
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        unit: true,
        recipe: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async bulkCreateProducts(products: ProductCreateInput[]): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const productData of products) {
      try {
        await this.createProduct(productData);
        created++;
      } catch (error) {
        errors.push(`Ошибка создания товара "${productData.name}": ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }

    return { created, errors };
  }
}

export const productService = new ProductService();
