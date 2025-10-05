// Типы для номенклатуры

export const UnitType = {
  WEIGHT: 'WEIGHT',
  VOLUME: 'VOLUME',
  PIECE: 'PIECE',
  LENGTH: 'LENGTH',
} as const;

export type UnitTypeType = typeof UnitType[keyof typeof UnitType];

export interface Unit {
  id: number;
  name: string;
  shortName: string;
  type: UnitTypeType;
  baseUnitId?: number;
  conversionFactor: string;
  baseUnit?: Unit;
  derivedUnits: Unit[];
  _count?: {
    products: number;
  };
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  parent?: Category;
  children: Category[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface Product {
  id: number;
  name: string;
  article?: string;
  barcode?: string;
  categoryId?: number;
  unitId: number;
  isDish: boolean;
  recipeId?: number;
  shelfLifeDays?: number;
  storageTemperatureMin?: string;
  storageTemperatureMax?: string;
  storageConditions?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  unit: Unit;
  recipe?: {
    id: number;
    name: string;
    description?: string;
    portionSize: string;
    cookingTime?: number;
    costPrice?: string;
    sellingPrice?: string;
    ingredients?: {
      id: number;
      productId: number;
      quantity: string;
      unitId: number;
      product: {
        id: number;
        name: string;
      };
      unit: {
        id: number;
        name: string;
        shortName: string;
      };
    }[];
  };
  stockBalances?: StockBalance[];
}

export interface StockBalance {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: string;
  avgPrice: string;
  totalValue: string;
  lastMovementDate?: string;
  updatedAt: string;
  warehouse: {
    id: number;
    name: string;
    type: string;
  };
}

// Типы для создания и обновления
export interface CreateProductData {
  name: string;
  article?: string;
  barcode?: string;
  categoryId?: number;
  unitId: number;
  isDish?: boolean;
  recipeId?: number;
  shelfLifeDays?: number;
  storageTemperatureMin?: number;
  storageTemperatureMax?: number;
  storageConditions?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: string;
  parentId?: number;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export interface CreateUnitData {
  name: string;
  shortName: string;
  type: UnitTypeType;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

// Типы для фильтров и пагинации
export interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  unitId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
  includeInactive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Типы для конвертации единиц
export interface UnitConversion {
  fromUnitId: number;
  toUnitId: number;
  quantity: number;
}

export interface UnitConversionResult {
  fromUnitId: number;
  toUnitId: number;
  originalQuantity: number;
  convertedQuantity: number;
}

// Типы для массовых операций
export interface BulkCreateProductsData {
  products: CreateProductData[];
}

export interface BulkCreateResult {
  created: number;
  errors: string[];
}

// Типы для перемещения и сортировки категорий
export interface MoveCategoryData {
  parentId?: number;
}

export interface CategoryOrder {
  id: number;
  sortOrder: number;
}

export interface ReorderCategoriesData {
  categoryOrders: CategoryOrder[];
}
