import { Request, Response } from 'express';
import { SalesService, CreateSaleData, SalesFilter, SalesStatsFilter, CreateProductionLogData } from '../services/sales.service';
import { logger } from '../utils/logger';

const salesService = new SalesService();

export class SalesController {
  async createSale(req: Request, res: Response): Promise<void> {
    try {
      const saleData: CreateSaleData = req.body;
      const cashierId = req.user?.id;

      if (!cashierId) {
        res.status(401).json({
          success: false,
          message: 'Пользователь не авторизован'
        });
        return;
      }

      const sale = await salesService.createSale(saleData, cashierId);

      logger.info(`Пользователь ${cashierId} создал продажу ${sale.id}`);

      res.status(201).json({
        success: true,
        data: sale,
        message: 'Продажа успешно создана'
      });
    } catch (error) {
      logger.error('Ошибка при создании продажи:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка при создании продажи'
      });
    }
  }

  async getSales(req: Request, res: Response): Promise<void> {
    try {
      const filter: SalesFilter = {
        warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId as string) : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        cashierId: req.query.cashierId ? parseInt(req.query.cashierId as string) : undefined,
        paymentMethod: req.query.paymentMethod as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await salesService.getSales(filter);

      res.json({
        success: true,
        data: result.sales,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Ошибка при получении продаж:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении продаж'
      });
    }
  }

  async getSaleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const sale = await salesService.getSaleById(id);

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      logger.error('Ошибка при получении продажи:', error);
      
      if (error instanceof Error && error.message === 'Продажа не найдена') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Ошибка при получении продажи'
      });
    }
  }

  async getSalesStats(req: Request, res: Response): Promise<void> {
    try {
      const filter: SalesStatsFilter = {
        warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId as string) : undefined,
        dateFrom: new Date(req.query.dateFrom as string),
        dateTo: new Date(req.query.dateTo as string),
        groupBy: (req.query.groupBy as any) || 'day'
      };

      const stats = await salesService.getSalesStats(filter);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Ошибка при получении статистики продаж:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка при получении статистики продаж'
      });
    }
  }

  async createProductionLog(req: Request, res: Response): Promise<void> {
    try {
      const productionData: CreateProductionLogData = req.body;
      const createdById = req.user?.id;

      if (!createdById) {
        res.status(401).json({
          success: false,
          message: 'Пользователь не авторизован'
        });
        return;
      }

      const productionLog = await salesService.createProductionLog(productionData, createdById);

      logger.info(`Пользователь ${createdById} создал лог производства ${productionLog.id}`);

      res.status(201).json({
        success: true,
        data: productionLog,
        message: 'Лог производства успешно создан'
      });
    } catch (error) {
      logger.error('Ошибка при создании лога производства:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка при создании лога производства'
      });
    }
  }

  async getDailySummary(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = req.query.warehouseId ? parseInt(req.query.warehouseId as string) : undefined;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      
      // Устанавливаем начало и конец дня
      const dateFrom = new Date(date);
      dateFrom.setHours(0, 0, 0, 0);
      
      const dateTo = new Date(date);
      dateTo.setHours(23, 59, 59, 999);

      const filter: SalesFilter = {
        warehouseId,
        dateFrom,
        dateTo,
        page: 1,
        limit: 1000 // Получаем все продажи за день
      };

      const result = await salesService.getSales(filter);
      
      // Рассчитываем сводку
      const summary = {
        date: date.toISOString().slice(0, 10),
        totalSales: result.sales.length,
        totalAmount: result.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
        totalDiscount: result.sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0),
        paymentMethods: {} as Record<string, { count: number; amount: number }>,
        topMenuItems: [] as Array<{ name: string; quantity: number; amount: number }>,
        cashiers: {} as Record<string, { count: number; amount: number }>
      };

      // Группируем по способам оплаты
      result.sales.forEach(sale => {
        const method = sale.paymentMethod;
        if (!summary.paymentMethods[method]) {
          summary.paymentMethods[method] = { count: 0, amount: 0 };
        }
        summary.paymentMethods[method].count += 1;
        summary.paymentMethods[method].amount += Number(sale.totalAmount);
      });

      // Группируем по кассирам
      result.sales.forEach(sale => {
        if (sale.cashier) {
          const cashierName = `${sale.cashier.firstName} ${sale.cashier.lastName}`;
          if (!summary.cashiers[cashierName]) {
            summary.cashiers[cashierName] = { count: 0, amount: 0 };
          }
          summary.cashiers[cashierName].count += 1;
          summary.cashiers[cashierName].amount += Number(sale.totalAmount);
        }
      });

      // Топ позиций меню
      const menuItemStats = new Map();
      result.sales.forEach(sale => {
        sale.items.forEach(item => {
          const key = item.menuItem.name;
          if (!menuItemStats.has(key)) {
            menuItemStats.set(key, { quantity: 0, amount: 0 });
          }
          const stats = menuItemStats.get(key);
          stats.quantity += Number(item.quantity);
          stats.amount += Number(item.total);
        });
      });

      summary.topMenuItems = Array.from(menuItemStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Ошибка при получении дневной сводки:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении дневной сводки'
      });
    }
  }

  async getAvailableMenu(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.warehouseId);

      // Получаем доступное меню для склада
      const menuItems = await salesService.getAvailableMenuForWarehouse(warehouseId);

      res.json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      logger.error('Ошибка при получении доступного меню:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении доступного меню'
      });
    }
  }
}
