import { PrismaClient, UserRole, WarehouseType, UnitType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создание единиц измерения
  console.log('📏 Создание единиц измерения...');
  const units = await Promise.all([
    prisma.unit.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Штука',
        shortName: 'шт',
        type: UnitType.PIECE,
      },
    }),
    prisma.unit.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Килограмм',
        shortName: 'кг',
        type: UnitType.WEIGHT,
      },
    }),
    prisma.unit.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Грамм',
        shortName: 'г',
        type: UnitType.WEIGHT,
        baseUnitId: 2,
        conversionFactor: 0.001,
      },
    }),
    prisma.unit.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Литр',
        shortName: 'л',
        type: UnitType.VOLUME,
      },
    }),
    prisma.unit.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Миллилитр',
        shortName: 'мл',
        type: UnitType.VOLUME,
        baseUnitId: 4,
        conversionFactor: 0.001,
      },
    }),
  ]);

  // Создание администратора
  console.log('👤 Создание пользователей...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dfupr.com' },
    update: {},
    create: {
      email: 'admin@dfupr.com',
      passwordHash: hashedPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@dfupr.com' },
    update: {},
    create: {
      email: 'manager@dfupr.com',
      passwordHash: await bcrypt.hash('manager123', 12),
      firstName: 'Менеджер',
      lastName: 'Столовой',
      role: UserRole.MANAGER,
    },
  });

  // Создание складов
  console.log('🏪 Создание складов...');
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Основной склад',
        type: WarehouseType.MAIN,
        address: 'ул. Складская, 1',
        managerId: admin.id,
      },
    }),
    prisma.warehouse.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Кухня №1',
        type: WarehouseType.KITCHEN,
        address: 'ул. Кухонная, 5',
        managerId: manager.id,
      },
    }),
    prisma.warehouse.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Столовая №1',
        type: WarehouseType.RETAIL,
        address: 'ул. Обеденная, 10',
        managerId: manager.id,
      },
    }),
  ]);

  // Создание поставщиков
  console.log('🚚 Создание поставщиков...');
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'ООО "Продукты и К"',
        legalName: 'Общество с ограниченной ответственностью "Продукты и Компания"',
        inn: '1234567890',
        kpp: '123456789',
        address: 'г. Москва, ул. Поставщиков, 15',
        phone: '+7 (495) 123-45-67',
        email: 'orders@produkty.ru',
        contactPerson: 'Иванов Иван Иванович',
        paymentTerms: 7,
      },
    }),
    prisma.supplier.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'ИП Петров',
        legalName: 'Индивидуальный предприниматель Петров Петр Петрович',
        inn: '0987654321',
        address: 'г. Москва, ул. Фермерская, 25',
        phone: '+7 (495) 987-65-43',
        email: 'petrov@farm.ru',
        contactPerson: 'Петров Петр Петрович',
        paymentTerms: 3,
      },
    }),
  ]);

  // Создание категорий товаров
  console.log('📂 Создание категорий товаров...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Мясо и птица',
        description: 'Мясные продукты и птица',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Молочные продукты',
        description: 'Молоко, сыры, творог и другие молочные продукты',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Овощи и фрукты',
        description: 'Свежие овощи и фрукты',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Крупы и макароны',
        description: 'Крупы, макаронные изделия, мука',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Специи и приправы',
        description: 'Специи, соль, перец, приправы',
        sortOrder: 5,
      },
    }),
  ]);

  // Создание товаров
  console.log('📦 Создание товаров...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Курица целая',
        article: 'CHICK001',
        categoryId: categories[0].id,
        unitId: units[1].id, // кг
        shelfLifeDays: 5,
        storageTemperatureMin: 0,
        storageTemperatureMax: 4,
        storageConditions: 'Холодильник',
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Молоко 3.2%',
        article: 'MILK001',
        categoryId: categories[1].id,
        unitId: units[3].id, // л
        shelfLifeDays: 7,
        storageTemperatureMin: 2,
        storageTemperatureMax: 6,
        storageConditions: 'Холодильник',
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Картофель',
        article: 'POT001',
        categoryId: categories[2].id,
        unitId: units[1].id, // кг
        shelfLifeDays: 30,
        storageTemperatureMin: 2,
        storageTemperatureMax: 8,
        storageConditions: 'Прохладное темное место',
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Рис длиннозерный',
        article: 'RICE001',
        categoryId: categories[3].id,
        unitId: units[1].id, // кг
        shelfLifeDays: 365,
        storageConditions: 'Сухое место',
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Соль поваренная',
        article: 'SALT001',
        categoryId: categories[4].id,
        unitId: units[1].id, // кг
        shelfLifeDays: 1095, // 3 года
        storageConditions: 'Сухое место',
      },
    }),
  ]);

  // Создание категорий меню
  console.log('🍽 Создание категорий меню...');
  const menuCategories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Первые блюда',
        description: 'Супы, борщи, солянки',
        sortOrder: 1,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Вторые блюда',
        description: 'Основные блюда с гарниром',
        sortOrder: 2,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Салаты',
        description: 'Холодные и теплые салаты',
        sortOrder: 3,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Напитки',
        description: 'Горячие и холодные напитки',
        sortOrder: 4,
      },
    }),
  ]);

  console.log('✅ База данных успешно заполнена!');
  console.log(`👤 Создано пользователей: ${2}`);
  console.log(`🏪 Создано складов: ${warehouses.length}`);
  console.log(`🚚 Создано поставщиков: ${suppliers.length}`);
  console.log(`📂 Создано категорий: ${categories.length}`);
  console.log(`📦 Создано товаров: ${products.length}`);
  console.log(`🍽 Создано категорий меню: ${menuCategories.length}`);
  console.log(`📏 Создано единиц измерения: ${units.length}`);
  
  console.log('\n🔑 Данные для входа:');
  console.log('Администратор: admin@dfupr.com / admin123');
  console.log('Менеджер: manager@dfupr.com / manager123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
