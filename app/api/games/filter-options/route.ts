// app/api/games/filter-options/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { games_db as staticGamesSource } from '@/data/db';

const extractAndCleanValues = (value: string | null | undefined): string[] => {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean).sort();
};

const getUniqueSortedValues = (array: (string | null | undefined)[]): string[] => {
  const validValues = array.filter(value => typeof value === 'string' && value.trim() !== '') as string[];
  return Array.from(new Set(validValues.map(value => value.trim()))).sort((a, b) => a.localeCompare(b));
};

export async function GET(request: Request) {
  try {
    const prismaGames = await prisma.game.findMany({
      select: { 
        genre: true,
        platform: true,
        developer: true,
      },
    });

    const staticGamesProcessed = staticGamesSource.map(sg => ({
      genre: sg.genre,
      platform: sg.platform,
      developer: sg.developer,
    }));

    const allGameDataForFilters = [...prismaGames, ...staticGamesProcessed];
    
    const allGenres = allGameDataForFilters.map(game => game.genre);
    const uniqueGenres = getUniqueSortedValues(allGenres);
    // Если жанры хранятся как строки, разделенные запятыми:
    // const allGenreArrays = allGameDataForFilters.flatMap(game => extractAndCleanValues(game.genre));
    // const uniqueGenres = Array.from(new Set(allGenreArrays)).sort((a,b) => a.localeCompare(b));

    const allPlatforms = allGameDataForFilters.map(game => game.platform);
    const uniquePlatforms = getUniqueSortedValues(allPlatforms);
    // Если платформы хранятся как строки, разделенные запятыми:
    // const allPlatformArrays = allGameDataForFilters.flatMap(game => extractAndCleanValues(game.platform));
    // const uniquePlatforms = Array.from(new Set(allPlatformArrays)).sort((a,b) => a.localeCompare(b));

    const allDevelopers = allGameDataForFilters.map(game => game.developer);
    const uniqueDevelopers = getUniqueSortedValues(allDevelopers);
    
    const filterOptions = {
      genres: uniqueGenres,
      platforms: uniquePlatforms,
      developers: uniqueDevelopers,
    };

    return NextResponse.json(filterOptions);

  } catch (error) {
    console.error("Ошибка при получении опций для фильтров:", error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при получении опций для фильтров', error: errorMessage }, { status: 500 });
  }
}