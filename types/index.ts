// @/types/index.ts

export interface ScreenshotType {
  id: string;
  url: string;
  gameId: string;
}

export interface Game {
  id: string;
  title: string;
  genre?: string;
  platform?: string;
  releaseDate?: string | null | Date;
  developer?: string;
  description: string;
  coverImageUrl?: string | null; // Основное поле для URL обложки, если оно из Prisma
  imageUrl?: string | null;      // Альтернативное, если вы делаете маппинг в API
  price?: number | null;
  publisher?: string;
  isStatic?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  screenshots?: ScreenshotType[];
  isOwned?: boolean;
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];