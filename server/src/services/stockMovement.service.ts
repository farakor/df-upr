import { PrismaClient, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

export const stockMovementService = {
  // Получить все движения товаров с фильтрацией
  async getAll(options: {
    page: number;
    limit: number;
    warehouseId?: number;
    productId?: number;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, limit, warehouseId, productId, type, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(warehouseId && { warehouseId }),
      ...(productId && { productId }),
      ...(type && { type: type as MovementType }),
      ...(dateFrom && dateTo && {
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      })
    };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          warehouse: {
            select: {
              id: true,
              name: true
            }
          },
          product: {
            include: {
              unit: {
                select: {
                  id: true,
                  name: true,
                  shortName: true
                }
              }
            }
          },
          document: {
            select: {
              id: true,
              number: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ]);

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
};
