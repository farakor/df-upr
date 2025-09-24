import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service';
import { logger } from '../utils/logger';

export class ReportsController {
  // Оборотно-сальдовая ведомость
  async getTurnoverReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId, categoryId } = req.query;
      
      const report = await reportsService.getTurnoverReport({
        startDate: startDate as string,
        endDate: endDate as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении оборотно-сальдовой ведомости:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Отчет по рентабельности
  async getProfitabilityReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId } = req.query;
      
      const report = await reportsService.getProfitabilityReport({
        startDate: startDate as string,
        endDate: endDate as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении отчета по рентабельности:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // ABC анализ товаров
  async getAbcAnalysis(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId, analysisType = 'revenue' } = req.query;
      
      const report = await reportsService.getAbcAnalysis({
        startDate: startDate as string,
        endDate: endDate as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        analysisType: analysisType as 'revenue' | 'quantity' | 'profit',
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении ABC анализа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // XYZ анализ товаров
  async getXyzAnalysis(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId } = req.query;
      
      const report = await reportsService.getXyzAnalysis({
        startDate: startDate as string,
        endDate: endDate as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении XYZ анализа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Отчет по продажам
  async getSalesReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId, groupBy = 'day' } = req.query;
      
      const report = await reportsService.getSalesReport({
        startDate: startDate as string,
        endDate: endDate as string,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        groupBy: groupBy as 'day' | 'week' | 'month',
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении отчета по продажам:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Отчет по остаткам
  async getStockReport(req: Request, res: Response) {
    try {
      const { warehouseId, categoryId, lowStock = false } = req.query;
      
      const report = await reportsService.getStockReport({
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        lowStock: lowStock === 'true',
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Ошибка при получении отчета по остаткам:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Экспорт отчета в Excel
  async exportToExcel(req: Request, res: Response) {
    try {
      const { reportType, ...params } = req.body;
      
      const buffer = await reportsService.exportToExcel(reportType, params);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      res.send(buffer);
    } catch (error) {
      logger.error('Ошибка при экспорте в Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при экспорте отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Экспорт отчета в PDF
  async exportToPdf(req: Request, res: Response) {
    try {
      const { reportType, ...params } = req.body;
      
      const buffer = await reportsService.exportToPdf(reportType, params);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      res.send(buffer);
    } catch (error) {
      logger.error('Ошибка при экспорте в PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при экспорте отчета',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  // Получение доступных типов отчетов
  async getReportTypes(req: Request, res: Response) {
    try {
      const reportTypes = reportsService.getAvailableReportTypes();
      
      res.json({
        success: true,
        data: reportTypes,
      });
    } catch (error) {
      logger.error('Ошибка при получении типов отчетов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении типов отчетов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}

export const reportsController = new ReportsController();
