// app/api/games/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/data/prisma';
import { games_db as staticGamesSource } from '@/data/db';
import { Game as SharedGameType } from '@/types';
import { Game as PrismaGameModel, Screenshot as PrismaScreenshotModel } from '@prisma/client';

interface PrismaGameWithScreenshots extends PrismaGameModel {
  screenshots: PrismaScreenshotModel[];
}

const mapStaticGameToSharedType = (sg: any): SharedGameType => {
  if (!sg || typeof sg.id === 'undefined') {
    return {
        id: `static-unknown-${Date.now()}`, title: 'Unknown Static Game', description: '',
        genre: undefined, platform: undefined, developer: undefined, publisher: undefined,
        releaseDate: null, price: null, imageUrl: null, screenshots: [],
        isStatic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    } as SharedGameType;
  }
  return {
    id: `static-${sg.id}`,
    title: sg.title || 'Без названия',
    description: sg.description || '',
    genre: sg.genre || undefined,
    platform: sg.platform || undefined,
    developer: sg.developer || undefined,
    publisher: sg.publisher || undefined,
    releaseDate: sg.releaseDate || null,
    price: sg.price ?? null,
    imageUrl: sg.imageUrl || null,
    screenshots: Array.isArray(sg.screenshots) ? sg.screenshots.filter(Boolean) as string[] : [],
    isStatic: true,
    createdAt: sg.createdAt || new Date().toISOString(),
    updatedAt: sg.updatedAt || new Date().toISOString(),
  } as SharedGameType;
};

const mapPrismaGameToSharedType = (pg: PrismaGameWithScreenshots): SharedGameType => {
  if (!pg) {
     return {
        id: `prisma-unknown-${Date.now()}`, title: 'Unknown Prisma Game', description: '',
        genre: undefined, platform: undefined, developer: undefined, publisher: undefined,
        releaseDate: null, price: null, imageUrl: null, screenshots: [],
        isStatic: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    } as SharedGameType;
  }
  const { coverImageUrl, releaseDate, screenshots: prismaScreenshots, createdAt, updatedAt, ...rest } = pg;
  return {
    ...rest,
    id: pg.id,
    title: rest.title || 'Без названия',
    description: rest.description || '',
    genre: rest.genre || undefined,
    platform: rest.platform || undefined,
    developer: rest.developer || undefined,
    publisher: rest.publisher || undefined,
    price: rest.price ?? null,
    imageUrl: coverImageUrl || null,
    releaseDate: releaseDate ? releaseDate.toISOString().split('T')[0] : null,
    screenshots: prismaScreenshots?.map((s: PrismaScreenshotModel) => s.url).filter(Boolean) || [],
    isStatic: false,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  } as SharedGameType;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genresQuery = searchParams.get('genres');
    const platformsQuery = searchParams.get('platforms');
    const searchQuery = searchParams.get('search');

    const prismaWhereConditions: any[] = [];

    if (searchQuery && searchQuery.trim() !== '') {
      prismaWhereConditions.push({
        title: {
          contains: searchQuery.trim(),
          // mode: 'insensitive', // Убрано для SQL Server
        }
      });
    }

    if (genresQuery) {
      const selectedGenres = genresQuery.split(',').map(g => g.trim()).filter(Boolean);
      if (selectedGenres.length > 0) {
        prismaWhereConditions.push({
          OR: selectedGenres.map(genre => ({
            genre: { contains: genre /*, mode: 'insensitive' */ } // Убрано mode
          }))
        });
      }
    }

    if (platformsQuery) {
      const selectedPlatforms = platformsQuery.split(',').map(p => p.trim()).filter(Boolean);
      if (selectedPlatforms.length > 0) {
        prismaWhereConditions.push({
          OR: selectedPlatforms.map(platform => ({
            platform: { contains: platform /*, mode: 'insensitive' */ } // Убрано mode
          }))
        });
      }
    }
    
    const finalPrismaWhere = prismaWhereConditions.length > 0 ? { AND: prismaWhereConditions } : {};
    
    const prismaGamesRaw = await prisma.game.findMany({
      where: finalPrismaWhere,
      orderBy: { createdAt: 'desc' },
      include: { screenshots: true }
    });
    const prismaGames = prismaGamesRaw.map(mapPrismaGameToSharedType);

    let filteredStaticGames = staticGamesSource.map(mapStaticGameToSharedType);

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTermLower = searchQuery.toLowerCase().trim();
      filteredStaticGames = filteredStaticGames.filter(sg =>
        sg.title.toLowerCase().includes(searchTermLower)
      );
    }
    if (genresQuery) {
      const selectedGenresLower = genresQuery.split(',').map(g => g.toLowerCase().trim()).filter(Boolean);
      if (selectedGenresLower.length > 0) {
        filteredStaticGames = filteredStaticGames.filter(sg => {
          if (!sg.genre) return false;
          const gameGenreParts = sg.genre.toLowerCase().split(',').map(part => part.trim());
          return selectedGenresLower.some(selGenre => gameGenreParts.includes(selGenre));
        });
      }
    }
    if (platformsQuery) {
      const selectedPlatformsLower = platformsQuery.split(',').map(p => p.toLowerCase().trim()).filter(Boolean);
      if (selectedPlatformsLower.length > 0) {
        filteredStaticGames = filteredStaticGames.filter(sg => {
          if (!sg.platform) return false;
          const gamePlatformParts = sg.platform.toLowerCase().split(',').map(part => part.trim());
          return selectedPlatformsLower.some(selPlatform => gamePlatformParts.includes(selPlatform));
        });
      }
    }
    
    const combinedGames = [...filteredStaticGames, ...prismaGames];
    const uniqueGames = Array.from(new Map(combinedGames.map(game => [game.id, game])).values());
    
    return NextResponse.json(uniqueGames);

  } catch (error) {
    console.error("[API /api/games GET] ОШИБКА:", error); 
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    const errorStack = process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ message: 'Ошибка сервера при получении списка игр', errorDetails: errorMessage, errorStack: errorStack }, { status: 500 });
  }
}

// Оставьте здесь ваши существующие POST, PUT, DELETE обработчики для /api/games, если они есть
// export async function POST(request: Request) { /* ... */ }