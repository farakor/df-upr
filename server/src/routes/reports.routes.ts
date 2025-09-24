import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { reportsValidation } from '../validation/reports.validation';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authMiddleware);

// Получение типов отчетов
router.get('/types', reportsController.getReportTypes);

// Оборотно-сальдовая ведомость
router.get('/turnover', 
  validate({ query: reportsValidation.getTurnoverReport.query }), 
  reportsController.getTurnoverReport
);

// Отчет по рентабельности
router.get('/profitability', 
  validate({ query: reportsValidation.getProfitabilityReport.query }), 
  reportsController.getProfitabilityReport
);

// ABC анализ товаров
router.get('/abc-analysis', 
  validate({ query: reportsValidation.getAbcAnalysis.query }), 
  reportsController.getAbcAnalysis
);

// XYZ анализ товаров
router.get('/xyz-analysis', 
  validate({ query: reportsValidation.getXyzAnalysis.query }), 
  reportsController.getXyzAnalysis
);

// Отчет по продажам
router.get('/sales', 
  validate({ query: reportsValidation.getSalesReport.query }), 
  reportsController.getSalesReport
);

// Отчет по остаткам
router.get('/stock', 
  validate({ query: reportsValidation.getStockReport.query }), 
  reportsController.getStockReport
);

// Экспорт отчетов
router.post('/export/excel', 
  validate({ body: reportsValidation.exportReport.body }), 
  reportsController.exportToExcel
);

router.post('/export/pdf', 
  validate({ body: reportsValidation.exportReport.body }), 
  reportsController.exportToPdf
);

export default router;
