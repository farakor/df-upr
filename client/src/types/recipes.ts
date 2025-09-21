// Типы для рецептур

import type { Product, Unit } from './nomenclature';

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  productId: number;
  quantity: string;
  unitId: number;
  costPerUnit?: string;
  isMain: boolean;
  sortOrder: number;
  createdAt: string;
  product: Product;
  unit: Unit;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  portionSize: string;
  cookingTime?: number;
  difficultyLevel?: number;
  instructions?: string;
  costPrice?: string;
  marginPercent: string;
  sellingPrice?: string;
  isActive: boolean;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  ingredients: RecipeIngredient[];
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  recipeId?: number;
  categoryId?: number;
  price: string;
  costPrice?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

// Типы для создания и обновления
export interface RecipeIngredientInput {
  productId: number;
  quantity: number;
  unitId: number;
  costPerUnit?: number;
  isMain?: boolean;
  sortOrder?: number;
}

export interface CreateRecipeData {
  name: string;
  description?: string;
  portionSize: number;
  cookingTime?: number;
  difficultyLevel?: number;
  instructions?: string;
  marginPercent?: number;
  ingredients: RecipeIngredientInput[];
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  isActive?: boolean;
}

// Типы для фильтров и пагинации
export interface RecipeFilters {
  search?: string;
  isActive?: boolean;
  difficultyLevel?: number;
  cookingTimeMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  totalPages: number;
}

// Типы для калькуляции стоимости
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

// Типы для масштабирования рецептов
export interface RecipeScaleData {
  scaleFactor: number;
}

export interface ScaledRecipeResult extends RecipeCostCalculation {
  scaleFactor: number;
}

// Типы для проверки наличия ингредиентов
export interface IngredientAvailabilityCheck {
  warehouseId: number;
  portions?: number;
}

export interface IngredientAvailability {
  available: boolean;
  missingIngredients: {
    productId: number;
    productName: string;
    required: number;
    available: number;
    unitName: string;
  }[];
}

// Типы для анализа рентабельности
export interface RecipeProfitability {
  recipeId: number;
  recipeName: string;
  costPrice: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
}

// Типы для технологической карты
export interface TechCard {
  recipe: {
    id: number;
    name: string;
    description?: string;
    portionSize: string;
    cookingTime?: number;
    difficultyLevel?: number;
    instructions?: string;
    costPrice?: string;
    sellingPrice?: string;
  };
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
    costPerUnit?: string;
    totalCost: number;
    isMain: boolean;
  }[];
  totalCost?: string;
  createdBy: string;
  createdAt: string;
}

// Типы для уровней сложности
export const DifficultyLevel = {
  VERY_EASY: 1,
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
  VERY_HARD: 5,
} as const;

export type DifficultyLevelType = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export const difficultyLabels = {
  [DifficultyLevel.VERY_EASY]: 'Очень легко',
  [DifficultyLevel.EASY]: 'Легко',
  [DifficultyLevel.MEDIUM]: 'Средне',
  [DifficultyLevel.HARD]: 'Сложно',
  [DifficultyLevel.VERY_HARD]: 'Очень сложно',
};

// Типы для валидации
export interface RecipeValidationError {
  field: string;
  message: string;
}

export interface RecipeFormErrors {
  name?: string;
  description?: string;
  portionSize?: string;
  cookingTime?: string;
  difficultyLevel?: string;
  instructions?: string;
  marginPercent?: string;
  ingredients?: string;
  general?: string;
}
