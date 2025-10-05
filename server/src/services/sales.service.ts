import { PrismaClient, PaymentMethod, MovementType } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateSaleData {
  warehouseId: number;
  customerName?: string;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
  items: {
    menuItemId: number;
    quantity: number;
    price?: number;
    discountPercent: number;
  }[];
}

export interface SalesFilter {
  warehouseId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  cashierId?: number;
  paymentMethod?: PaymentMethod;
  page: number;
  limit: number;
}

export interface SalesStatsFilter {
  warehouseId?: number;
  dateFrom: Date;
  dateTo: Date;
  groupBy: 'day' | 'week' | 'month' | 'cashier' | 'menuItem';
}

export interface CreateProductionLogData {
  warehouseId: number;
  recipeId: number;
  quantity: number;
  producedAt: Date;
}

export class SalesService {
  async createSale(data: CreateSaleData, cashierId: number) {
    return await prisma.$transaction(async (tx) => {
      // Генерируем номер чека
      const saleNumber = await this.generateSaleNumber();
      
      // Получаем информацию о позициях меню
      const menuItems = await tx.menuItem.findMany({
        where: {
          id: { in: data.items.map(item => item.menuItemId) },
          isActive: true,
          isAvailable: true
        },
        include: {
          menu: true,
          product: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
                      unit: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (menuItems.length !== data.items.length) {
        throw new Error('Некоторые позиции меню недоступны');
      }

      // Проверяем, что меню позиций доступны на складе
      const menuIds = [...new Set(menuItems.map(mi => mi.menuId).filter(Boolean))] as number[];
      
      if (menuIds.length > 0) {
        const activeWarehouseMenus = await tx.warehouseMenu.findMany({
          where: {
            warehouseId: data.warehouseId,
            menuId: { in: menuIds },
            isActive: true
          },
          select: { menuId: true }
        });

        const activeMenuIds = new Set(activeWarehouseMenus.map(wm => wm.menuId));

        for (const menuItem of menuItems) {
          if (menuItem.menuId && !activeMenuIds.has(menuItem.menuId)) {
            throw new Error(`Блюдо "${menuItem.name}" недоступно на данном складе`);
          }
        }
      }

      // Подготавливаем данные для создания продажи
      const saleItems = data.items.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId)!;
        const price = item.price || Number(menuItem.price);
        const discountAmount = (price * item.quantity * item.discountPercent) / 100;
        const total = (price * item.quantity) - discountAmount;

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price,
          discountPercent: item.discountPercent,
          total
        };
      });

      const totalAmount = saleItems.reduce((sum, item) => sum + Number(item.total), 0);
      const finalAmount = totalAmount - data.discountAmount;

      // Создаем продажу
      const sale = await tx.sale.create({
        data: {
          number: saleNumber,
          warehouseId: data.warehouseId,
          date: new Date(),
          totalAmount: finalAmount,
          discountAmount: data.discountAmount,
          paymentMethod: data.paymentMethod,
          cashierId,
          customerName: data.customerName,
          notes: data.notes,
          items: {
            create: saleItems
          }
        },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  product: {
                    include: {
                      recipe: true
                    }
                  }
                }
              }
            }
          },
          warehouse: true,
          cashier: true
        }
      });

      // Списываем ингредиенты по рецептурам
      for (const saleItem of sale.items) {
        if (saleItem.menuItem.product?.recipe) {
          await this.createProductionLog({
            warehouseId: data.warehouseId,
            recipeId: saleItem.menuItem.product.recipe.id,
            quantity: Number(saleItem.quantity),
            producedAt: new Date()
          }, cashierId, tx);
        }
      }

      logger.info(`Создана продажа ${sale.number} на сумму ${sale.totalAmount}`);
      return sale;
    });
  }

  async getSales(filter: SalesFilter) {
    const where: any = {};

    if (filter.warehouseId) {
      where.warehouseId = filter.warehouseId;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.date = {};
      if (filter.dateFrom) {
        where.date.gte = filter.dateFrom;
      }
      if (filter.dateTo) {
        where.date.lte = filter.dateTo;
      }
    }

    if (filter.cashierId) {
      where.cashierId = filter.cashierId;
    }

    if (filter.paymentMethod) {
      where.paymentMethod = filter.paymentMethod;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          warehouse: true,
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit
      }),
      prisma.sale.count({ where })
    ]);

    return {
      sales,
      pagination: {
        page: filter.page,
        limit: filter.limit,
        total,
        pages: Math.ceil(total / filter.limit)
      }
    };
  }

  async getSaleById(id: number) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                product: {
                  include: {
                    recipe: true
                  }
                }
              }
            }
          }
        },
        warehouse: true,
        cashier: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!sale) {
      throw new Error('Продажа не найдена');
    }

    return sale;
  }

  async getSalesStats(filter: SalesStatsFilter) {
    const where: any = {
      date: {
        gte: filter.dateFrom,
        lte: filter.dateTo
      }
    };

    if (filter.warehouseId) {
      where.warehouseId = filter.warehouseId;
    }

    switch (filter.groupBy) {
      case 'day':
        return await this.getSalesStatsByDay(where);
      case 'week':
        return await this.getSalesStatsByWeek(where);
      case 'month':
        return await this.getSalesStatsByMonth(where);
      case 'cashier':
        return await this.getSalesStatsByCashier(where);
      case 'menuItem':
        return await this.getSalesStatsByMenuItem(where);
      default:
        throw new Error('Неподдерживаемый тип группировки');
    }
  }

  async createProductionLog(
    data: CreateProductionLogData, 
    createdById: number, 
    tx?: any
  ) {
    const client = tx || prisma;

    // Получаем рецепт с ингредиентами
    const recipe = await client.recipe.findUnique({
      where: { id: data.recipeId },
      include: {
        ingredients: {
          include: {
            product: true,
            unit: true
          }
        }
      }
    });

    if (!recipe) {
      throw new Error('Рецепт не найден');
    }

    // Проверяем наличие ингредиентов на складе
    for (const ingredient of recipe.ingredients) {
      const requiredQuantity = Number(ingredient.quantity) * data.quantity;
      
      const stockBalance = await client.stockBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: data.warehouseId,
            productId: ingredient.productId
          }
        }
      });

      if (!stockBalance || Number(stockBalance.quantity) < requiredQuantity) {
        throw new Error(
          `Недостаточно ингредиента "${ingredient.product.name}" на складе. ` +
          `Требуется: ${requiredQuantity}, доступно: ${stockBalance?.quantity || 0}`
        );
      }
    }

    // Рассчитываем общую стоимость
    let totalCost = 0;
    const productionLogItems = [];

    for (const ingredient of recipe.ingredients) {
      const quantityUsed = Number(ingredient.quantity) * data.quantity;
      const stockBalance = await client.stockBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: data.warehouseId,
            productId: ingredient.productId
          }
        }
      });

      const unitPrice = Number(stockBalance!.avgPrice);
      const itemCost = quantityUsed * unitPrice;
      totalCost += itemCost;

      productionLogItems.push({
        productId: ingredient.productId,
        quantityUsed,
        unitPrice,
        totalCost: itemCost
      });
    }

    // Создаем лог производства
    const productionLog = await client.productionLog.create({
      data: {
        warehouseId: data.warehouseId,
        recipeId: data.recipeId,
        quantity: data.quantity,
        totalCost,
        producedAt: data.producedAt,
        createdById,
        items: {
          create: productionLogItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        recipe: true
      }
    });

    // Списываем ингредиенты со склада
    for (const ingredient of recipe.ingredients) {
      const quantityUsed = Number(ingredient.quantity) * data.quantity;
      
      // Создаем движение товара
      await client.stockMovement.create({
        data: {
          warehouseId: data.warehouseId,
          productId: ingredient.productId,
          type: MovementType.PRODUCTION_USE,
          quantity: -quantityUsed,
          price: 0
        }
      });
    }

    logger.info(`Создан лог производства для рецепта ${recipe.name}, количество: ${data.quantity}`);
    return productionLog;
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastSale = await prisma.sale.findFirst({
      where: {
        number: {
          startsWith: `S${dateStr}`
        }
      },
      orderBy: { number: 'desc' }
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastNumber = parseInt(lastSale.number.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `S${dateStr}${nextNumber.toString().padStart(4, '0')}`;
  }

  private async getSalesStatsByDay(where: any) {
    const result = await prisma.sale.groupBy({
      by: ['date'],
      where,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    return result.map(item => ({
      period: item.date.toISOString().slice(0, 10),
      totalAmount: Number(item._sum.totalAmount || 0),
      salesCount: item._count.id
    }));
  }

  private async getSalesStatsByWeek(where: any) {
    // Реализация группировки по неделям
    const sales = await prisma.sale.findMany({
      where,
      select: {
        date: true,
        totalAmount: true
      }
    });

    const weeklyStats = new Map();
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      
      if (!weeklyStats.has(weekKey)) {
        weeklyStats.set(weekKey, { totalAmount: 0, salesCount: 0 });
      }
      
      const stats = weeklyStats.get(weekKey);
      stats.totalAmount += Number(sale.totalAmount);
      stats.salesCount += 1;
    });

    return Array.from(weeklyStats.entries()).map(([period, stats]) => ({
      period,
      totalAmount: stats.totalAmount,
      salesCount: stats.salesCount
    }));
  }

  private async getSalesStatsByMonth(where: any) {
    // Реализация группировки по месяцам
    const sales = await prisma.sale.findMany({
      where,
      select: {
        date: true,
        totalAmount: true
      }
    });

    const monthlyStats = new Map();
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, { totalAmount: 0, salesCount: 0 });
      }
      
      const stats = monthlyStats.get(monthKey);
      stats.totalAmount += Number(sale.totalAmount);
      stats.salesCount += 1;
    });

    return Array.from(monthlyStats.entries()).map(([period, stats]) => ({
      period,
      totalAmount: stats.totalAmount,
      salesCount: stats.salesCount
    }));
  }

  private async getSalesStatsByCashier(where: any) {
    const result = await prisma.sale.groupBy({
      by: ['cashierId'],
      where,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const cashierIds = result.map(item => item.cashierId).filter((id): id is number => id !== null);
    const cashiers = await prisma.user.findMany({
      where: { id: { in: cashierIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    return result.map(item => {
      const cashier = cashiers.find(c => c.id === item.cashierId);
      return {
        cashierId: item.cashierId,
        cashierName: cashier ? `${cashier.firstName} ${cashier.lastName}` : 'Неизвестно',
        totalAmount: Number(item._sum.totalAmount || 0),
        salesCount: item._count.id
      };
    });
  }

  private async getSalesStatsByMenuItem(where: any) {
    const result = await prisma.saleItem.groupBy({
      by: ['menuItemId'],
      where: {
        sale: where
      },
      _sum: {
        quantity: true,
        total: true
      },
      _count: {
        id: true
      }
    });

    const menuItemIds = result.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true }
    });

    return result.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem?.name || 'Неизвестно',
        totalQuantity: Number(item._sum.quantity || 0),
        totalAmount: Number(item._sum.total || 0),
        salesCount: item._count.id
      };
    });
  }

  async getAvailableMenuForWarehouse(warehouseId: number) {
    // Получаем активные меню для склада
    const warehouseMenus = await prisma.warehouseMenu.findMany({
      where: {
        warehouseId,
        isActive: true
      },
      select: { menuId: true }
    });

    const activeMenuIds = warehouseMenus.map(wm => wm.menuId);

    if (activeMenuIds.length === 0) {
      return [];
    }

    // Получаем доступные позиции меню из активных меню
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
        isAvailable: true,
        menuId: { in: activeMenuIds }
      },
      include: {
        category: true,
        product: {
          include: {
            unit: true,
            recipe: {
              include: {
                ingredients: {
                  include: {
                    product: {
                      include: {
                        unit: true
                      }
                    },
                    unit: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Проверяем доступность ингредиентов для каждого блюда
    const availableMenuItems = [];

    for (const menuItem of menuItems) {
      let isAvailable = true;
      let availabilityInfo = null;

      if (menuItem.product?.recipe) {
        // Проверяем наличие ингредиентов
        const ingredientAvailability = [];

        for (const ingredient of menuItem.product.recipe.ingredients) {
          const stockBalance = await prisma.stockBalance.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId,
                productId: ingredient.productId
              }
            }
          });

          const availableQuantity = stockBalance ? Number(stockBalance.quantity) : 0;
          const requiredQuantity = Number(ingredient.quantity);
          const maxPortions = availableQuantity > 0 ? Math.floor(availableQuantity / requiredQuantity) : 0;

          ingredientAvailability.push({
            productName: ingredient.product.name,
            required: requiredQuantity,
            available: availableQuantity,
            maxPortions
          });

          if (maxPortions === 0) {
            isAvailable = false;
          }
        }

        availabilityInfo = {
          maxPortions: Math.min(...ingredientAvailability.map(i => i.maxPortions)),
          ingredients: ingredientAvailability
        };
      }

      availableMenuItems.push({
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        price: Number(menuItem.price),
        costPrice: menuItem.costPrice,
        imageUrl: menuItem.imageUrl,
        category: menuItem.category,
        isAvailable,
        availabilityInfo,
        sortOrder: menuItem.sortOrder
      });
    }

    // Группируем по категориям
    const categorizedMenu = new Map();

    availableMenuItems.forEach(item => {
      const categoryName = item.category?.name || 'Без категории';
      if (!categorizedMenu.has(categoryName)) {
        categorizedMenu.set(categoryName, {
          id: item.category?.id || null,
          name: categoryName,
          sortOrder: item.category?.sortOrder || 999,
          items: []
        });
      }
      categorizedMenu.get(categoryName).items.push(item);
    });

    return Array.from(categorizedMenu.values())
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
