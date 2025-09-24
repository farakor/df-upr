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
import recipeRoutes from './recipe.routes';
import menuRoutes from './menu.routes';
import inventoryRoutes from './inventory.routes';
import salesRoutes from './sales.routes';
import reportsRoutes from './reports.routes';

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
router.use('/recipes', recipeRoutes);
router.use('/menu', menuRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/reports', reportsRoutes);

export default router;
