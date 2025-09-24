import { useState, useCallback } from 'react';
import { 
  reportsAPI, 
  ReportFilters, 
  AbcAnalysisFilters, 
  SalesReportFilters, 
  StockReportFilters,
  ExportParams,
  ReportType,
  TurnoverReportItem,
  ProfitabilityReportItem,
  AbcAnalysisItem,
  XyzAnalysisItem,
  SalesReportItem,
  StockReportItem
} from '../services/api/reports';

interface UseReportsState {
  reportTypes: ReportType[];
  turnoverData: TurnoverReportItem[];
  profitabilityData: ProfitabilityReportItem[];
  abcData: AbcAnalysisItem[];
  xyzData: XyzAnalysisItem[];
  salesData: SalesReportItem[];
  stockData: StockReportItem[];
  loading: boolean;
  error: string | null;
}

export const useReports = () => {
  const [state, setState] = useState<UseReportsState>({
    reportTypes: [],
    turnoverData: [],
    profitabilityData: [],
    abcData: [],
    xyzData: [],
    salesData: [],
    stockData: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  // Получение типов отчетов
  const fetchReportTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getReportTypes();
      setState(prev => ({ ...prev, reportTypes: data }));
    } catch (error) {
      console.error('Ошибка при получении типов отчетов:', error);
      setError('Не удалось загрузить типы отчетов');
    } finally {
      setLoading(false);
    }
  }, []);

  // Оборотно-сальдовая ведомость
  const fetchTurnoverReport = useCallback(async (filters: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getTurnoverReport(filters);
      setState(prev => ({ ...prev, turnoverData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении оборотно-сальдовой ведомости:', error);
      setError('Не удалось загрузить оборотно-сальдовую ведомость');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Отчет по рентабельности
  const fetchProfitabilityReport = useCallback(async (filters: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getProfitabilityReport(filters);
      setState(prev => ({ ...prev, profitabilityData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении отчета по рентабельности:', error);
      setError('Не удалось загрузить отчет по рентабельности');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ABC анализ
  const fetchAbcAnalysis = useCallback(async (filters: AbcAnalysisFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getAbcAnalysis(filters);
      setState(prev => ({ ...prev, abcData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении ABC анализа:', error);
      setError('Не удалось загрузить ABC анализ');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // XYZ анализ
  const fetchXyzAnalysis = useCallback(async (filters: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getXyzAnalysis(filters);
      setState(prev => ({ ...prev, xyzData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении XYZ анализа:', error);
      setError('Не удалось загрузить XYZ анализ');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Отчет по продажам
  const fetchSalesReport = useCallback(async (filters: SalesReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getSalesReport(filters);
      setState(prev => ({ ...prev, salesData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении отчета по продажам:', error);
      setError('Не удалось загрузить отчет по продажам');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Отчет по остаткам
  const fetchStockReport = useCallback(async (filters: StockReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getStockReport(filters);
      setState(prev => ({ ...prev, stockData: data }));
      return data;
    } catch (error) {
      console.error('Ошибка при получении отчета по остаткам:', error);
      setError('Не удалось загрузить отчет по остаткам');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Экспорт в Excel
  const exportToExcel = useCallback(async (params: ExportParams, filename?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsAPI.exportToExcel(params);
      const defaultFilename = `report_${params.reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      reportsAPI.downloadFile(blob, filename || defaultFilename);
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      setError('Не удалось экспортировать отчет в Excel');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Экспорт в PDF
  const exportToPdf = useCallback(async (params: ExportParams, filename?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsAPI.exportToPdf(params);
      const defaultFilename = `report_${params.reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      reportsAPI.downloadFile(blob, filename || defaultFilename);
    } catch (error) {
      console.error('Ошибка при экспорте в PDF:', error);
      setError('Не удалось экспортировать отчет в PDF');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Очистка данных
  const clearData = useCallback(() => {
    setState(prev => ({
      ...prev,
      turnoverData: [],
      profitabilityData: [],
      abcData: [],
      xyzData: [],
      salesData: [],
      stockData: [],
    }));
  }, []);

  return {
    ...state,
    fetchReportTypes,
    fetchTurnoverReport,
    fetchProfitabilityReport,
    fetchAbcAnalysis,
    fetchXyzAnalysis,
    fetchSalesReport,
    fetchStockReport,
    exportToExcel,
    exportToPdf,
    clearError,
    clearData,
  };
};
