import { Router } from 'express';
import { recipeController } from '../controllers/recipe.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  recipeCreateSchema, 
  recipeUpdateSchema, 
  recipeFiltersSchema,
  recipeScaleSchema,
  recipeAvailabilitySchema,
  recipeIngredientSchema
} from '../validation/recipe.validation';

const router = Router();

// Применяем аутентификацию ко всем роутам
router.use(authenticateToken);

// Получение списка рецептов (доступно всем аутентифицированным пользователям)
router.get('/', validate({ query: recipeFiltersSchema }), recipeController.getRecipes);

// Получение рецепта по ID
router.get('/:id', recipeController.getRecipeById);

// Анализ рентабельности рецептов
router.get('/analytics/profitability', recipeController.getRecipeProfitability);

// Генерация технологической карты
router.get('/:id/tech-card', recipeController.generateTechCard);

// Проверка наличия ингредиентов на складе
router.get('/:id/availability', validate({ query: recipeAvailabilitySchema }), recipeController.checkIngredientAvailability);

// Масштабирование рецепта
router.post('/:id/scale', validate({ body: recipeScaleSchema }), recipeController.scaleRecipe);

// Расчет стоимости рецепта (для калькулятора)
router.post('/calculate-cost', recipeController.calculateRecipeCost);

// Создание рецепта (доступно менеджерам и администраторам)
router.post('/', 
  requireRoles('ADMIN', 'MANAGER'), 
  validate({ body: recipeCreateSchema }), 
  recipeController.createRecipe
);

// Обновление рецепта (доступно менеджерам и администраторам)
router.put('/:id', 
  requireRoles('ADMIN', 'MANAGER'), 
  validate({ body: recipeUpdateSchema }), 
  recipeController.updateRecipe
);

// Удаление рецепта (доступно только администраторам)
router.delete('/:id', 
  requireRoles('ADMIN'), 
  recipeController.deleteRecipe
);

export default router;
