// types/index.ts
export interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  releaseDate: string | null; // Позволяем null
  developer: string;
  description: string;
  imageUrl: string | null;    // Позволяем null
  price: number | null;         // Позволяем null
  publisher: string | null;   // Позволяем null
  // Если Prisma модель имеет эти поля:
  createdAt?: string | Date; // Обычно Prisma сама управляет ими
  updatedAt?: string | Date; // Обычно Prisma сама управляет ими
  screenshots?: { id: string; url: string; gameId: string }[]; // Если есть
  purchasedByUsers?: any[]; // Замените any, если нужно
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];