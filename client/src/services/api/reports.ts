import { api } from './client';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  warehouseId?: number;
  categoryId?: number;
}

export interface AbcAnalysisFilters extends ReportFilters {
  analysisType?: 'revenue' | 'quantity' | 'profit';
}

export interface SalesReportFilters extends ReportFilters {
  groupBy?: 'day' | 'week' | 'month';
}

export interface StockReportFilters {
  warehouseId?: number;
  categoryId?: number;
  lowStock?: boolean;
}

export interface ExportParams {
  reportType: string;
  [key: string]: any;
}

export interface ReportType {
  key: string;
  name: string;
  description: string;
  parameters: string[];
}

export interface TurnoverReportItem {
  product: {
    id: number;
    name: string;
    unit?: { name: string };
  };
  warehouse: {
    id: number;
    name: string;
  };
  initialQuantity: number;
  initialValue: number;
  incomingQuantity: number;
  incomingValue: number;
  outgoingQuantity: number;
  outgoingValue: number;
  finalQuantity: number;
  finalValue: number;
}

export interface ProfitabilityReportItem {
  saleId: number;
  saleDate: string;
  menuItem: string;
  quantity: number;
  price: number;
  revenue: number;
  costPrice: number;
  profit: number;
  profitMargin: number;
  warehouse: {
    id: number;
    name: string;
  };
}

export interface AbcAnalysisItem {
  product: {
    id: number;
    name: string;
  };
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
  salesCount: number;
  cumulativePercent: number;
  category: 'A' | 'B' | 'C';
  valuePercent: number;
}

export interface XyzAnalysisItem {
  product: {
    id: number;
    name: string;
  };
  averageQuantity: number;
  variationCoefficient: number;
  category: 'X' | 'Y' | 'Z';
  periodsCount: number;
  totalQuantity: number;
}

export interface SalesReportItem {
  period: string;
  salesCount: number;
  totalRevenue: number;
  averageCheck: number;
  itemsSold: number;
}

export interface StockReportItem {
  product: {
    id: number;
    name: string;
    unit?: { name: string };
    minStock?: number;
    maxStock?: number;
  };
  warehouse: {
    id: number;
    name: string;
  };
  currentQuantity: number;
  minStock?: number;
  maxStock?: number;
  stockValue: number;
  stockStatus: 'low' | 'normal' | 'high';
  lastUpdated: string;
}

class ReportsAPI {
  // Получение типов отчетов
  async getReportTypes(): Promise<ReportType[]> {
    const response = await api.get('/reports/types');
    return response.data.data;
  }

  // Оборотно-сальдовая ведомость
  async getTurnoverReport(filters: ReportFilters): Promise<TurnoverReportItem[]> {
    const response = await api.get('/reports/turnover', { params: filters });
    return response.data.data;
  }

  // Отчет по рентабельности
  async getProfitabilityReport(filters: ReportFilters): Promise<ProfitabilityReportItem[]> {
    const response = await api.get('/reports/profitability', { params: filters });
    return response.data.data;
  }

  // ABC анализ товаров
  async getAbcAnalysis(filters: AbcAnalysisFilters): Promise<AbcAnalysisItem[]> {
    const response = await api.get('/reports/abc-analysis', { params: filters });
    return response.data.data;
  }

  // XYZ анализ товаров
  async getXyzAnalysis(filters: ReportFilters): Promise<XyzAnalysisItem[]> {
    const response = await api.get('/reports/xyz-analysis', { params: filters });
    return response.data.data;
  }

  // Отчет по продажам
  async getSalesReport(filters: SalesReportFilters): Promise<SalesReportItem[]> {
    const response = await api.get('/reports/sales', { params: filters });
    return response.data.data;
  }

  // Отчет по остаткам
  async getStockReport(filters: StockReportFilters): Promise<StockReportItem[]> {
    const response = await api.get('/reports/stock', { params: filters });
    return response.data.data;
  }

  // Экспорт в Excel
  async exportToExcel(params: ExportParams): Promise<Blob> {
    const response = await api.post('/reports/export/excel', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Экспорт в PDF
  async exportToPdf(params: ExportParams): Promise<Blob> {
    const response = await api.post('/reports/export/pdf', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Вспомогательная функция для скачивания файла
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportsAPI = new ReportsAPI();
