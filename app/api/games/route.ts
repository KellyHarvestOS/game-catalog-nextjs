// Файл: app/api/games/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/data/prisma';
import { games_db as staticGamesSource } from '@/data/db';
import { Game as SharedGameType, ScreenshotType } from '@/types';
import { Game as PrismaGameModel, Screenshot as PrismaScreenshotModel } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PrismaGameWithScreenshots extends PrismaGameModel {
  screenshots: PrismaScreenshotModel[];
}

const mapStaticGameToSharedType = (sg: any): SharedGameType => {
  if (!sg || typeof sg.id === 'undefined') {
    console.warn("mapStaticGameToSharedType: Получен некорректный объект статической игры:", sg);
    return {
        id: `static-unknown-${Date.now()}`, title: 'Unknown Static Game', description: '',
        genre: undefined, platform: undefined, developer: undefined, publisher: undefined,
        releaseDate: null, price: null, coverImageUrl: null, screenshots: [],
        isStatic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        isOwned: false,
    } as SharedGameType;
  }

  const mappedScreenshots: ScreenshotType[] = Array.isArray(sg.screenshots)
    ? sg.screenshots
        .map((urlOrObj: string | { url: string }, index: number): ScreenshotType | null => {
          const url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj.url;
          if (typeof url === 'string' && url.trim() !== '') {
            return { id: `static-ss-${sg.id}-${index}`, url: url, gameId: `static-${sg.id}` };
          }
          return null;
        })
        .filter((ss: ScreenshotType | null): ss is ScreenshotType => ss !== null)
    : [];

  const result = { // Сохраняем результат в переменную для логирования перед return
    id: `static-${sg.id}`,
    title: sg.title || 'Без названия',
    description: sg.description || '',
    genre: sg.genre || undefined,
    platform: sg.platform || undefined,
    developer: sg.developer || undefined,
    publisher: sg.publisher || undefined,
    releaseDate: sg.releaseDate || null,
    price: sg.price ?? null,
    coverImageUrl: sg.coverImageUrl || sg.imageUrl || null,
    screenshots: mappedScreenshots,
    isStatic: true,
    createdAt: sg.createdAt ? new Date(sg.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: sg.updatedAt ? new Date(sg.updatedAt).toISOString() : new Date().toISOString(),
    isOwned: false,
  };
  // ВСТАВЛЕН CONSOLE.LOG
  console.log(`STATIC GAME MAPPED: ID=${result.id}, Title=${result.title}, CoverURL=${result.coverImageUrl}`);
  return result;
};

const mapPrismaGameToSharedType = (pg: PrismaGameWithScreenshots, isOwnedStatus: boolean = false): SharedGameType => {
  if (!pg) {
    console.warn("mapPrismaGameToSharedType: Получен некорректный объект игры из Prisma:", pg);
     return {
        id: `prisma-unknown-${Date.now()}`, title: 'Unknown Prisma Game', description: '',
        genre: undefined, platform: undefined, developer: undefined, publisher: undefined,
        releaseDate: null, price: null, coverImageUrl: null, screenshots: [],
        isStatic: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        isOwned: false,
    } as SharedGameType;
  }
  // Деструктурируем все поля, включая title и description, чтобы они были в rest
  const { title, description, coverImageUrl, releaseDate, screenshots: prismaScreenshots, createdAt, updatedAt, ...rest } = pg;

  const mappedScreenshots: ScreenshotType[] = prismaScreenshots
    ? prismaScreenshots.map((s: PrismaScreenshotModel) => ({ id: s.id, url: s.url, gameId: s.gameId }))
    : [];

  const result = { // Сохраняем результат в переменную для логирования перед return
    ...rest,
    id: pg.id,
    title: title,
    description: description,
    genre: rest.genre ?? undefined,
    platform: rest.platform ?? undefined,
    developer: rest.developer ?? undefined,
    publisher: rest.publisher ?? undefined,
    price: rest.price ?? null,
    coverImageUrl: coverImageUrl || null,
    releaseDate: releaseDate ? releaseDate.toISOString().split('T')[0] : null,
    screenshots: mappedScreenshots,
    isStatic: false,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    isOwned: isOwnedStatus,
  };
  // ВСТАВЛЕН CONSOLE.LOG
  console.log(`PRISMA GAME MAPPED: ID=${result.id}, Title=${result.title}, CoverURL=${result.coverImageUrl}`);
  return result;
};

// --- ОСТАЛЬНАЯ ЧАСТЬ ВАШЕГО ФАЙЛА (GET и POST обработчики) ОСТАЕТСЯ НИЖЕ БЕЗ ИЗМЕНЕНИЙ ---
// (Я предполагаю, что вы хотите console.log только в функциях маппинга)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const searchParams = request.nextUrl.searchParams;
    const genresQuery = searchParams.get('genres');
    const platformsQuery = searchParams.get('platforms');
    const searchQuery = searchParams.get('search');

    const prismaWhereConditions: any = {};

    if (searchQuery && searchQuery.trim() !== '') {
      prismaWhereConditions.title = { contains: searchQuery.trim() };
    }

    if (genresQuery) {
      const selectedGenres = genresQuery.split(',').map(g => g.trim()).filter(Boolean);
      if (selectedGenres.length > 0) {
        prismaWhereConditions.OR = selectedGenres.map(genre => ({ genre: { contains: genre } }));
      }
    }

    if (platformsQuery) {
      const selectedPlatforms = platformsQuery.split(',').map(p => p.trim()).filter(Boolean);
      if (selectedPlatforms.length > 0) {
        if (prismaWhereConditions.OR) {
            prismaWhereConditions.AND = [ { OR: prismaWhereConditions.OR }, { OR: selectedPlatforms.map(platform => ({ platform: { contains: platform } })) }];
            delete prismaWhereConditions.OR;
        } else {
            prismaWhereConditions.OR = selectedPlatforms.map(platform => ({ platform: { contains: platform } }));
        }
      }
    }

    const prismaGamesRaw = await prisma.game.findMany({
      where: Object.keys(prismaWhereConditions).length > 0 ? prismaWhereConditions : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        screenshots: true,
        purchasedByUsers: userId ? { where: { userId } } : undefined,
      }
    });

    const prismaGames = prismaGamesRaw.map(pg => {
      const typedPg = pg as PrismaGameWithScreenshots & { purchasedByUsers?: { userId: string }[] };
      const isOwned = !!(typedPg.purchasedByUsers && typedPg.purchasedByUsers.length > 0);
      return mapPrismaGameToSharedType(typedPg, isOwned);
    });

    let filteredStaticGames = staticGamesSource.map(mapStaticGameToSharedType);
    if (searchQuery && searchQuery.trim() !== '') { const searchTermLower = searchQuery.toLowerCase().trim(); filteredStaticGames = filteredStaticGames.filter(sg => (sg.title || '').toLowerCase().includes(searchTermLower)); }
    if (genresQuery) { const selectedGenresLower = genresQuery.split(',').map(g => g.toLowerCase().trim()).filter(Boolean); if (selectedGenresLower.length > 0) { filteredStaticGames = filteredStaticGames.filter(sg => { if (!sg.genre) return false; const gameGenreParts = sg.genre.toLowerCase().split(',').map(part => part.trim()); return selectedGenresLower.some(selGenre => gameGenreParts.includes(selGenre)); }); } }
    if (platformsQuery) { const selectedPlatformsLower = platformsQuery.split(',').map(p => p.toLowerCase().trim()).filter(Boolean); if (selectedPlatformsLower.length > 0) { filteredStaticGames = filteredStaticGames.filter(sg => { if (!sg.platform) return false; const gamePlatformParts = sg.platform.toLowerCase().split(',').map(part => part.trim()); return selectedPlatformsLower.some(selPlatform => gamePlatformParts.includes(selPlatform)); }); } }

    const combinedGames = [...filteredStaticGames, ...prismaGames];
    const uniqueGames = Array.from(new Map(combinedGames.map(game => [game.id, game])).values())
                            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json(uniqueGames);

  } catch (error) {
    console.error("[API /api/games GET] ОШИБКА:", error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при получении списка игр', errorDetails: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    console.log("ПОЛУЧЕНО ТЕЛО ЗАПРОСА (body) ДЛЯ СОЗДАНИЯ:", body);

    const {
      title,
      description,
      genre,
      platform,
      developer,
      publisher,
      releaseDate,
      price: priceFromClient,
      coverImageUrl,
      screenshots
    } = body;

    if (!title || !description || !coverImageUrl) {
      console.log("ПРОВАЛ ВАЛИДАЦИИ (основные поля):", { title, description, coverImageUrl });
      return NextResponse.json({ message: 'Отсутствуют обязательные поля: Название, Описание, URL обложки' }, { status: 400 });
    }

    let numericPrice: number | null = null;
    if (priceFromClient !== undefined && priceFromClient !== null && String(priceFromClient).trim() !== '') {
      const parsedPrice = parseFloat(String(priceFromClient));
      if (isNaN(parsedPrice)) {
        console.log("ПРОВАЛ ВАЛИДАЦИИ (цена не число):", { priceFromClient });
        return NextResponse.json({ message: 'Поле "Цена" должно быть числом.' }, { status: 400 });
      }
      numericPrice = parsedPrice;
    } else {
      console.log("ПРОВАЛ ВАЛИДАЦИИ (цена отсутствует/некорректна):", { priceFromClient });
      return NextResponse.json({ message: 'Поле "Цена" является обязательным и должно быть числом.' }, { status: 400 });
    }

    const newGameData: any = {
        title,
        description,
        genre: genre || null,
        platform: platform || null,
        developer: developer || null,
        publisher: publisher || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        price: numericPrice,
        coverImageUrl: coverImageUrl,
    };

    if (Array.isArray(screenshots) && screenshots.length > 0) {
        newGameData.screenshots = {
            create: screenshots.map((url: string) => ({ url })),
        };
    }

    const newGamePrisma = await prisma.game.create({
      data: newGameData,
      include: {
        screenshots: true,
      },
    });

    const gameToReturn = mapPrismaGameToSharedType(newGamePrisma as PrismaGameWithScreenshots, false);
    return NextResponse.json(gameToReturn, { status: 201 });

  } catch (error) {
    console.error("[API /api/games POST] ОШИБКА СОЗДАНИЯ ИГРЫ:", error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) {
        return NextResponse.json({ message: 'Игра с таким названием уже существует.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ошибка сервера при создании игры' }, { status: 500 });
  }
}