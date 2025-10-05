import { PrismaClient, Menu, MenuCategory, MenuItem, WarehouseMenu, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Расширенные типы для включения связанных данных
type MenuWithItems = Menu & {
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
};

type MenuCategoryWithItems = MenuCategory & {
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
};

type MenuItemWithIncludes = MenuItem & {
  category?: MenuCategory | null;
  menu?: Menu | null;
  product?: {
    id: number;
    name: string;
    article: string | null;
    categoryId: number | null;
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
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
  } | null;
};

type WarehouseMenuWithIncludes = WarehouseMenu & {
  warehouse: {
    id: number;
    name: string;
    type: string;
  };
  menu: Menu & {
    menuItems?: MenuItem[];
  };
};

// Интерфейсы для входных данных

// === МЕНЮ ===
export interface MenuCreateInput {
  name: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface MenuUpdateInput {
  name?: string;
  description?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isActive?: boolean;
}

// === КАТЕГОРИИ МЕНЮ ===
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

// === ПОЗИЦИИ МЕНЮ ===
export interface MenuItemCreateInput {
  menuId?: number;
  productId: number;
  categoryId?: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  sortOrder?: number;
}

export interface MenuItemUpdateInput {
  menuId?: number | null;
  productId?: number | null;
  categoryId?: number | null;
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface WarehouseMenuInput {
  warehouseId: number;
  menuId: number;
  isActive?: boolean;
}

// Интерфейсы для фильтров
export interface MenuFilters {
  search?: string;
  isActive?: boolean;
  dateFrom?: string | Date;
  dateTo?: string | Date;
}

export interface MenuCategoryFilters {
  search?: string;
  isActive?: boolean;
}

export interface MenuItemFilters {
  search?: string;
  menuId?: number;
  categoryId?: number;
  productId?: number;
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
  // === МЕНЮ ===

  async createMenu(data: MenuCreateInput): Promise<Menu> {
    try {
      return await prisma.menu.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Меню с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async getMenus(
    filters: MenuFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ menus: MenuWithItems[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const { search, isActive, dateFrom, dateTo } = filters;

    const where: Prisma.MenuWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(dateFrom && {
        startDate: { gte: new Date(dateFrom) },
      }),
      ...(dateTo && {
        endDate: { lte: new Date(dateTo) },
      }),
    };

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        include: {
          _count: {
            select: { menuItems: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.menu.count({ where }),
    ]);

    return {
      menus,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMenuById(id: number): Promise<MenuWithItems | null> {
    return await prisma.menu.findUnique({
      where: { id },
      include: {
        menuItems: {
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
            sortOrder: 'asc',
          },
        },
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }

  async updateMenu(id: number, data: MenuUpdateInput): Promise<Menu> {
    try {
      return await prisma.menu.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
          ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Меню с таким названием уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Меню не найдено');
        }
      }
      throw error;
    }
  }

  async deleteMenu(id: number): Promise<void> {
    try {
      await prisma.menu.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Меню не найдено');
        }
      }
      throw error;
    }
  }

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
    const { search, isActive } = filters;

    const where: Prisma.MenuCategoryWhereInput = {
      ...(isActive !== undefined && { isActive }),
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
            select: { menuItems: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
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
          include: {
            menu: true,
            product: {
              include: {
                unit: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }

  async updateMenuCategory(id: number, data: MenuCategoryUpdateInput): Promise<MenuCategory> {
    try {
      return await prisma.menuCategory.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Категория с таким названием уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Категория не найдена');
        }
      }
      throw error;
    }
  }

  async deleteMenuCategory(id: number): Promise<void> {
    try {
      await prisma.menuCategory.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Категория не найдена');
        }
        if (error.code === 'P2003') {
          throw new Error('Невозможно удалить категорию, так как она используется в позициях меню');
        }
      }
      throw error;
    }
  }

  // === ПОЗИЦИИ МЕНЮ ===

  async createMenuItem(data: MenuItemCreateInput): Promise<MenuItem> {
    try {
      // Проверяем существование продукта
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        include: { unit: true },
      });

      if (!product) {
        throw new Error('Продукт не найден');
      }

      return await prisma.menuItem.create({
        data: {
          menuId: data.menuId,
          productId: data.productId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          costPrice: data.costPrice,
          imageUrl: data.imageUrl,
          sortOrder: data.sortOrder || 0,
        },
        include: {
          menu: true,
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
                          unit: true,
                        },
                      },
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Позиция меню с таким названием уже существует');
        }
        if (error.code === 'P2003') {
          throw new Error('Указанный продукт, категория или меню не найдены');
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
    const { search, menuId, categoryId, productId, isAvailable, isActive, priceMin, priceMax, warehouseId } = filters;

    const where: Prisma.MenuItemWhereInput = {
      ...(menuId !== undefined && { menuId }),
      ...(categoryId !== undefined && { categoryId }),
      ...(productId !== undefined && { productId }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(isActive !== undefined && { isActive }),
      ...(priceMin !== undefined && { price: { gte: priceMin } }),
      ...(priceMax !== undefined && { price: { ...((priceMin !== undefined) && { gte: priceMin }), lte: priceMax } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          menu: true,
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
        orderBy: { [sortBy]: sortOrder },
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
        menu: true,
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
    });
  }

  async updateMenuItem(id: number, data: MenuItemUpdateInput): Promise<MenuItem> {
    try {
      // Если обновляется productId, проверяем существование продукта
      if (data.productId !== undefined && data.productId !== null) {
        const product = await prisma.product.findUnique({
          where: { id: data.productId },
        });

        if (!product) {
          throw new Error('Продукт не найден');
        }
      }

      return await prisma.menuItem.update({
        where: { id },
        data: {
          ...(data.menuId !== undefined && { menuId: data.menuId }),
          ...(data.productId !== undefined && { productId: data.productId }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
        include: {
          menu: true,
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
                          unit: true,
                        },
                      },
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Позиция меню с таким названием уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Позиция меню не найдена');
        }
        if (error.code === 'P2003') {
          throw new Error('Указанный продукт, категория или меню не найдены');
        }
      }
      throw error;
    }
  }

  async deleteMenuItem(id: number): Promise<void> {
    try {
      await prisma.menuItem.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Позиция меню не найдена');
        }
        if (error.code === 'P2003') {
          throw new Error('Невозможно удалить позицию меню, так как она используется в продажах');
        }
      }
      throw error;
    }
  }

  // === ПРИВЯЗКА МЕНЮ К СКЛАДАМ ===

  async addWarehouseMenu(data: WarehouseMenuInput): Promise<WarehouseMenu> {
    try {
      return await prisma.warehouseMenu.create({
        data: {
          warehouseId: data.warehouseId,
          menuId: data.menuId,
          isActive: data.isActive ?? true,
        },
        include: {
          warehouse: true,
          menu: {
            include: {
              menuItems: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Это меню уже добавлено на данный склад');
        }
        if (error.code === 'P2003') {
          throw new Error('Указанный склад или меню не найдены');
        }
      }
      throw error;
    }
  }

  async updateWarehouseMenu(
    warehouseId: number,
    menuId: number,
    data: Partial<WarehouseMenuInput>
  ): Promise<WarehouseMenu> {
    try {
      return await prisma.warehouseMenu.update({
        where: {
          warehouseId_menuId: {
            warehouseId,
            menuId,
          },
        },
        data: {
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          warehouse: true,
          menu: {
            include: {
              menuItems: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Меню на складе не найдено');
        }
      }
      throw error;
    }
  }

  async removeWarehouseMenu(warehouseId: number, menuId: number): Promise<void> {
    try {
      await prisma.warehouseMenu.delete({
        where: {
          warehouseId_menuId: {
            warehouseId,
            menuId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Меню на складе не найдено');
        }
      }
      throw error;
    }
  }

  async getWarehouseMenus(warehouseId: number): Promise<WarehouseMenuWithIncludes[]> {
    return await prisma.warehouseMenu.findMany({
      where: { warehouseId, isActive: true },
      include: {
        warehouse: true,
        menu: {
          include: {
            menuItems: {
              where: { isActive: true },
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
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  // === ПОЛУЧЕНИЕ ДОСТУПНОГО МЕНЮ ===

  async getAvailableMenu(warehouseId: number): Promise<{
    categories: (MenuCategoryWithItems & {
      menuItems: MenuItemWithIncludes[];
    })[];
  }> {
    // Получаем активные меню, привязанные к складу
    const warehouseMenus = await prisma.warehouseMenu.findMany({
      where: {
        warehouseId,
        isActive: true,
      },
      select: {
        menuId: true,
      },
    });

    const activeMenuIds = warehouseMenus.map(wm => wm.menuId);

    if (activeMenuIds.length === 0) {
      return { categories: [] };
    }

    // Получаем все категории с позициями меню из активных меню на складе
    const categories = await prisma.menuCategory.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: {
            isActive: true,
            isAvailable: true,
            menuId: {
              in: activeMenuIds,
            },
          },
        },
      },
      include: {
        menuItems: {
          where: {
            isActive: true,
            isAvailable: true,
            menuId: {
              in: activeMenuIds,
            },
          },
          include: {
            menu: true,
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
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        product: {
          include: {
            unit: true,
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
        },
      },
    });

    if (!menuItem) {
      throw new Error('Позиция меню не найдена');
    }

    // Если у продукта нет рецептуры, считаем что блюдо доступно
    if (!menuItem.product?.recipe) {
      return {
        isAvailable: true,
        missingIngredients: [],
      };
    }

    const missingIngredients = [];

    for (const ingredient of menuItem.product.recipe.ingredients) {
      const stockBalance = await prisma.stockBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: ingredient.productId,
          },
        },
      });

      const availableQuantity = stockBalance ? Number(stockBalance.quantity) : 0;
      const requiredQuantity = Number(ingredient.quantity) * quantity;

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

export const menuService = new MenuService();
