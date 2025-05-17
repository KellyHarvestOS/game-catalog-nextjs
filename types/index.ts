// types/index.ts

export interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  releaseDate: string;
  developer: string;
  description: string;
  imageUrl?: string;
  price: number;
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];