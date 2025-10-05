import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { productService, ProductCreateInput, ProductUpdateInput, ProductFilters, PaginationOptions } from '../services/product.service';
import { logger } from '../utils/logger';

export class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: ProductCreateInput = req.body;
      const product = await productService.createProduct(productData);
      
      logger.info('Product created', { productId: product.id, name: product.name });
      res.status(201).json({
        success: true,
        data: product,
        message: 'Товар успешно создан',
      });
    } catch (error) {
      logger.error('Error creating product', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания товара',
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters: ProductFilters = {
        search: req.query.search as string,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        unitId: req.query.unitId ? parseInt(req.query.unitId as string) : undefined,
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'name',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await productService.getProducts(filters, pagination);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching products', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка товаров',
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.getProductById(id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Товар не найден',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error fetching product', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения товара',
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: ProductUpdateInput = req.body;
      
      const product = await productService.updateProduct(id, updateData);
      
      logger.info('Product updated', { productId: product.id, name: product.name });
      res.json({
        success: true,
        data: product,
        message: 'Товар успешно обновлен',
      });
    } catch (error) {
      logger.error('Error updating product', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления товара',
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await productService.deleteProduct(id);
      
      logger.info('Product deleted', { productId: id });
      res.json({
        success: true,
        message: 'Товар успешно удален',
      });
    } catch (error) {
      logger.error('Error deleting product', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления товара',
      });
    }
  }

  async getProductByArticle(req: Request, res: Response): Promise<void> {
    try {
      const article = req.params.article;
      const product = await productService.getProductByArticle(article);
      
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Товар с указанным артикулом не найден',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error fetching product by article', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения товара по артикулу',
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const products = await productService.getProductsByCategory(categoryId);
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error fetching products by category', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения товаров категории',
      });
    }
  }

  async bulkCreateProducts(req: Request, res: Response): Promise<void> {
    try {
      const products: ProductCreateInput[] = req.body.products;
      
      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Необходимо передать массив товаров',
        });
        return;
      }

      const result = await productService.bulkCreateProducts(products);
      
      logger.info('Bulk products created', { created: result.created, errors: result.errors.length });
      res.json({
        success: true,
        data: result,
        message: `Создано товаров: ${result.created}${result.errors.length > 0 ? `, ошибок: ${result.errors.length}` : ''}`,
      });
    } catch (error) {
      logger.error('Error bulk creating products', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка массового создания товаров',
      });
    }
  }

  async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const filters: ProductFilters = {
        search: req.query.search as string,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        isActive: req.query.isActive !== 'false',
        unitId: req.query.unitId ? parseInt(req.query.unitId as string) : undefined,
      };

      // Получаем все товары без пагинации для экспорта
      const result = await productService.getProducts(filters, { limit: 10000 });
      
      // Подготавливаем данные для Excel
      const excelData = result.products.map(product => ({
        'ID': product.id,
        'Название': product.name,
        'Артикул': product.article || '',
        'Штрихкод': product.barcode || '',
        'Категория': (product as any).category?.name || '',
        'Единица измерения': `${(product as any).unit?.name || ''} (${(product as any).unit?.shortName || ''})`,
        'Срок годности (дни)': product.shelfLifeDays || '',
        'Мин. температура (°C)': product.storageTemperatureMin || '',
        'Макс. температура (°C)': product.storageTemperatureMax || '',
        'Условия хранения': product.storageConditions || '',
        'Описание': product.description || '',
        'Статус': product.isActive ? 'Активен' : 'Неактивен',
        'Дата создания': new Date(product.createdAt).toLocaleDateString('ru-RU'),
        'Дата обновления': new Date(product.updatedAt).toLocaleDateString('ru-RU'),
      }));

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Настраиваем ширину колонок
      const columnWidths = [
        { wch: 5 },   // ID
        { wch: 30 },  // Название
        { wch: 15 },  // Артикул
        { wch: 15 },  // Штрихкод
        { wch: 20 },  // Категория
        { wch: 20 },  // Единица измерения
        { wch: 15 },  // Срок годности
        { wch: 15 },  // Мин. температура
        { wch: 15 },  // Макс. температура
        { wch: 30 },  // Условия хранения
        { wch: 40 },  // Описание
        { wch: 10 },  // Статус
        { wch: 15 },  // Дата создания
        { wch: 15 },  // Дата обновления
      ];
      worksheet['!cols'] = columnWidths;

      // Добавляем лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

      // Генерируем буфер
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Устанавливаем заголовки для скачивания
      const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      logger.info('Products exported to Excel', { count: result.products.length });
      res.send(buffer);
    } catch (error) {
      logger.error('Error exporting products to Excel', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка экспорта товаров в Excel',
      });
    }
  }

  async importFromExcel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Файл не предоставлен',
        });
        return;
      }

      // Читаем Excel файл
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Преобразуем данные в формат для создания товаров
      const products: ProductCreateInput[] = [];
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const rowNumber = i + 2; // +2 потому что первая строка - заголовки, а индексы с 0

        try {
          // Валидация обязательных полей
          if (!row['Название']) {
            errors.push(`Строка ${rowNumber}: Отсутствует название товара`);
            continue;
          }

          if (!row['Единица измерения']) {
            errors.push(`Строка ${rowNumber}: Отсутствует единица измерения`);
            continue;
          }

          // TODO: Здесь нужно найти ID единицы измерения по названию
          // Для простоты пока используем ID 1 (нужно будет доработать)
          const unitId = 1;

          const product: ProductCreateInput = {
            name: row['Название'].toString().trim(),
            article: row['Артикул'] ? row['Артикул'].toString().trim() : undefined,
            barcode: row['Штрихкод'] ? row['Штрихкод'].toString().trim() : undefined,
            unitId: unitId,
            shelfLifeDays: row['Срок годности (дни)'] ? parseInt(row['Срок годности (дни)']) : undefined,
            storageTemperatureMin: row['Мин. температура (°C)'] ? parseFloat(row['Мин. температура (°C)']) : undefined,
            storageTemperatureMax: row['Макс. температура (°C)'] ? parseFloat(row['Макс. температура (°C)']) : undefined,
            storageConditions: row['Условия хранения'] ? row['Условия хранения'].toString().trim() : undefined,
            description: row['Описание'] ? row['Описание'].toString().trim() : undefined,
          };

          products.push(product);
        } catch (error) {
          errors.push(`Строка ${rowNumber}: Ошибка обработки данных - ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
      }

      if (products.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Не найдено валидных товаров для импорта',
          errors,
        });
        return;
      }

      // Создаем товары
      const result = await productService.bulkCreateProducts(products);
      
      logger.info('Products imported from Excel', { 
        total: products.length, 
        created: result.created, 
        errors: result.errors.length 
      });

      res.json({
        success: true,
        data: {
          ...result,
          validationErrors: errors,
        },
        message: `Импорт завершен. Создано товаров: ${result.created}${result.errors.length > 0 ? `, ошибок: ${result.errors.length}` : ''}`,
      });
    } catch (error) {
      logger.error('Error importing products from Excel', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка импорта товаров из Excel',
      });
    }
  }
}

export const productController = new ProductController();
