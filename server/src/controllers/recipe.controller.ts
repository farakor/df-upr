import { Request, Response } from 'express';
import { recipeService, RecipeCreateInput, RecipeUpdateInput, RecipeFilters, PaginationOptions } from '../services/recipe.service';
import { logger } from '../utils/logger';

export class RecipeController {
  async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      const recipeData: RecipeCreateInput = req.body;
      const createdById = (req as any).user?.id;
      
      const recipe = await recipeService.createRecipe(recipeData, createdById);
      
      logger.info('Recipe created', { recipeId: recipe.id, name: recipe.name });
      res.status(201).json({
        success: true,
        data: recipe,
        message: 'Рецепт успешно создан',
      });
    } catch (error) {
      logger.error('Error creating recipe', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания рецепта',
      });
    }
  }

  async getRecipes(req: Request, res: Response): Promise<void> {
    try {
      const filters: RecipeFilters = {
        search: req.query.search as string,
        isActive: req.query.isActive !== 'false',
        difficultyLevel: req.query.difficultyLevel ? parseInt(req.query.difficultyLevel as string) : undefined,
        cookingTimeMax: req.query.cookingTimeMax ? parseInt(req.query.cookingTimeMax as string) : undefined,
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'name',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await recipeService.getRecipes(filters, pagination);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching recipes', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка рецептов',
      });
    }
  }

  async getRecipeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const recipe = await recipeService.getRecipeById(id);
      
      if (!recipe) {
        res.status(404).json({
          success: false,
          message: 'Рецепт не найден',
        });
        return;
      }

      res.json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      logger.error('Error fetching recipe', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения рецепта',
      });
    }
  }

  async updateRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: RecipeUpdateInput = req.body;
      
      const recipe = await recipeService.updateRecipe(id, updateData);
      
      logger.info('Recipe updated', { recipeId: recipe.id, name: recipe.name });
      res.json({
        success: true,
        data: recipe,
        message: 'Рецепт успешно обновлен',
      });
    } catch (error) {
      logger.error('Error updating recipe', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления рецепта',
      });
    }
  }

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await recipeService.deleteRecipe(id);
      
      logger.info('Recipe deleted', { recipeId: id });
      res.json({
        success: true,
        message: 'Рецепт успешно удален',
      });
    } catch (error) {
      logger.error('Error deleting recipe', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления рецепта',
      });
    }
  }

  async calculateRecipeCost(req: Request, res: Response): Promise<void> {
    try {
      const { ingredients } = req.body;
      
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Необходимо передать массив ингредиентов',
        });
        return;
      }

      const costCalculation = await recipeService.calculateRecipeCost(ingredients);
      
      res.json({
        success: true,
        data: costCalculation,
      });
    } catch (error) {
      logger.error('Error calculating recipe cost', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка расчета стоимости рецепта',
      });
    }
  }

  async scaleRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { scaleFactor } = req.body;
      
      if (!scaleFactor || scaleFactor <= 0) {
        res.status(400).json({
          success: false,
          message: 'Коэффициент масштабирования должен быть положительным числом',
        });
        return;
      }

      const scaledRecipe = await recipeService.scaleRecipe(id, scaleFactor);
      
      res.json({
        success: true,
        data: {
          scaleFactor,
          ...scaledRecipe,
        },
        message: `Рецепт масштабирован с коэффициентом ${scaleFactor}`,
      });
    } catch (error) {
      logger.error('Error scaling recipe', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка масштабирования рецепта',
      });
    }
  }

  async checkIngredientAvailability(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const warehouseId = parseInt(req.query.warehouseId as string);
      const portions = req.query.portions ? parseInt(req.query.portions as string) : 1;
      
      if (!warehouseId) {
        res.status(400).json({
          success: false,
          message: 'ID склада обязателен для проверки наличия ингредиентов',
        });
        return;
      }

      const availability = await recipeService.checkIngredientAvailability(id, warehouseId, portions);
      
      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      logger.error('Error checking ingredient availability', { error: error instanceof Error ? error.message : error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка проверки наличия ингредиентов',
      });
    }
  }

  async getRecipeProfitability(req: Request, res: Response): Promise<void> {
    try {
      const profitability = await recipeService.getRecipeProfitability();
      
      res.json({
        success: true,
        data: profitability,
      });
    } catch (error) {
      logger.error('Error getting recipe profitability', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения анализа рентабельности рецептов',
      });
    }
  }

  async generateTechCard(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const recipe = await recipeService.getRecipeById(id);
      
      if (!recipe) {
        res.status(404).json({
          success: false,
          message: 'Рецепт не найден',
        });
        return;
      }

      // Формируем данные для технологической карты
      const techCard = {
        recipe: {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          portionSize: recipe.portionSize,
          cookingTime: recipe.cookingTime,
          difficultyLevel: recipe.difficultyLevel,
          instructions: recipe.instructions,
          costPrice: recipe.costPrice,
          sellingPrice: recipe.sellingPrice,
        },
        ingredients: recipe.ingredients?.map(ingredient => ({
          name: ingredient.product.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit.name,
          costPerUnit: ingredient.costPerUnit,
          totalCost: ingredient.costPerUnit 
            ? parseFloat(ingredient.quantity.toString()) * parseFloat(ingredient.costPerUnit.toString())
            : 0,
          isMain: ingredient.isMain,
        })) || [],
        totalCost: recipe.costPrice,
        createdBy: recipe.createdBy ? `${recipe.createdBy.firstName} ${recipe.createdBy.lastName}` : 'Не указан',
        createdAt: recipe.createdAt,
      };

      res.json({
        success: true,
        data: techCard,
        message: 'Технологическая карта сформирована',
      });
    } catch (error) {
      logger.error('Error generating tech card', { error: error instanceof Error ? error.message : error });
      res.status(500).json({
        success: false,
        message: 'Ошибка формирования технологической карты',
      });
    }
  }
}

export const recipeController = new RecipeController();
