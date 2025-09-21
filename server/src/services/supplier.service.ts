import { PrismaClient, Supplier, DocumentType, DocumentStatus } from '@prisma/client';
import { CreateSupplierDto, UpdateSupplierDto } from '../validation/supplier.validation';

const prisma = new PrismaClient();

export const supplierService = {
  // Получить всех поставщиков с пагинацией и поиском
  async getAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, isActive } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { legalName: { contains: search, mode: 'insensitive' as const } },
          { inn: { contains: search, mode: 'insensitive' as const } },
          { contactPerson: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              documents: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.supplier.count({ where })
    ]);

    return {
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Получить поставщика по ID
  async getById(id: number) {
    return await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    });
  },

  // Создать нового поставщика
  async create(data: CreateSupplierDto): Promise<Supplier> {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        legalName: data.legalName,
        inn: data.inn,
        kpp: data.kpp,
        address: data.address,
        phone: data.phone,
        email: data.email,
        contactPerson: data.contactPerson,
        paymentTerms: data.paymentTerms || 0
      }
    });
  },

  // Обновить поставщика
  async update(id: number, data: UpdateSupplierDto) {
    try {
      return await prisma.supplier.update({
        where: { id },
        data: {
          name: data.name,
          legalName: data.legalName,
          inn: data.inn,
          kpp: data.kpp,
          address: data.address,
          phone: data.phone,
          email: data.email,
          contactPerson: data.contactPerson,
          paymentTerms: data.paymentTerms
        }
      });
    } catch (error) {
      return null;
    }
  },

  // Удалить поставщика (мягкое удаление)
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.supplier.update({
        where: { id },
        data: { isActive: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Получить документы поставщика
  async getDocuments(
    supplierId: number,
    options: {
      page: number;
      limit: number;
      type?: string;
      status?: string;
    }
  ) {
    const { page, limit, type, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      supplierId,
      ...(type && { type: type as DocumentType }),
      ...(status && { status: status as DocumentStatus })
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
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

  // Проверить существование поставщика
  async exists(id: number): Promise<boolean> {
    const supplier = await prisma.supplier.findUnique({
      where: { id, isActive: true }
    });
    return !!supplier;
  },

  // Проверить уникальность ИНН
  async isInnUnique(inn: string, excludeId?: number): Promise<boolean> {
    const supplier = await prisma.supplier.findFirst({
      where: {
        inn,
        isActive: true,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    return !supplier;
  }
};
