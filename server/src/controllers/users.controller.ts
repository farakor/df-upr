import { Request, Response, NextFunction } from 'express';
import usersService from '../services/users.service';

export class UsersController {
  // Получить всех пользователей
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // Получить пользователя по ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await usersService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Пользователь не найден',
        });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Создать пользователя
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Обновить пользователя
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await usersService.updateUser(id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Изменить пароль
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;

      await usersService.changePassword(id, password);
      res.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (error) {
      next(error);
    }
  }

  // Деактивировать пользователя
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await usersService.deactivateUser(id);
      res.json({ success: true, message: 'Пользователь деактивирован' });
    } catch (error) {
      next(error);
    }
  }

  // Активировать пользователя
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await usersService.activateUser(id);
      res.json({ success: true, message: 'Пользователь активирован' });
    } catch (error) {
      next(error);
    }
  }

  // Удалить пользователя
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await usersService.deleteUser(id);
      res.json({ success: true, message: 'Пользователь удален' });
    } catch (error) {
      next(error);
    }
  }

  // Получить статистику по пользователям
  async getUsersStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await usersService.getUsersStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();

