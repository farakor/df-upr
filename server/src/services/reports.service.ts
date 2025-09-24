import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  warehouseId?: number;
  categoryId?: number;
}

interface AbcAnalysisFilters extends ReportFilters {
  analysisType: 'revenue' | 'quantity' | 'profit';
}

interface SalesReportFilters extends ReportFilters {
  groupBy: 'day' | 'week' | 'month';
}

interface StockReportFilters {
  warehouseId?: number;
  categoryId?: number;
  lowStock?: boolean;
}

export class ReportsService {
  // Оборотно-сальдовая ведомость
  async getTurnoverReport(filters: ReportFilters) {
    try {
      const { startDate, endDate, warehouseId, categoryId } = filters;
      
      // Получаем начальные остатки
      const initialBalances = await prisma.stockBalance.findMany({
        where: {
          warehouseId: warehouseId,
          product: categoryId ? { categoryId } : undefined,
        },
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
          warehouse: true,
        },
      });

      // Получаем движения за период
      const movements = await prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
          warehouseId: warehouseId,
          product: categoryId ? { categoryId } : undefined,
        },
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
          warehouse: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Группируем по товарам и складам
      const reportData = new Map();

      // Добавляем начальные остатки
      for (const balance of initialBalances) {
        const key = `${balance.productId}-${balance.warehouseId}`;
        // Получаем среднюю цену из последних движений
        const avgPrice = await this.getAverageProductPrice(balance.productId);
        
        reportData.set(key, {
          product: balance.product,
          warehouse: balance.warehouse,
          initialQuantity: Number(balance.quantity),
          initialValue: Number(balance.quantity) * avgPrice,
          incomingQuantity: 0,
          incomingValue: 0,
          outgoingQuantity: 0,
          outgoingValue: 0,
          finalQuantity: Number(balance.quantity),
          finalValue: Number(balance.quantity) * avgPrice,
        });
      }

      // Обрабатываем движения
      for (const movement of movements) {
        const key = `${movement.productId}-${movement.warehouseId}`;
        let item = reportData.get(key);
        
        if (!item) {
          item = {
            product: movement.product,
            warehouse: movement.warehouse,
            initialQuantity: 0,
            initialValue: 0,
            incomingQuantity: 0,
            incomingValue: 0,
            outgoingQuantity: 0,
            outgoingValue: 0,
            finalQuantity: 0,
            finalValue: 0,
          };
          reportData.set(key, item);
        }

        const unitPrice = movement.price ? Number(movement.price) : await this.getAverageProductPrice(movement.productId);
        const value = Number(movement.quantity) * unitPrice;

        if (movement.type === 'IN') {
          item.incomingQuantity += Number(movement.quantity);
          item.incomingValue += value;
          item.finalQuantity += Number(movement.quantity);
          item.finalValue += value;
        } else {
          item.outgoingQuantity += Number(movement.quantity);
          item.outgoingValue += value;
          item.finalQuantity -= Number(movement.quantity);
          item.finalValue -= value;
        }
      }

