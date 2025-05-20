export interface Game {
  id: string; // Будет 'static-...' для статических или Prisma ID
  title: string;
  genre?: string; // string | undefined
  platform?: string; // string | undefined
  releaseDate?: string | null; // Prisma может хранить Date, API будет возвращать строку или null
  developer?: string; // string | undefined
  description: string;
  imageUrl?: string | null; // Используется для отображения, соответствует coverImageUrl из Prisma
  price?: number | null;    // Prisma может хранить Float, API будет возвращать number или null
  publisher?: string; // string | undefined
  isStatic?: boolean; // Флаг для различения источника
  // Поля, специфичные для Prisma (могут быть Date или string в зависимости от маппинга)
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // После маппинга в API, это всегда будет string[]
  screenshots?: string[];
  // Поле из Prisma модели, которое маппится в imageUrl
  coverImageUrl?: string | null; // Только для внутреннего использования Prisma-объектом до маппинга
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];