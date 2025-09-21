import { PrismaClient, Recipe, RecipeIngredient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Расширенные типы для включения связанных данных
type RecipeWithIncludes = Recipe & {
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  ingredients: (RecipeIngredient & {
    product: {
      id: number;
      name: string;
      unit: {
        id: number;
        name: string;
        shortName: string;
      };
      category?: {
        id: number;
        name: string;
      } | null;
    };
    unit: {
      id: number;
      name: string;
      shortName: string;
    };
  })[];
  menuItems?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    } | null;
  }[];
};

export interface RecipeIngredientInput {
  productId: number;
  quantity: number;
  unitId: number;
  costPerUnit?: number;
  isMain?: boolean;
  sortOrder?: number;
}

export interface RecipeCreateInput {
  name: string;
  description?: string;
  portionSize: number;
  cookingTime?: number;
  difficultyLevel?: number;
  instructions?: string;
  marginPercent?: number;
  ingredients: RecipeIngredientInput[];
}

export interface RecipeUpdateInput {
  name?: string;
  description?: string;
  portionSize?: number;
  cookingTime?: number;
  difficultyLevel?: number;
  instructions?: string;
  marginPercent?: number;
  isActive?: boolean;
  ingredients?: RecipeIngredientInput[];
}

export interface RecipeFilters {
  search?: string;
  isActive?: boolean;
  difficultyLevel?: number;
  cookingTimeMax?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RecipeCostCalculation {
  totalCost: number;
  costPerPortion: number;
  sellingPrice?: number;
  profit?: number;
  profitMargin?: number;
  ingredients: {
    productId: number;
    productName: string;
    quantity: number;
    unitName: string;
    costPerUnit: number;
    totalCost: number;
  }[];
}

export class RecipeService {
  async createRecipe(data: RecipeCreateInput, createdById?: number): Promise<Recipe> {
    try {
      // Вычисляем себестоимость рецепта
      const costCalculation = await this.calculateRecipeCost(data.ingredients);
      const costPrice = costCalculation.costPerPortion;
      const sellingPrice = data.marginPercent 
        ? costPrice * (1 + data.marginPercent / 100)
        : undefined;

      const recipe = await prisma.recipe.create({
        data: {
          name: data.name,
          description: data.description,
          portionSize: new Prisma.Decimal(data.portionSize),
          cookingTime: data.cookingTime,
          difficultyLevel: data.difficultyLevel,
          instructions: data.instructions,
          costPrice: new Prisma.Decimal(costPrice),
          marginPercent: data.marginPercent ? new Prisma.Decimal(data.marginPercent) : new Prisma.Decimal(0),
          sellingPrice: sellingPrice ? new Prisma.Decimal(sellingPrice) : null,
          createdById,
          ingredients: {
            create: data.ingredients.map((ingredient, index) => ({
              productId: ingredient.productId,
              quantity: new Prisma.Decimal(ingredient.quantity),
              unitId: ingredient.unitId,
              costPerUnit: ingredient.costPerUnit ? new Prisma.Decimal(ingredient.costPerUnit) : null,
              isMain: ingredient.isMain || false,
              sortOrder: ingredient.sortOrder || index,
            })),
          },
        },
        include: {
          createdBy: true,
          ingredients: {
            include: {
              product: true,
              unit: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });

      return recipe;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Рецепт с таким названием уже существует');
        }
      }
      throw error;
    }
  }

  async getRecipes(
    filters: RecipeFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ recipes: Recipe[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = pagination;
    const { search, isActive = true, difficultyLevel, cookingTimeMax } = filters;

    const where: Prisma.RecipeWhereInput = {
      isActive,
      ...(difficultyLevel && { difficultyLevel }),
      ...(cookingTimeMax && { cookingTime: { lte: cookingTimeMax } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { instructions: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          ingredients: {
            include: {
              product: true,
              unit: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecipeById(id: number): Promise<RecipeWithIncludes | null> {
    return await prisma.recipe.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        ingredients: {
          include: {
            product: {
              include: {
                unit: true,
                category: true,
              },
            },
            unit: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        menuItems: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async updateRecipe(id: number, data: RecipeUpdateInput): Promise<Recipe> {
    try {
      // Если обновляются ингредиенты, пересчитываем стоимость
      let costPrice: number | undefined;
      let sellingPrice: number | undefined;

      if (data.ingredients) {
        const costCalculation = await this.calculateRecipeCost(data.ingredients);
        costPrice = costCalculation.costPerPortion;
        
        if (data.marginPercent !== undefined) {
          sellingPrice = costPrice * (1 + data.marginPercent / 100);
        }
      } else if (data.marginPercent !== undefined) {
        // Если изменяется только маржа, получаем текущую себестоимость
        const currentRecipe = await prisma.recipe.findUnique({
          where: { id },
          select: { costPrice: true },
        });
        
        if (currentRecipe?.costPrice) {
          const currentCostPrice = parseFloat(currentRecipe.costPrice.toString());
          sellingPrice = currentCostPrice * (1 + data.marginPercent / 100);
        }
      }

      const recipe = await prisma.recipe.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.portionSize && { portionSize: new Prisma.Decimal(data.portionSize) }),
          ...(data.cookingTime !== undefined && { cookingTime: data.cookingTime }),
          ...(data.difficultyLevel !== undefined && { difficultyLevel: data.difficultyLevel }),
          ...(data.instructions !== undefined && { instructions: data.instructions }),
          ...(data.marginPercent !== undefined && { marginPercent: new Prisma.Decimal(data.marginPercent) }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(costPrice && { costPrice: new Prisma.Decimal(costPrice) }),
          ...(sellingPrice && { sellingPrice: new Prisma.Decimal(sellingPrice) }),
          ...(data.ingredients && {
            ingredients: {
              deleteMany: {},
              create: data.ingredients.map((ingredient, index) => ({
                productId: ingredient.productId,
                quantity: new Prisma.Decimal(ingredient.quantity),
                unitId: ingredient.unitId,
                costPerUnit: ingredient.costPerUnit ? new Prisma.Decimal(ingredient.costPerUnit) : null,
                isMain: ingredient.isMain || false,
                sortOrder: ingredient.sortOrder || index,
              })),
            },
          }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          ingredients: {
            include: {
              product: true,
              unit: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });

      return recipe;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Рецепт с таким названием уже существует');
        }
        if (error.code === 'P2025') {
          throw new Error('Рецепт не найден');
        }
      }
      throw error;
    }
  }

  async deleteRecipe(id: number): Promise<void> {
    try {
      await prisma.recipe.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Рецепт не найден');
        }
      }
      throw error;
    }
  }

  async calculateRecipeCost(ingredients: RecipeIngredientInput[]): Promise<RecipeCostCalculation> {
    const ingredientDetails = [];
    let totalCost = 0;

    for (const ingredient of ingredients) {
      // Получаем информацию о продукте и его текущую стоимость
      const product = await prisma.product.findUnique({
        where: { id: ingredient.productId },
        include: {
          unit: true,
          stockBalances: {
            select: {
              avgPrice: true,
            },
            take: 1,
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      });

      if (!product) {
        throw new Error(`Продукт с ID ${ingredient.productId} не найден`);
      }

      // Получаем единицу измерения для ингредиента
      const unit = await prisma.unit.findUnique({
        where: { id: ingredient.unitId },
      });

      if (!unit) {
        throw new Error(`Единица измерения с ID ${ingredient.unitId} не найдена`);
      }

      // Используем переданную стоимость или среднюю стоимость со склада
      let costPerUnit = ingredient.costPerUnit || 0;
      if (!costPerUnit && product.stockBalances.length > 0) {
        costPerUnit = parseFloat(product.stockBalances[0].avgPrice.toString());
      }

      // Конвертируем количество в базовую единицу измерения продукта
      let convertedQuantity = ingredient.quantity;
      if (ingredient.unitId !== product.unitId) {
        // Простая конвертация - в реальном проекте нужна более сложная логика
        // TODO: Реализовать правильную конвертацию единиц измерения
        convertedQuantity = ingredient.quantity;
      }

      const ingredientCost = convertedQuantity * costPerUnit;
      totalCost += ingredientCost;

      ingredientDetails.push({
        productId: product.id,
        productName: product.name,
        quantity: ingredient.quantity,
        unitName: unit.name,
        costPerUnit,
        totalCost: ingredientCost,
      });
    }

    return {
      totalCost,
      costPerPortion: totalCost,
      ingredients: ingredientDetails,
    };
  }

  async scaleRecipe(id: number, scaleFactor: number): Promise<RecipeCostCalculation> {
    const recipe = await this.getRecipeById(id);
    if (!recipe) {
      throw new Error('Рецепт не найден');
    }

    const scaledIngredients: RecipeIngredientInput[] = recipe.ingredients?.map(ingredient => ({
      productId: ingredient.productId,
      quantity: parseFloat(ingredient.quantity.toString()) * scaleFactor,
      unitId: ingredient.unitId,
      costPerUnit: ingredient.costPerUnit ? parseFloat(ingredient.costPerUnit.toString()) : undefined,
      isMain: ingredient.isMain,
      sortOrder: ingredient.sortOrder,
    })) || [];

    return await this.calculateRecipeCost(scaledIngredients);
  }

  async checkIngredientAvailability(id: number, warehouseId: number, portions: number = 1): Promise<{
    available: boolean;
    missingIngredients: {
      productId: number;
      productName: string;
      required: number;
      available: number;
      unitName: string;
    }[];
  }> {
    const recipe = await this.getRecipeById(id);
    if (!recipe) {
      throw new Error('Рецепт не найден');
    }

    const missingIngredients = [];

    for (const ingredient of recipe.ingredients || []) {
      const requiredQuantity = parseFloat(ingredient.quantity.toString()) * portions;
      
      // Получаем остатки на складе
      const stockBalance = await prisma.stockBalance.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: ingredient.productId,
          },
        },
      });

      const availableQuantity = stockBalance ? parseFloat(stockBalance.quantity.toString()) : 0;

      if (availableQuantity < requiredQuantity) {
        missingIngredients.push({
          productId: ingredient.productId,
          productName: ingredient.product.name,
          required: requiredQuantity,
          available: availableQuantity,
          unitName: ingredient.unit.name,
        });
      }
    }

    return {
      available: missingIngredients.length === 0,
      missingIngredients,
    };
  }

  async getRecipeProfitability(): Promise<{
    recipeId: number;
    recipeName: string;
    costPrice: number;
    sellingPrice: number;
    profit: number;
    profitMargin: number;
  }[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isActive: true,
        costPrice: { not: null },
        sellingPrice: { not: null },
      },
      select: {
        id: true,
        name: true,
        costPrice: true,
        sellingPrice: true,
      },
    });

    return recipes.map(recipe => {
      const costPrice = parseFloat(recipe.costPrice!.toString());
      const sellingPrice = parseFloat(recipe.sellingPrice!.toString());
      const profit = sellingPrice - costPrice;
      const profitMargin = (profit / sellingPrice) * 100;

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        costPrice,
        sellingPrice,
        profit,
        profitMargin,
      };
    });
  }
}

export const recipeService = new RecipeService();
