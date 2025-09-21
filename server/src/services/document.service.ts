import { PrismaClient, Document, DocumentType, DocumentStatus, MovementType } from '@prisma/client';
import { CreateDocumentDto, UpdateDocumentDto, AddDocumentItemDto } from '../validation/document.validation';

const prisma = new PrismaClient();

export const documentService = {
  // Получить все документы с фильтрацией
  async getAll(options: {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    warehouseId?: number;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, limit, type, status, warehouseId, supplierId, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type: type as DocumentType }),
      ...(status && { status: status as DocumentStatus }),
      ...(warehouseId && { 
        OR: [
          { warehouseFromId: warehouseId },
          { warehouseToId: warehouseId }
        ]
      }),
      ...(supplierId && { supplierId }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      })
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true
            }
          },
          warehouseFrom: {
            select: {
              id: true,
              name: true
            }
          },
          warehouseTo: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.document.count({ where })
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Получить документ по ID
  async getById(id: number) {
    return await prisma.document.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouseFrom: true,
        warehouseTo: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                unit: true,
                category: true
              }
            },
            unit: true
          },
          orderBy: { id: 'asc' }
        }
      }
    });
  },

  // Создать новый документ
  async create(data: CreateDocumentDto, userId: number): Promise<Document> {
    // Генерируем номер документа
    const number = await this.generateDocumentNumber(data.type as DocumentType);
    
    return await prisma.document.create({
      data: {
        number,
        type: data.type as DocumentType,
        date: new Date(data.date),
        supplierId: data.supplierId,
        warehouseFromId: data.warehouseFromId,
        warehouseToId: data.warehouseToId,
        notes: data.notes,
        createdById: userId
      },
      include: {
        supplier: true,
        warehouseFrom: true,
        warehouseTo: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  // Обновить документ
  async update(id: number, data: UpdateDocumentDto) {
    try {
      // Проверяем, что документ можно редактировать
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document || document.status !== 'DRAFT') {
        return null;
      }

      return await prisma.document.update({
        where: { id },
        data: {
          date: data.date ? new Date(data.date) : undefined,
          supplierId: data.supplierId,
          warehouseFromId: data.warehouseFromId,
          warehouseToId: data.warehouseToId,
          notes: data.notes
        },
        include: {
          supplier: true,
          warehouseFrom: true,
          warehouseTo: true,
          items: {
            include: {
              product: true,
              unit: true
            }
          }
        }
      });
    } catch (error) {
      return null;
    }
  },

  // Удалить документ
  async delete(id: number): Promise<boolean> {
    try {
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document || document.status !== 'DRAFT') {
        return false;
      }

      await prisma.document.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  },

  // Добавить позицию в документ
  async addItem(documentId: number, data: AddDocumentItemDto) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document || document.status !== 'DRAFT') {
        return null;
      }

      const total = data.quantity * data.price;

      const item = await prisma.documentItem.create({
        data: {
          documentId,
          productId: data.productId,
          quantity: data.quantity,
          unitId: data.unitId,
          price: data.price,
          total,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          batchNumber: data.batchNumber
        },
        include: {
          product: {
            include: {
              unit: true
            }
          },
          unit: true
        }
      });

      // Обновляем общую сумму документа
      await this.updateDocumentTotal(documentId);

      return item;
    } catch (error) {
      return null;
    }
  },

  // Удалить позицию из документа
  async removeItem(documentId: number, itemId: number): Promise<boolean> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document || document.status !== 'DRAFT') {
        return false;
      }

      await prisma.documentItem.delete({
        where: { 
          id: itemId,
          documentId 
        }
      });

      // Обновляем общую сумму документа
      await this.updateDocumentTotal(documentId);

      return true;
    } catch (error) {
      return false;
    }
  },

  // Провести документ
  async approve(id: number, userId: number) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!document || document.status !== 'DRAFT' || document.items.length === 0) {
        return null;
      }

      return await prisma.$transaction(async (tx) => {
        // Обновляем статус документа
        const updatedDocument = await tx.document.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: userId,
            approvedAt: new Date()
          }
        });

        // Создаем движения товаров
        for (const item of document.items) {
          let movementType: MovementType;
          let warehouseId: number;

          switch (document.type) {
            case 'RECEIPT':
              movementType = 'IN';
              warehouseId = document.warehouseToId!;
              break;
            case 'TRANSFER':
              // Создаем два движения - списание с одного склада и поступление на другой
              await tx.stockMovement.create({
                data: {
                  warehouseId: document.warehouseFromId!,
                  productId: item.productId,
                  documentId: id,
                  type: 'TRANSFER_OUT',
                  quantity: -item.quantity,
                  price: item.price,
                  batchNumber: item.batchNumber,
                  expiryDate: item.expiryDate
                }
              });
              
              movementType = 'TRANSFER_IN';
              warehouseId = document.warehouseToId!;
              break;
            case 'WRITEOFF':
              movementType = 'WRITEOFF';
              warehouseId = document.warehouseFromId!;
              break;
            default:
              continue;
          }

          await tx.stockMovement.create({
            data: {
              warehouseId,
              productId: item.productId,
              documentId: id,
              type: movementType,
              quantity: movementType === 'WRITEOFF' ? -item.quantity : item.quantity,
              price: item.price,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate
            }
          });
        }

        return updatedDocument;
      });
    } catch (error) {
      return null;
    }
  },

  // Отменить проведение документа
  async cancel(id: number) {
    try {
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document || document.status !== 'APPROVED') {
        return null;
      }

      return await prisma.$transaction(async (tx) => {
        // Удаляем движения товаров
        await tx.stockMovement.deleteMany({
          where: { documentId: id }
        });

        // Обновляем статус документа
        return await tx.document.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            approvedById: null,
            approvedAt: null
          }
        });
      });
    } catch (error) {
      return null;
    }
  },

  // Генерировать номер документа
  async generateDocumentNumber(type: DocumentType): Promise<string> {
    const prefix = {
      RECEIPT: 'ПР',
      TRANSFER: 'ПМ',
      WRITEOFF: 'СП',
      INVENTORY_ADJUSTMENT: 'КР'
    }[type];

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Получаем последний номер за текущий месяц
    const lastDocument = await prisma.document.findFirst({
      where: {
        type,
        number: {
          startsWith: `${prefix}-${year}${month}`
        }
      },
      orderBy: { number: 'desc' }
    });

    let nextNumber = 1;
    if (lastDocument) {
      const lastNumber = parseInt(lastDocument.number.split('-')[1].slice(6));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${year}${month}${String(nextNumber).padStart(4, '0')}`;
  },

  // Обновить общую сумму документа
  async updateDocumentTotal(documentId: number) {
    const result = await prisma.documentItem.aggregate({
      where: { documentId },
      _sum: { total: true }
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { totalAmount: result._sum.total || 0 }
    });
  }
};
