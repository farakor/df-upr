import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import unitRoutes from './unit.routes';

const router = Router();

// Подключение маршрутов
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/units', unitRoutes);

// Заглушки для будущих маршрутов
router.get('/recipes', (req, res) => {
  res.json({ message: 'Recipes API (в разработке)' });
});

router.get('/warehouse', (req, res) => {
  res.json({ message: 'Warehouse API (в разработке)' });
});

router.get('/sales', (req, res) => {
  res.json({ message: 'Sales API (в разработке)' });
});

router.get('/reports', (req, res) => {
  res.json({ message: 'Reports API (в разработке)' });
});

export default router;
