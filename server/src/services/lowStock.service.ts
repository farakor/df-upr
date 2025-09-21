import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const lowStockService = {
  // Получить товары с низкими остатками
  async getLowStockItems(threshold: number = 10) {
    const lowStockItems = await prisma.stockBalance.findMany({
      where: {
        quantity: {
          lte: threshold,
          gt: 0
        }
      },
      include: {
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
        warehouse: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    });

    return {
      data: lowStockItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productArticle: item.product.article,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        quantity: item.quantity,
        unitShortName: item.product.unit.shortName,
        threshold
      })),
      total: lowStockItems.length
    };
  }
};
