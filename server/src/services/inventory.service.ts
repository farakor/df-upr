import { PrismaClient, Inventory, InventoryItem, InventoryStatus, DocumentType } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateInventoryData {
  warehouseId: number;
  date: Date;
  responsiblePersonId?: number;
  notes?: string;
  createdById?: number;
}

export interface UpdateInventoryData {
  date?: Date;
  responsiblePersonId?: number;
  notes?: string;
  status?: InventoryStatus;
}

export interface CreateInventoryItemData {
  productId: number;
  expectedQuantity: number;
  actualQuantity?: number;
  price: number;
  notes?: string;
}

export interface UpdateInventoryItemData {
  actualQuantity?: number;
  notes?: string;
  countedById?: number;
}

export interface InventoryFilters {
  warehouseId?: number;
  status?: InventoryStatus;
  dateFrom?: Date;
  dateTo?: Date;
  responsiblePersonId?: number;
  page?: number;
  limit?: number;
}

export interface GenerateSheetOptions {
  warehouseId: number;
  categoryIds?: number[];
  productIds?: number[];
  includeZeroBalances?: boolean;
}

export interface VarianceAnalysis {
  totalItems: number;
  itemsWithVariance: number;
  totalVarianceValue: number;
  surplusValue: number;
  shortageValue: number;
  items: InventoryVarianceItem[];
}

export interface InventoryVarianceItem {
  id: number;
  productId: number;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  quantityVariance: number;
  price: number;
  valueVariance: number;
  variancePercent: number;
}

