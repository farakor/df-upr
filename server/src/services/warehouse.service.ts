import { PrismaClient, Warehouse, WarehouseType } from '@prisma/client';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../validation/warehouse.validation';

const prisma = new PrismaClient();

export const warehouseService = {
  // Получить все склады
  async getAll(): Promise<Warehouse[]> {
    return await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            stockBalances: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  // Получить склад по ID
  async getById(id: number) {
    return await prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            stockBalances: true,
            stockMovements: true
          }
        }
      }
    });
  },

  // Создать новый склад
  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    return await prisma.warehouse.create({
      data: {
        name: data.name,
        type: data.type as WarehouseType,
        address: data.address,
        phone: data.phone,
        managerId: data.managerId
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  },

  // Обновить склад
  async update(id: number, data: UpdateWarehouseDto) {
    try {
      return await prisma.warehouse.update({
        where: { id },
        data: {
          name: data.name,
          type: data.type as WarehouseType,
          address: data.address,
          phone: data.phone,
          managerId: data.managerId
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      return null;
    }
  },

  // Удалить склад (мягкое удаление)
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.warehouse.update({
        where: { id },
        data: { isActive: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Получить остатки по складу с пагинацией и поиском
  async getStockBalances(
    warehouseId: number, 
    options: {
      page: number;
      limit: number;
      search?: string;
    }
  ) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      warehouseId,
      quantity: { gt: 0 },
      ...(search && {
        product: {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      })
    };

    const [balances, total] = await Promise.all([
      prisma.stockBalance.findMany({
        where,
        include: {
          product: {
            include: {
              unit: true,
              category: true
            }
          }
        },
        orderBy: [
          { product: { name: 'asc' } }
        ],
        skip,
        take: limit
      }),
      prisma.stockBalance.count({ where })
    ]);

    return {
      data: balances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Проверить существование склада
  async exists(id: number): Promise<boolean> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id, isActive: true }
    });
    return !!warehouse;
  }
};
