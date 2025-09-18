import { PrismaClient, Unit, UnitType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface UnitCreateInput {
  name: string;
  shortName: string;
  type: UnitType;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface UnitUpdateInput {
  name?: string;
  shortName?: string;
  type?: UnitType;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface UnitWithConversion extends Unit {
  baseUnit?: Unit;
  derivedUnits: Unit[];
  _count?: {
    products: number;
  };
}

export class UnitService {
  async createUnit(data: UnitCreateInput): Promise<Unit> {
    try {
      // Проверяем, что базовая единица существует и имеет тот же тип
      if (data.baseUnitId) {
        const baseUnit = await prisma.unit.findUnique({
          where: { id: data.baseUnitId },
        });
        
        if (!baseUnit) {
          throw new Error('Базовая единица измерения не найдена');
        }
        
        if (baseUnit.type !== data.type) {
          throw new Error('Базовая единица должна иметь тот же тип измерения');
        }
      }

      const unit = await prisma.unit.create({
        data: {
          ...data,
          conversionFactor: data.conversionFactor ? new Prisma.Decimal(data.conversionFactor) : new Prisma.Decimal(1.0),
        },
        include: {
          baseUnit: true,
          derivedUnits: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      
      return unit;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Единица измерения с таким названием или сокращением уже существует');
        }
      }
      throw error;
    }
  }

  async getUnits(): Promise<UnitWithConversion[]> {
    const units = await prisma.unit.findMany({
      include: {
        baseUnit: true,
        derivedUnits: {
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    return units as UnitWithConversion[];
  }

  async getUnitsByType(type: UnitType): Promise<UnitWithConversion[]> {
    const units = await prisma.unit.findMany({
      where: { type },
      include: {
        baseUnit: true,
        derivedUnits: {
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return units as UnitWithConversion[];
  }

  async getUnitById(id: number): Promise<UnitWithConversion | null> {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        baseUnit: true,
        derivedUnits: {
          orderBy: {
            name: 'asc',
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            article: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return unit as UnitWithConversion | null;
  }

  async updateUnit(id: number, data: UnitUpdateInput): Promise<Unit> {
    try {
      // Проверяем циклические ссылки при изменении базовой единицы
      if (data.baseUnitId) {
        const isCircular = await this.checkCircularReference(id, data.baseUnitId);
        if (isCircular) {
          throw new Error('Нельзя создать циклическую ссылку между единицами измерения');
        }

        // Проверяем тип базовой единицы
        const baseUnit = await prisma.unit.findUnique({
          where: { id: data.baseUnitId },
        });
        
        if (baseUnit && data.type && baseUnit.type !== data.type) {
          throw new Error('Базовая единица должна иметь тот же тип измерения');
        }
      }

      const unit = await prisma.unit.update({
        where: { id },
        data: {
          ...data,
          conversionFactor: data.conversionFactor ? new Prisma.Decimal(data.conversionFactor) : undefined,
        },
        include: {
          baseUnit: true,
          derivedUnits: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      
      return unit;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Единица измерения с таким названием или сокращением уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Единица измерения не найдена');
        }
      }
      throw error;
    }
  }

  async deleteUnit(id: number): Promise<void> {
    try {
      // Проверяем, используется ли единица в товарах
      const productsCount = await prisma.product.count({
        where: { unitId: id, isActive: true },
      });

      if (productsCount > 0) {
        throw new Error('Нельзя удалить единицу измерения, используемую в товарах');
      }

      // Проверяем, есть ли производные единицы
      const derivedUnitsCount = await prisma.unit.count({
        where: { baseUnitId: id },
      });

      if (derivedUnitsCount > 0) {
        throw new Error('Нельзя удалить единицу измерения, имеющую производные единицы');
      }

      await prisma.unit.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Единица измерения не найдена');
        }
      }
      throw error;
    }
  }

  async getBaseUnits(): Promise<Unit[]> {
    return await prisma.unit.findMany({
      where: { baseUnitId: null },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async convertQuantity(
    fromUnitId: number,
    toUnitId: number,
    quantity: number
  ): Promise<number> {
    if (fromUnitId === toUnitId) {
      return quantity;
    }

    const [fromUnit, toUnit] = await Promise.all([
      this.getUnitById(fromUnitId),
      this.getUnitById(toUnitId),
    ]);

    if (!fromUnit || !toUnit) {
      throw new Error('Единица измерения не найдена');
    }

    if (fromUnit.type !== toUnit.type) {
      throw new Error('Нельзя конвертировать между разными типами единиц измерения');
    }

    // Конвертируем в базовую единицу
    const baseQuantity = quantity * Number(fromUnit.conversionFactor);
    
    // Конвертируем из базовой единицы в целевую
    const result = baseQuantity / Number(toUnit.conversionFactor);
    
    return result;
  }

  private async checkCircularReference(unitId: number, baseUnitId: number): Promise<boolean> {
    if (unitId === baseUnitId) {
      return true;
    }

    const baseUnit = await prisma.unit.findUnique({
      where: { id: baseUnitId },
    });

    if (!baseUnit || !baseUnit.baseUnitId) {
      return false;
    }

    return this.checkCircularReference(unitId, baseUnit.baseUnitId);
  }

  async getConversionChain(unitId: number): Promise<Unit[]> {
    const chain: Unit[] = [];
    let currentId: number | null = unitId;

    while (currentId) {
      const unit: Unit | null = await prisma.unit.findUnique({
        where: { id: currentId },
      });

      if (!unit) break;

      chain.unshift(unit);
      currentId = unit.baseUnitId;
    }

    return chain;
  }

  async createDefaultUnits(): Promise<void> {
    const defaultUnits: UnitCreateInput[] = [
      // Вес
      { name: 'Килограмм', shortName: 'кг', type: UnitType.WEIGHT },
      { name: 'Грамм', shortName: 'г', type: UnitType.WEIGHT, baseUnitId: 1, conversionFactor: 0.001 },
      
      // Объем
      { name: 'Литр', shortName: 'л', type: UnitType.VOLUME },
      { name: 'Миллилитр', shortName: 'мл', type: UnitType.VOLUME, baseUnitId: 3, conversionFactor: 0.001 },
      
      // Штуки
      { name: 'Штука', shortName: 'шт', type: UnitType.PIECE },
      { name: 'Упаковка', shortName: 'упак', type: UnitType.PIECE },
      
      // Длина
      { name: 'Метр', shortName: 'м', type: UnitType.LENGTH },
      { name: 'Сантиметр', shortName: 'см', type: UnitType.LENGTH, baseUnitId: 7, conversionFactor: 0.01 },
    ];

    for (const unitData of defaultUnits) {
      try {
        await this.createUnit(unitData);
      } catch (error) {
        // Игнорируем ошибки дублирования при создании стандартных единиц
        console.log(`Единица "${unitData.name}" уже существует`);
      }
    }
  }
}

export const unitService = new UnitService();