class InventoryService {
  // Создание инвентаризации
  async createInventory(data: CreateInventoryData): Promise<Inventory> {
    try {
      // Генерируем номер инвентаризации
      const number = await this.generateInventoryNumber();

      const inventory = await prisma.inventory.create({
        data: {
          ...data,
          number,
          status: 'DRAFT',
        },
        include: {
          warehouse: true,
          responsiblePerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Создана инвентаризация ${inventory.number} для склада ${inventory.warehouse.name}`);
      return inventory;
    } catch (error) {
      logger.error('Ошибка при создании инвентаризации:', error);
      throw error;
    }
  }

  // Получение списка инвентаризаций
  async getInventories(filters: InventoryFilters = {}) {
    try {
      const {
        warehouseId,
        status,
        dateFrom,
        dateTo,
        responsiblePersonId,
        page = 1,
        limit = 20,
      } = filters;

      const where: any = {};

      if (warehouseId) where.warehouseId = warehouseId;
      if (status) where.status = status;
      if (responsiblePersonId) where.responsiblePersonId = responsiblePersonId;
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = dateFrom;
        if (dateTo) where.date.lte = dateTo;
      }

      const [inventories, total] = await Promise.all([
        prisma.inventory.findMany({
          where,
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
            responsiblePerson: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.inventory.count({ where }),
      ]);

      return {
        inventories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Ошибка при получении списка инвентаризаций:', error);
      throw error;
    }
  }

  // Получение инвентаризации по ID
  async getInventoryById(id: number): Promise<Inventory | null> {
    try {
      return await prisma.inventory.findUnique({
        where: { id },
        include: {
          warehouse: true,
          responsiblePerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
              countedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              product: {
                name: 'asc',
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error('Ошибка при получении инвентаризации:', error);
      throw error;
    }
  }

  // Обновление инвентаризации
  async updateInventory(id: number, data: UpdateInventoryData): Promise<Inventory> {
    try {
      const inventory = await prisma.inventory.update({
        where: { id },
        data,
        include: {
          warehouse: true,
          responsiblePerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Обновлена инвентаризация ${inventory.number}`);
      return inventory;
    } catch (error) {
      logger.error('Ошибка при обновлении инвентаризации:', error);
      throw error;
    }
  }

  // Генерация инвентаризационной ведомости
  async generateInventorySheet(options: GenerateSheetOptions) {
    try {
      const { warehouseId, categoryIds, productIds, includeZeroBalances = false } = options;

      const where: any = {
        warehouseId,
      };

      if (!includeZeroBalances) {
        where.quantity = { gt: 0 };
      }

      if (categoryIds?.length || productIds?.length) {
        where.product = {};
        if (categoryIds?.length) {
          where.product.categoryId = { in: categoryIds };
        }
        if (productIds?.length) {
          where.product.id = { in: productIds };
        }
      }

      const stockBalances = await prisma.stockBalance.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
        },
        orderBy: [
          {
            product: {
              category: {
                name: 'asc',
              },
            },
          },
          {
            product: {
              name: 'asc',
            },
          },
        ],
      });

      return stockBalances.map((balance) => ({
        productId: balance.productId,
        productName: balance.product.name,
        categoryName: balance.product.category?.name || 'Без категории',
        unitName: balance.product.unit.shortName,
        expectedQuantity: balance.quantity,
        price: balance.avgPrice,
        totalValue: balance.totalValue,
      }));
    } catch (error) {
      logger.error('Ошибка при генерации инвентаризационной ведомости:', error);
      throw error;
    }
  }

  // Создание инвентаризации с позициями из остатков
  async createInventoryFromBalances(data: CreateInventoryData & GenerateSheetOptions): Promise<Inventory> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Создаем инвентаризацию
        const number = await this.generateInventoryNumber();
        const inventory = await tx.inventory.create({
          data: {
            warehouseId: data.warehouseId,
            date: data.date,
            responsiblePersonId: data.responsiblePersonId,
            notes: data.notes,
            createdById: data.createdById,
            number,
            status: 'DRAFT',
          },
        });

        // Получаем остатки для создания позиций
        const sheet = await this.generateInventorySheet({
          warehouseId: data.warehouseId,
          categoryIds: data.categoryIds,
          productIds: data.productIds,
          includeZeroBalances: data.includeZeroBalances,
        });

        // Создаем позиции инвентаризации
        if (sheet.length > 0) {
          await tx.inventoryItem.createMany({
            data: sheet.map((item) => ({
              inventoryId: inventory.id,
              productId: item.productId,
              expectedQuantity: item.expectedQuantity,
              price: item.price,
            })),
          });
        }

        logger.info(`Создана инвентаризация ${inventory.number} с ${sheet.length} позициями`);
        return inventory;
      });
    } catch (error) {
      logger.error('Ошибка при создании инвентаризации с позициями:', error);
      throw error;
    }
  }

  // Добавление позиции в инвентаризацию
  async addInventoryItem(inventoryId: number, data: CreateInventoryItemData): Promise<InventoryItem> {
    try {
      const item = await prisma.inventoryItem.create({
        data: {
          inventoryId,
          ...data,
        },
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
        },
      });

      logger.info(`Добавлена позиция ${item.product.name} в инвентаризацию ${inventoryId}`);
      return item;
    } catch (error) {
      logger.error('Ошибка при добавлении позиции в инвентаризацию:', error);
      throw error;
    }
  }

  // Обновление позиции инвентаризации
  async updateInventoryItem(id: number, data: UpdateInventoryItemData): Promise<InventoryItem> {
    try {
      const updateData: any = { ...data };
      
      if (data.actualQuantity !== undefined) {
        updateData.countedAt = new Date();
      }

      const item = await prisma.inventoryItem.update({
        where: { id },
        data: updateData,
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
        },
      });

      logger.info(`Обновлена позиция ${item.product.name} в инвентаризации`);
      return item;
    } catch (error) {
      logger.error('Ошибка при обновлении позиции инвентаризации:', error);
      throw error;
    }
  }

  // Массовое обновление позиций
  async bulkUpdateInventoryItems(items: Array<{ id: number; actualQuantity: number; notes?: string; countedById?: number }>) {
    try {
      const results = await Promise.all(
        items.map((item) =>
          prisma.inventoryItem.update({
            where: { id: item.id },
            data: {
              actualQuantity: item.actualQuantity,
              notes: item.notes,
              countedById: item.countedById,
              countedAt: new Date(),
            },
          })
        )
      );

      logger.info(`Массово обновлено ${results.length} позиций инвентаризации`);
      return results;
    } catch (error) {
      logger.error('Ошибка при массовом обновлении позиций:', error);
      throw error;
    }
  }

  // Анализ расхождений
  async analyzeVariances(inventoryId: number, varianceThreshold = 0): Promise<VarianceAnalysis> {
    try {
      const items = await prisma.inventoryItem.findMany({
        where: {
          inventoryId,
          actualQuantity: { not: null },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const varianceItems: InventoryVarianceItem[] = items.map((item) => {
        const expectedQuantity = Number(item.expectedQuantity);
        const actualQuantity = Number(item.actualQuantity || 0);
        const price = Number(item.price);
        
        const quantityVariance = actualQuantity - expectedQuantity;
        const valueVariance = quantityVariance * price;
        const variancePercent = expectedQuantity > 0 ? (quantityVariance / expectedQuantity) * 100 : 0;

        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          expectedQuantity,
          actualQuantity,
          quantityVariance,
          price,
          valueVariance,
          variancePercent,
        };
      });

      // Фильтруем по порогу расхождения
      const filteredItems = varianceThreshold > 0 
        ? varianceItems.filter(item => Math.abs(item.variancePercent) >= varianceThreshold)
        : varianceItems;

      const itemsWithVariance = varianceItems.filter(item => item.quantityVariance !== 0);
      const totalVarianceValue = varianceItems.reduce((sum, item) => sum + item.valueVariance, 0);
      const surplusValue = varianceItems.reduce((sum, item) => sum + (item.valueVariance > 0 ? item.valueVariance : 0), 0);
      const shortageValue = varianceItems.reduce((sum, item) => sum + (item.valueVariance < 0 ? Math.abs(item.valueVariance) : 0), 0);

      return {
        totalItems: items.length,
        itemsWithVariance: itemsWithVariance.length,
        totalVarianceValue,
        surplusValue,
        shortageValue,
        items: filteredItems,
      };
    } catch (error) {
      logger.error('Ошибка при анализе расхождений:', error);
      throw error;
    }
  }

  // Создание корректировочных документов
  async createAdjustmentDocuments(inventoryId: number, userId?: number) {
    try {
      const analysis = await this.analyzeVariances(inventoryId);
      const inventory = await this.getInventoryById(inventoryId);
      
      if (!inventory) {
        throw new Error('Инвентаризация не найдена');
      }

      const itemsWithVariance = analysis.items.filter(item => item.quantityVariance !== 0);
      
      if (itemsWithVariance.length === 0) {
        return { message: 'Расхождений не найдено, корректировочные документы не созданы' };
      }

      return await prisma.$transaction(async (tx) => {
        const documents = [];

        // Получаем информацию о товарах для правильного unitId
        const productIds = itemsWithVariance.map(item => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, unitId: true },
        });
        const productUnitMap = new Map(products.map(p => [p.id, p.unitId]));

        // Группируем по типу расхождения (излишки/недостачи)
        const surplusItems = itemsWithVariance.filter(item => item.quantityVariance > 0);
        const shortageItems = itemsWithVariance.filter(item => item.quantityVariance < 0);

        // Создаем документ для излишков
        if (surplusItems.length > 0) {
          const surplusDocNumber = await this.generateDocumentNumber('INVENTORY_ADJUSTMENT');
          const surplusDoc = await tx.document.create({
            data: {
              number: surplusDocNumber,
              type: 'INVENTORY_ADJUSTMENT',
              date: new Date(),
              warehouseToId: inventory.warehouseId,
              status: 'DRAFT',
              notes: `Корректировка по инвентаризации ${inventory.number} - излишки`,
              createdById: userId,
              totalAmount: surplusItems.reduce((sum, item) => sum + item.valueVariance, 0),
            },
          });

          // Создаем позиции документа для излишков
          await tx.documentItem.createMany({
            data: surplusItems.map(item => ({
              documentId: surplusDoc.id,
              productId: item.productId,
              quantity: item.quantityVariance,
              unitId: productUnitMap.get(item.productId) || 1,
              price: item.price,
              total: item.valueVariance,
            })),
          });

          documents.push(surplusDoc);
        }

        // Создаем документ для недостач
        if (shortageItems.length > 0) {
          const shortageDocNumber = await this.generateDocumentNumber('INVENTORY_ADJUSTMENT');
          const shortageDoc = await tx.document.create({
            data: {
              number: shortageDocNumber,
              type: 'INVENTORY_ADJUSTMENT',
              date: new Date(),
              warehouseFromId: inventory.warehouseId,
              status: 'DRAFT',
              notes: `Корректировка по инвентаризации ${inventory.number} - недостачи`,
              createdById: userId,
              totalAmount: Math.abs(shortageItems.reduce((sum, item) => sum + item.valueVariance, 0)),
            },
          });

          // Создаем позиции документа для недостач
          await tx.documentItem.createMany({
            data: shortageItems.map(item => ({
              documentId: shortageDoc.id,
              productId: item.productId,
              quantity: Math.abs(item.quantityVariance),
              unitId: productUnitMap.get(item.productId) || 1,
              price: item.price,
              total: Math.abs(item.valueVariance),
            })),
          });

          documents.push(shortageDoc);
        }

        logger.info(`Созданы корректировочные документы для инвентаризации ${inventory.number}: ${documents.length} документов`);
        return documents;
      });
    } catch (error) {
      logger.error('Ошибка при создании корректировочных документов:', error);
      throw error;
    }
  }

  // Утверждение инвентаризации
  async approveInventory(id: number, userId?: number): Promise<Inventory> {
    try {
      const inventory = await prisma.inventory.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          warehouse: true,
        },
      });

      logger.info(`Утверждена инвентаризация ${inventory.number}`);
      return inventory;
    } catch (error) {
      logger.error('Ошибка при утверждении инвентаризации:', error);
      throw error;
    }
  }

  // Удаление инвентаризации
  async deleteInventory(id: number): Promise<void> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { id },
        select: { number: true, status: true },
      });

      if (!inventory) {
        throw new Error('Инвентаризация не найдена');
      }

      if (inventory.status === 'APPROVED') {
        throw new Error('Нельзя удалить утвержденную инвентаризацию');
      }

      await prisma.inventory.delete({
        where: { id },
      });

      logger.info(`Удалена инвентаризация ${inventory.number}`);
    } catch (error) {
      logger.error('Ошибка при удалении инвентаризации:', error);
      throw error;
    }
  }

  // Генерация номера инвентаризации
  private async generateInventoryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ИНВ-${year}-`;
    
    const lastInventory = await prisma.inventory.findFirst({
      where: {
        number: {
          startsWith: prefix,
        },
      },
      orderBy: {
        number: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastInventory) {
      const lastNumber = parseInt(lastInventory.number.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // Генерация номера документа
  private async generateDocumentNumber(type: DocumentType): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${type}-${year}-`;
    
    const lastDocument = await prisma.document.findFirst({
      where: {
        number: {
          startsWith: prefix,
        },
      },
      orderBy: {
        number: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastDocument) {
      const lastNumber = parseInt(lastDocument.number.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}

export const inventoryService = new InventoryService();
