import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordUtils } from '../utils/password';

const prisma = new PrismaClient();

export class UsersService {
  // Получить всех пользователей
  async getAllUsers() {
    return await prisma.user.findMany({
      where: { isActive: true }, // Показываем только активных пользователей
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Получить пользователя по ID
  async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Создать пользователя
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    phone?: string;
  }) {
    const passwordHash = await PasswordUtils.hashPassword(data.password);

    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.OPERATOR,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  // Обновить пользователя
  async updateUser(
    id: number,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      phone?: string;
      isActive?: boolean;
    }
  ) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  // Изменить пароль пользователя
  async changePassword(id: number, newPassword: string) {
    const passwordHash = await PasswordUtils.hashPassword(newPassword);
    
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true },
    });
  }

  // Деактивировать пользователя
  async deactivateUser(id: number) {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  // Активировать пользователя
  async activateUser(id: number) {
    return await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: { id: true, isActive: true },
    });
  }

  // Удалить пользователя (мягкое удаление - деактивация)
  async deleteUser(id: number) {
    return await this.deactivateUser(id);
  }

  // Получить статистику по пользователям
  async getUsersStats() {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { isActive: true } });
    const byRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default new UsersService();

