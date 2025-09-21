import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import unitRoutes from './unit.routes';
import warehouseRoutes from './warehouse.routes';
import supplierRoutes from './supplier.routes';
import documentRoutes from './document.routes';
import stockMovementRoutes from './stockMovement.routes';
import lowStockRoutes from './lowStock.routes';

const router = Router();

// Подключение маршрутов
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/units', unitRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/documents', documentRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/low-stock', lowStockRoutes);

// Заглушки для будущих маршрутов
router.get('/recipes', (req, res) => {
  res.json({ message: 'Recipes API (в разработке)' });
});

router.get('/sales', (req, res) => {
  res.json({ message: 'Sales API (в разработке)' });
});

router.get('/reports', (req, res) => {
  res.json({ message: 'Reports API (в разработке)' });
});

export default router;
