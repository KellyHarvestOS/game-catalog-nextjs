// data/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // Опционально для отладки
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;