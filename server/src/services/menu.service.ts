import { PrismaClient, MenuCategory, MenuItem, WarehouseMenuItem, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Расширенные типы для включения связанных данных
type MenuCategoryWithItems = MenuCategory & {
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
};

type MenuItemWithIncludes = MenuItem & {
  category?: MenuCategory | null;
  recipe?: {
    id: number;
    name: string;
    portionSize: Prisma.Decimal;
    costPrice: Prisma.Decimal | null;
    ingredients: {
      id: number;
      quantity: Prisma.Decimal;
      product: {
        id: number;
        name: string;
        unit: {
          id: number;
          name: string;
          shortName: string;
        };
      };
      unit: {
        id: number;
        name: string;
        shortName: string;
      };
    }[];
  } | null;
  warehouseMenuItems?: WarehouseMenuItem[];
};

type WarehouseMenuItemWithIncludes = WarehouseMenuItem & {
  warehouse: {
    id: number;
    name: string;
    type: string;
  };
  menuItem: MenuItemWithIncludes;
};

// Интерфейсы для входных данных
export interface MenuCategoryCreateInput {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface MenuCategoryUpdateInput {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuItemCreateInput {
  name: string;
  description?: string;
  recipeId?: number;
  categoryId?: number;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  sortOrder?: number;
}

export interface MenuItemUpdateInput {
  name?: string;
  description?: string;
  recipeId?: number | null;
  categoryId?: number | null;
  price?: number;
  costPrice?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface WarehouseMenuItemInput {
  warehouseId: number;
  menuItemId: number;
  isAvailable?: boolean;
  priceOverride?: number | null;
}

// Интерфейсы для фильтров
export interface MenuCategoryFilters {
  search?: string;
  isActive?: boolean;
}

export interface MenuItemFilters {
  search?: string;
  categoryId?: number;
  recipeId?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  warehouseId?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class MenuService {
  // === КАТЕГОРИИ МЕНЮ ===

  async createMenuCategory(data: MenuCategoryCreateInput): Promise<MenuCategory> {
    try {
      return await prisma.menuCategory.create({
        data: {
          name: data.name,
          description: data.description,
          sortOrder: data.sortOrder || 0,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Категория с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async getMenuCategories(
    filters: MenuCategoryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ categories: MenuCategoryWithItems[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'asc' } = pagination;
    const { search, isActive = true } = filters;

    const where: Prisma.MenuCategoryWhereInput = {
      isActive,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [categories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where,
        include: {
          _count: {
            select: {
              menuItems: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.menuCategory.count({ where }),
    ]);

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMenuCategoryById(id: number): Promise<MenuCategoryWithItems | null> {
    return await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            menuItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  }

  async updateMenuCategory(id: number, data: MenuCategoryUpdateInput): Promise<MenuCategory> {
    try {
      return await prisma.menuCategory.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Категория не найдена');
        }
        if (error.code === 'P2002') {
          throw new Error('Категория с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async deleteMenuCategory(id: number): Promise<void> {
    try {
      // Проверяем, есть ли позиции меню в этой категории
      const itemsCount = await prisma.menuItem.count({
        where: { categoryId: id, isActive: true },
      });

      if (itemsCount > 0) {
        throw new Error('Нельзя удалить категорию, содержащую активные позиции меню');
      }

      await prisma.menuCategory.update({
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

  // === ПОЗИЦИИ МЕНЮ ===

  async createMenuItem(data: MenuItemCreateInput): Promise<MenuItemWithIncludes> {
    try {
      // Если указан рецепт, получаем его себестоимость
      let costPrice = data.costPrice;
      if (data.recipeId && !costPrice) {
        const recipe = await prisma.recipe.findUnique({
          where: { id: data.recipeId },
          select: { costPrice: true },
        });
        if (recipe?.costPrice) {
          costPrice = Number(recipe.costPrice);
        }
      }

      const menuItem = await prisma.menuItem.create({
        data: {
          name: data.name,
          description: data.description,
          recipeId: data.recipeId,
          categoryId: data.categoryId,
          price: new Prisma.Decimal(data.price),
          costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
          imageUrl: data.imageUrl,
          sortOrder: data.sortOrder || 0,
        },
        include: {
          category: true,
          recipe: {
            include: {
              ingredients: {
                include: {
                  product: {
                    include: {
                      unit: true,
                    },
                  },
                  unit: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
      });

      return menuItem;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Позиция меню с таким названием уже существует');
        }
        if (error.code === 'P2003') {
          throw new Error('Указанный рецепт или категория не существует');
        }
      }
      throw error;
    }
  }

  async getMenuItems(
    filters: MenuItemFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ items: MenuItemWithIncludes[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'asc' } = pagination;
    const {
      search,
      categoryId,
      recipeId,
      isAvailable,
      isActive = true,
      priceMin,
      priceMax,
      warehouseId,
    } = filters;

    let where: Prisma.MenuItemWhereInput = {
      isActive,
      ...(categoryId && { categoryId }),
      ...(recipeId && { recipeId }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(priceMin && { price: { gte: new Prisma.Decimal(priceMin) } }),
      ...(priceMax && { price: { lte: new Prisma.Decimal(priceMax) } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Если указан склад, фильтруем по доступности на складе
    if (warehouseId) {
      where = {
        ...where,
        warehouseMenuItems: {
          some: {
            warehouseId,
            isAvailable: true,
          },
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          recipe: {
            include: {
              ingredients: {
                include: {
                  product: {
                    include: {
                      unit: true,
                    },
                  },
                  unit: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
          warehouseMenuItems: warehouseId
            ? {
                where: { warehouseId },
              }
            : undefined,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMenuItemById(id: number): Promise<MenuItemWithIncludes | null> {
    return await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        recipe: {
          include: {
            ingredients: {
              include: {
                product: {
                  include: {
                    unit: true,
                  },
                },
                unit: true,
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
        warehouseMenuItems: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async updateMenuItem(id: number, data: MenuItemUpdateInput): Promise<MenuItemWithIncludes> {
    try {
      // Если изменяется рецепт и не указана себестоимость, обновляем её
      let updateData = { ...data };
      if (data.recipeId && data.costPrice === undefined) {
        const recipe = await prisma.recipe.findUnique({
          where: { id: data.recipeId },
          select: { costPrice: true },
        });
        if (recipe?.costPrice) {
          updateData.costPrice = Number(recipe.costPrice);
        }
      }

      const menuItem = await prisma.menuItem.update({
        where: { id },
        data: {
          ...updateData,
          price: updateData.price ? new Prisma.Decimal(updateData.price) : undefined,
          costPrice: updateData.costPrice ? new Prisma.Decimal(updateData.costPrice) : updateData.costPrice,
        },
        include: {
          category: true,
          recipe: {
            include: {
              ingredients: {
                include: {
                  product: {
                    include: {
                      unit: true,
                    },
                  },
                  unit: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
          warehouseMenuItems: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      return menuItem;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Позиция меню не найдена');
        }
        if (error.code === 'P2002') {
          throw new Error('Позиция меню с таким названием уже существует');
        }
        if (error.code === 'P2003') {
          throw new Error('Указанный рецепт или категория не существует');
        }
      }
      throw error;
    }
  }

  async deleteMenuItem(id: number): Promise<void> {
    try {
      await prisma.menuItem.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Позиция меню не найдена');
        }
      }
      throw error;
    }
  }

  // === НАСТРОЙКИ МЕНЮ ПО СКЛАДАМ ===

  async setWarehouseMenuItem(data: WarehouseMenuItemInput): Promise<WarehouseMenuItem> {
    try {
      return await prisma.warehouseMenuItem.upsert({
        where: {
          warehouseId_menuItemId: {
            warehouseId: data.warehouseId,
            menuItemId: data.menuItemId,
          },
        },
        update: {
          isAvailable: data.isAvailable,
          priceOverride: data.priceOverride ? new Prisma.Decimal(data.priceOverride) : null,
        },
        create: {
          warehouseId: data.warehouseId,
          menuItemId: data.menuItemId,
          isAvailable: data.isAvailable ?? true,
          priceOverride: data.priceOverride ? new Prisma.Decimal(data.priceOverride) : null,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('Указанный склад или позиция меню не существует');
        }
      }
      throw error;
    }
  }

  async getWarehouseMenuItems(warehouseId: number): Promise<WarehouseMenuItemWithIncludes[]> {
    return await prisma.warehouseMenuItem.findMany({
      where: { warehouseId },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        menuItem: {
          include: {
            category: true,
            recipe: {
              include: {
                ingredients: {
                  include: {
                    product: {
                      include: {
                        unit: true,
                      },
                    },
                    unit: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        menuItem: {
          sortOrder: 'asc',
        },
      },
    });
  }

  async removeWarehouseMenuItem(warehouseId: number, menuItemId: number): Promise<void> {
    try {
      await prisma.warehouseMenuItem.delete({
        where: {
          warehouseId_menuItemId: {
            warehouseId,
            menuItemId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Настройка позиции меню для склада не найдена');
        }
      }
      throw error;
    }
  }

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(warehouseId: number): Promise<{
    categories: (MenuCategoryWithItems & {
      menuItems: MenuItemWithIncludes[];
    })[];
  }> {
    // Получаем все категории с позициями меню, доступными на складе
    const categories = await prisma.menuCategory.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: {
            isActive: true,
            isAvailable: true,
            warehouseMenuItems: {
              some: {
                warehouseId,
                isAvailable: true,
              },
            },
          },
        },
      },
      include: {
        menuItems: {
          where: {
            isActive: true,
            isAvailable: true,
            warehouseMenuItems: {
              some: {
                warehouseId,
                isAvailable: true,
              },
            },
          },
          include: {
            category: true,
            recipe: {
              include: {
                ingredients: {
                  include: {
                    product: {
                      include: {
                        unit: true,
                      },
                    },
                    unit: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
            warehouseMenuItems: {
              where: { warehouseId },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return { categories };
  }

  // === ПРОВЕРКА ДОСТУПНОСТИ БЛЮД ===

  async checkMenuItemAvailability(
    menuItemId: number,
    warehouseId: number,
    quantity: number = 1
  ): Promise<{
    isAvailable: boolean;
    missingIngredients: {
      productId: number;
      productName: string;
      required: number;
      available: number;
      unit: string;
    }[];
  }> {
    // Получаем позицию меню с рецептом
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                product: {
                  include: {
                    unit: true,
                  },
                },
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!menuItem || !menuItem.recipe) {
      return { isAvailable: true, missingIngredients: [] };
    }

    const missingIngredients = [];

    // Проверяем наличие каждого ингредиента
    for (const ingredient of menuItem.recipe.ingredients) {
      const requiredQuantity = Number(ingredient.quantity) * quantity;

      // Получаем остаток на складе
      const stockBalance = await prisma.stockBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: ingredient.productId,
          },
        },
      });

      const availableQuantity = stockBalance ? Number(stockBalance.quantity) : 0;

      if (availableQuantity < requiredQuantity) {
        missingIngredients.push({
          productId: ingredient.productId,
          productName: ingredient.product.name,
          required: requiredQuantity,
          available: availableQuantity,
          unit: ingredient.unit.shortName,
        });
      }
    }

    return {
      isAvailable: missingIngredients.length === 0,
      missingIngredients,
    };
  }
}
