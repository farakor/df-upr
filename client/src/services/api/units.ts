import { api } from './client';
import type {
  Unit,
  UnitType,
  CreateUnitData,
  UpdateUnitData,
  UnitConversion,
  UnitConversionResult,
} from '@/types/nomenclature';

export class UnitsApi {
  private readonly basePath = '/units';

  // Получить список единиц измерения
  async getUnits(): Promise<Unit[]> {
    const response = await api.get<Unit[]>(this.basePath);
    return response.data;
  }

  // Получить базовые единицы измерения
  async getBaseUnits(): Promise<Unit[]> {
    const response = await api.get<Unit[]>(`${this.basePath}/base`);
    return response.data;
  }

  // Получить единицы измерения по типу
  async getUnitsByType(type: UnitType): Promise<Unit[]> {
    const response = await api.get<Unit[]>(`${this.basePath}/type/${type}`);
    return response.data;
  }

  // Получить единицу измерения по ID
  async getUnit(id: number): Promise<Unit> {
    const response = await api.get<Unit>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Получить цепочку конвертации единицы
  async getConversionChain(id: number): Promise<Unit[]> {
    const response = await api.get<Unit[]>(`${this.basePath}/${id}/conversion-chain`);
    return response.data;
  }

  // Создать единицу измерения
  async createUnit(data: CreateUnitData): Promise<Unit> {
    const response = await api.post<Unit>(this.basePath, data);
    return response.data;
  }

  // Обновить единицу измерения
  async updateUnit(id: number, data: UpdateUnitData): Promise<Unit> {
    const response = await api.put<Unit>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  // Удалить единицу измерения
  async deleteUnit(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Конвертировать количество между единицами
  async convertQuantity(data: UnitConversion): Promise<UnitConversionResult> {
    const response = await api.post<UnitConversionResult>(`${this.basePath}/convert`, data);
    return response.data;
  }

  // Создать стандартные единицы измерения
  async createDefaultUnits(): Promise<void> {
    await api.post(`${this.basePath}/create-defaults`);
  }
}

export const unitsApi = new UnitsApi();