      return Array.from(reportData.values());
    } catch (error) {
      logger.error('Ошибка при формировании оборотно-сальдовой ведомости:', error);
      throw error;
    }
  }

  // Отчет по рентабельности
  async getProfitabilityReport(filters: ReportFilters) {
    try {
      const { startDate, endDate, warehouseId } = filters;

      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
          warehouseId: warehouseId,
        },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  recipe: {
                    include: {
                      ingredients: {
                        include: {
                          product: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          warehouse: true,
        },
      });

      const profitabilityData = [];

      for (const sale of sales) {
        for (const item of sale.items) {
          let costPrice = 0;
          
          // Рассчитываем себестоимость через рецептуру
          if (item.menuItem.recipe) {
            for (const ingredient of item.menuItem.recipe.ingredients) {
              const avgPrice = await this.getAverageProductPrice(ingredient.productId);
              costPrice += Number(ingredient.quantity) * avgPrice;
            }
          }

          const revenue = Number(item.price) * Number(item.quantity);
          const profit = revenue - (costPrice * Number(item.quantity));
          const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

          profitabilityData.push({
            saleId: sale.id,
            saleDate: sale.createdAt,
            menuItem: item.menuItem.name,
            quantity: item.quantity,
            price: item.price,
            revenue,
            costPrice: costPrice * Number(item.quantity),
            profit,
            profitMargin,
            warehouse: sale.warehouse,
          });
        }
      }

      return profitabilityData;
    } catch (error) {
      logger.error('Ошибка при формировании отчета по рентабельности:', error);
      throw error;
    }
  }

  // ABC анализ товаров
  async getAbcAnalysis(filters: AbcAnalysisFilters) {
    try {
      const { startDate, endDate, warehouseId, analysisType } = filters;

      // Получаем данные по продажам
      const salesData = await prisma.saleItem.findMany({
        where: {
          sale: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
            warehouseId: warehouseId,
          },
        },
        include: {
          menuItem: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
          sale: true,
        },
      });

      // Группируем данные по товарам
      const productStats = new Map();

      for (const item of salesData) {
        if (!item.menuItem.recipe) continue;

        for (const ingredient of item.menuItem.recipe.ingredients) {
          const productId = ingredient.productId;
          const usedQuantity = Number(ingredient.quantity) * Number(item.quantity);
          
          let stats = productStats.get(productId);
          if (!stats) {
            stats = {
              product: ingredient.product,
              totalQuantity: 0,
              totalRevenue: 0,
              totalProfit: 0,
              salesCount: 0,
            };
            productStats.set(productId, stats);
          }

          stats.totalQuantity += usedQuantity;
          stats.totalRevenue += (Number(item.price) / (item.menuItem.recipe?.ingredients.length || 1)) * Number(item.quantity);
          stats.salesCount += Number(item.quantity);
          
          // Упрощенный расчет прибыли
          const avgPrice = await this.getAverageProductPrice(ingredient.productId);
          const costPrice = Number(ingredient.quantity) * avgPrice;
          stats.totalProfit += (stats.totalRevenue - costPrice * Number(item.quantity));
        }
      }

      // Сортируем по выбранному критерию
      const sortedProducts = Array.from(productStats.values()).sort((a, b) => {
        switch (analysisType) {
          case 'revenue':
            return b.totalRevenue - a.totalRevenue;
          case 'quantity':
            return b.totalQuantity - a.totalQuantity;
          case 'profit':
            return b.totalProfit - a.totalProfit;
          default:
            return b.totalRevenue - a.totalRevenue;
        }
      });

      // Рассчитываем накопительные проценты и присваиваем категории ABC
      let totalValue = 0;
      const criteriaField = analysisType === 'revenue' ? 'totalRevenue' : 
                           analysisType === 'quantity' ? 'totalQuantity' : 'totalProfit';
      
      sortedProducts.forEach(item => {
        totalValue += item[criteriaField];
      });

      let cumulativeValue = 0;
      const result = sortedProducts.map(item => {
        cumulativeValue += item[criteriaField];
        const cumulativePercent = (cumulativeValue / totalValue) * 100;
        
        let category = 'C';
        if (cumulativePercent <= 80) category = 'A';
        else if (cumulativePercent <= 95) category = 'B';

        return {
          ...item,
          cumulativePercent,
          category,
          valuePercent: (item[criteriaField] / totalValue) * 100,
        };
      });

      return result;
    } catch (error) {
      logger.error('Ошибка при формировании ABC анализа:', error);
      throw error;
    }
  }

  // XYZ анализ товаров (анализ стабильности спроса)
  async getXyzAnalysis(filters: ReportFilters) {
    try {
      const { startDate, endDate, warehouseId } = filters;

      // Получаем данные по продажам по периодам
      const salesData = await prisma.saleItem.findMany({
        where: {
          sale: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
            warehouseId: warehouseId,
          },
        },
        include: {
          menuItem: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
          sale: true,
        },
        orderBy: {
          sale: {
            createdAt: 'asc',
          },
        },
      });

      // Группируем по товарам и периодам (неделям)
      const productPeriods = new Map();

      for (const item of salesData) {
        if (!item.menuItem.recipe) continue;

        const weekStart = new Date(item.sale.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        for (const ingredient of item.menuItem.recipe.ingredients) {
          const productId = ingredient.productId;
          const usedQuantity = Number(ingredient.quantity) * Number(item.quantity);
          
          if (!productPeriods.has(productId)) {
            productPeriods.set(productId, {
              product: ingredient.product,
              periods: new Map(),
            });
          }

          const productData = productPeriods.get(productId);
          const currentPeriodQuantity = productData.periods.get(weekKey) || 0;
          productData.periods.set(weekKey, currentPeriodQuantity + usedQuantity);
        }
      }

      // Рассчитываем коэффициент вариации для каждого товара
      const result = Array.from(productPeriods.values()).map(item => {
        const quantities: number[] = Array.from(item.periods.values());
        
        if (quantities.length === 0) {
          return {
            product: item.product,
            averageQuantity: 0,
            variationCoefficient: 0,
            category: 'Z',
            periodsCount: 0,
          };
        }

        const sum = quantities.reduce((a, b) => a + b, 0);
        const average = sum / quantities.length;
        
        const variance = quantities.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / quantities.length;
        const standardDeviation = Math.sqrt(variance);
        const variationCoefficient = average > 0 ? (standardDeviation / average) * 100 : 0;

        let category = 'Z';
        if (variationCoefficient <= 10) category = 'X';
        else if (variationCoefficient <= 25) category = 'Y';

        return {
          product: item.product,
          averageQuantity: average,
          variationCoefficient,
          category,
          periodsCount: quantities.length,
          totalQuantity: sum,
        };
      });

      return result.sort((a, b) => a.variationCoefficient - b.variationCoefficient);
    } catch (error) {
      logger.error('Ошибка при формировании XYZ анализа:', error);
      throw error;
    }
  }

  // Отчет по продажам
  async getSalesReport(filters: SalesReportFilters) {
    try {
      const { startDate, endDate, warehouseId, groupBy } = filters;

      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
          warehouseId: warehouseId,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          warehouse: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Группируем данные по периодам
      const groupedData = new Map();

      for (const sale of sales) {
        let periodKey: string;
        const date = new Date(sale.createdAt);

        switch (groupBy) {
          case 'day':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            periodKey = date.toISOString().split('T')[0];
        }

        if (!groupedData.has(periodKey)) {
          groupedData.set(periodKey, {
            period: periodKey,
            salesCount: 0,
            totalRevenue: 0,
            averageCheck: 0,
            itemsSold: 0,
          });
        }

        const periodData = groupedData.get(periodKey);
        periodData.salesCount += 1;
        periodData.totalRevenue += Number(sale.totalAmount);
        periodData.itemsSold += sale.items.reduce((sum, item) => sum + Number(item.quantity), 0);
      }

      // Рассчитываем средний чек
      Array.from(groupedData.values()).forEach(period => {
        period.averageCheck = period.salesCount > 0 ? period.totalRevenue / period.salesCount : 0;
      });

      return Array.from(groupedData.values()).sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      logger.error('Ошибка при формировании отчета по продажам:', error);
      throw error;
    }
  }

  // Отчет по остаткам
  async getStockReport(filters: StockReportFilters) {
    try {
      const { warehouseId, categoryId, lowStock } = filters;

      const stockBalances = await prisma.stockBalance.findMany({
        where: {
          warehouseId: warehouseId,
          product: categoryId ? { categoryId } : undefined,
          // Убираем фильтр по minStock, так как поля нет в модели
        },
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
          warehouse: true,
        },
        orderBy: [
          { warehouse: { name: 'asc' } },
          { product: { name: 'asc' } },
        ],
      });

      const result = [];
      
      for (const balance of stockBalances) {
        const avgPrice = await this.getAverageProductPrice(balance.productId);
        const currentQuantity = Number(balance.quantity);
        
        // Поскольку полей minStock и maxStock нет в модели, используем условные значения
        const minStock = 10; // Условное минимальное значение
        const maxStock = 1000; // Условное максимальное значение
        
        result.push({
          product: balance.product,
          warehouse: balance.warehouse,
          currentQuantity,
          minStock,
          maxStock,
          stockValue: currentQuantity * avgPrice,
          stockStatus: currentQuantity <= minStock ? 'low' : 
                      currentQuantity >= maxStock ? 'high' : 'normal',
          lastUpdated: balance.updatedAt,
        });
      }
      
      // Фильтруем по низким остаткам если нужно
      return lowStock ? result.filter(item => item.stockStatus === 'low') : result;
    } catch (error) {
      logger.error('Ошибка при формировании отчета по остаткам:', error);
      throw error;
    }
  }

  // Экспорт в Excel
  async exportToExcel(reportType: string, params: any): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Отчет');

      let data: any[] = [];
      let headers: string[] = [];

      switch (reportType) {
        case 'turnover':
          data = await this.getTurnoverReport(params);
          headers = ['Товар', 'Склад', 'Нач. остаток', 'Приход', 'Расход', 'Кон. остаток'];
          break;
        case 'profitability':
          data = await this.getProfitabilityReport(params);
          headers = ['Дата', 'Блюдо', 'Количество', 'Выручка', 'Себестоимость', 'Прибыль', 'Рентабельность %'];
          break;
        case 'abc':
          data = await this.getAbcAnalysis(params);
          headers = ['Товар', 'Количество', 'Выручка', 'Доля %', 'Накопительно %', 'Категория'];
          break;
        case 'xyz':
          data = await this.getXyzAnalysis(params);
          headers = ['Товар', 'Среднее количество', 'Коэф. вариации', 'Категория'];
          break;
        case 'sales':
          data = await this.getSalesReport(params);
          headers = ['Период', 'Количество продаж', 'Выручка', 'Средний чек', 'Товаров продано'];
          break;
        case 'stock':
          data = await this.getStockReport(params);
          headers = ['Товар', 'Склад', 'Остаток', 'Мин. остаток', 'Стоимость остатка', 'Статус'];
          break;
        default:
          throw new Error('Неизвестный тип отчета');
      }

      // Добавляем заголовки
      worksheet.addRow(headers);

      // Добавляем данные
      data.forEach(row => {
        const rowData = this.formatRowForExcel(row, reportType);
        worksheet.addRow(rowData);
      });

      // Стилизация заголовков
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Автоширина колонок
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      return await workbook.xlsx.writeBuffer() as Buffer;
    } catch (error) {
      logger.error('Ошибка при экспорте в Excel:', error);
      throw error;
    }
  }

  // Экспорт в PDF
  async exportToPdf(reportType: string, params: any): Promise<Buffer> {
    try {
      return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Заголовок
        doc.fontSize(16).text(`Отчет: ${this.getReportTitle(reportType)}`, { align: 'center' });
        doc.moveDown();

        // Получаем данные
        let data: any[] = [];
        switch (reportType) {
          case 'turnover':
            data = await this.getTurnoverReport(params);
            break;
          case 'profitability':
            data = await this.getProfitabilityReport(params);
            break;
          case 'abc':
            data = await this.getAbcAnalysis(params);
            break;
          case 'xyz':
            data = await this.getXyzAnalysis(params);
            break;
          case 'sales':
            data = await this.getSalesReport(params);
            break;
          case 'stock':
            data = await this.getStockReport(params);
            break;
          default:
            reject(new Error('Неизвестный тип отчета'));
            return;
        }

        // Добавляем данные в PDF
        doc.fontSize(12);
        data.slice(0, 50).forEach((item, index) => { // Ограничиваем количество строк
          const text = this.formatRowForPdf(item, reportType);
          doc.text(`${index + 1}. ${text}`);
        });

        if (data.length > 50) {
          doc.text(`... и еще ${data.length - 50} записей`);
        }

        doc.end();
      });
    } catch (error) {
      logger.error('Ошибка при экспорте в PDF:', error);
      throw error;
    }
  }

  // Получение доступных типов отчетов
  getAvailableReportTypes() {
    return [
      {
        key: 'turnover',
        name: 'Оборотно-сальдовая ведомость',
        description: 'Отчет по движению товаров за период',
        parameters: ['startDate', 'endDate', 'warehouseId', 'categoryId'],
      },
      {
        key: 'profitability',
        name: 'Отчет по рентабельности',
        description: 'Анализ прибыльности продаж',
        parameters: ['startDate', 'endDate', 'warehouseId'],
      },
      {
        key: 'abc',
        name: 'ABC анализ',
        description: 'Анализ товаров по важности',
        parameters: ['startDate', 'endDate', 'warehouseId', 'analysisType'],
      },
      {
        key: 'xyz',
        name: 'XYZ анализ',
        description: 'Анализ стабильности спроса',
        parameters: ['startDate', 'endDate', 'warehouseId'],
      },
      {
        key: 'sales',
        name: 'Отчет по продажам',
        description: 'Статистика продаж по периодам',
        parameters: ['startDate', 'endDate', 'warehouseId', 'groupBy'],
      },
      {
        key: 'stock',
        name: 'Отчет по остаткам',
        description: 'Текущие остатки товаров',
        parameters: ['warehouseId', 'categoryId', 'lowStock'],
      },
    ];
  }

  private formatRowForExcel(row: any, reportType: string): any[] {
    switch (reportType) {
      case 'turnover':
        return [
          row.product.name,
          row.warehouse.name,
          row.initialQuantity,
          row.incomingQuantity,
          row.outgoingQuantity,
          row.finalQuantity,
        ];
      case 'profitability':
        return [
          row.saleDate.toISOString().split('T')[0],
          row.menuItem,
          row.quantity,
          row.revenue,
          row.costPrice,
          row.profit,
          row.profitMargin.toFixed(2),
        ];
      case 'abc':
        return [
          row.product.name,
          row.totalQuantity,
          row.totalRevenue,
          row.valuePercent.toFixed(2),
          row.cumulativePercent.toFixed(2),
          row.category,
        ];
      case 'xyz':
        return [
          row.product.name,
          row.averageQuantity.toFixed(2),
          row.variationCoefficient.toFixed(2),
          row.category,
        ];
      case 'sales':
        return [
          row.period,
          row.salesCount,
          row.totalRevenue,
          row.averageCheck.toFixed(2),
          row.itemsSold,
        ];
      case 'stock':
        return [
          row.product.name,
          row.warehouse.name,
          row.currentQuantity,
          row.minStock,
          row.stockValue,
          row.stockStatus,
        ];
      default:
        return [];
    }
  }

  private formatRowForPdf(row: any, reportType: string): string {
    switch (reportType) {
      case 'turnover':
        return `${row.product.name} (${row.warehouse.name}): ${row.finalQuantity} ${row.product.unit?.name || 'шт'}`;
      case 'profitability':
        return `${row.menuItem}: прибыль ${row.profit.toFixed(2)} руб (${row.profitMargin.toFixed(1)}%)`;
      case 'abc':
        return `${row.product.name}: категория ${row.category}, доля ${row.valuePercent.toFixed(1)}%`;
      case 'xyz':
        return `${row.product.name}: категория ${row.category}, вариация ${row.variationCoefficient.toFixed(1)}%`;
      case 'sales':
        return `${row.period}: ${row.salesCount} продаж, выручка ${row.totalRevenue.toFixed(2)} руб`;
      case 'stock':
        return `${row.product.name}: ${row.currentQuantity} ${row.product.unit?.name || 'шт'} (${row.stockStatus})`;
      default:
        return '';
    }
  }

  private getReportTitle(reportType: string): string {
    const types = this.getAvailableReportTypes();
    const type = types.find(t => t.key === reportType);
    return type ? type.name : 'Неизвестный отчет';
  }

  // Вспомогательный метод для получения средней цены товара
  private async getAverageProductPrice(productId: number): Promise<number> {
    try {
      // Получаем последние движения товара для расчета средней цены
      const recentMovements = await prisma.stockMovement.findMany({
        where: {
          productId,
          price: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (recentMovements.length === 0) {
        return 0;
      }

      const totalValue = recentMovements.reduce((sum, movement) => {
        return sum + (Number(movement.price) || 0);
      }, 0);

      return totalValue / recentMovements.length;
    } catch (error) {
      logger.error('Ошибка при получении средней цены товара:', error);
      return 0;
    }
  }
}

export const reportsService = new ReportsService();
