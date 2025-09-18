import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Подключение маршрутов
router.use('/auth', authRoutes);

// Заглушки для будущих маршрутов
router.get('/products', (req, res) => {
  res.json({ message: 'Products API (в разработке)' });
});

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
