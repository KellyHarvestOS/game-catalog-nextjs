// Файл: app/api/games/[id]/route.ts
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

  const result: SharedGameType = {
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
  // console.log(`STATIC GAME MAPPED (in [id]/route): ID=${result.id}, Title=${result.title}, CoverURL=${result.coverImageUrl}`);
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

  const mappedScreenshots: ScreenshotType[] = pg.screenshots
    ? pg.screenshots.map((s: PrismaScreenshotModel) => ({ id: s.id, url: s.url, gameId: s.gameId }))
    : [];

  const result: SharedGameType = {
    id: pg.id,
    title: pg.title,
    description: pg.description,
    genre: pg.genre === null ? undefined : pg.genre,
    platform: pg.platform === null ? undefined : pg.platform,
    developer: pg.developer === null ? undefined : pg.developer,
    publisher: pg.publisher === null ? undefined : pg.publisher,
    price: pg.price === null ? null : pg.price,
    coverImageUrl: pg.coverImageUrl === null ? null : pg.coverImageUrl,
    releaseDate: pg.releaseDate ? new Date(pg.releaseDate).toISOString().split('T')[0] : null,
    screenshots: mappedScreenshots,
    isStatic: false,
    createdAt: new Date(pg.createdAt).toISOString(),
    updatedAt: new Date(pg.updatedAt).toISOString(),
    isOwned: isOwnedStatus,
  };
  // console.log(`PRISMA GAME MAPPED (in [id]/route): ID=${result.id}, Title=${result.title}, Genre=${result.genre}, CoverURL=${result.coverImageUrl}`);
  return result;
};


export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await null; // <--- ПРОБНЫЙ AWAIT

    const requestedId = context.params.id;
    // console.log(`GET /api/games/[id] - ID from context: ${requestedId}`);

    if (!requestedId) {
        console.error("GET /api/games/[id] - Error: ID игры не предоставлен в параметрах.");
        return NextResponse.json({ message: 'ID игры не предоставлен' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    let isOwned = false;

    if (requestedId.startsWith('static-')) {
      const staticGameId = requestedId.substring('static-'.length);
      const staticGameData = staticGamesSource.find(g => String(g.id) === staticGameId);

      if (!staticGameData) {
        return NextResponse.json({ message: 'Статическая игра не найдена' }, { status: 404 });
      }
      const gameToReturn = mapStaticGameToSharedType(staticGameData);
      return NextResponse.json(gameToReturn);

    } else {
      const prismaGame = await prisma.game.findUnique({
        where: { id: requestedId },
        include: { screenshots: true }
      });

      if (!prismaGame) {
        return NextResponse.json({ message: 'Игра не найдена в базе данных' }, { status: 404 });
      }

      if (userId) {
        const purchase = await prisma.purchasedGame.findUnique({
          where: { userId_gameId: { userId: userId, gameId: requestedId } },
        });
        isOwned = !!purchase;
      }
      const gameToReturn = mapPrismaGameToSharedType(prismaGame, isOwned);
      return NextResponse.json(gameToReturn);
    }
  } catch (error) {
    console.error("Ошибка при получении игры по ID (/api/games/[id] GET):", error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при получении игры', errorDetails: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const requestedId = context.params.id;
  // console.log(`DELETE /api/games/[id] - ID from context: ${requestedId}`);

  if (requestedId.startsWith('static-')) {
    return NextResponse.json({ message: 'Статические игры не могут быть удалены через это API' }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }
  try {
    await prisma.purchasedGame.deleteMany({ where: { gameId: requestedId } });
    await prisma.screenshot.deleteMany({ where: { gameId: requestedId } });

    await prisma.game.delete({
      where: { id: requestedId },
    });
    return NextResponse.json({ message: 'Игра успешно удалена' }, { status: 200 });
  } catch (error) {
    console.error("Ошибка при удалении игры (/api/games/[id] DELETE):", error);
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Игра для удаления не найдена' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Ошибка сервера при удалении игры' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const requestedId = context.params.id;
  // console.log(`PUT /api/games/[id] - ID from context: ${requestedId}`);

  if (requestedId.startsWith('static-')) {
    return NextResponse.json({ message: 'Статические игры не могут быть обновлены через это API' }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { title, description, genre, platform, price, developer, publisher, releaseDate, coverImageUrl, screenshots: screenshotUrls } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (genre !== undefined) dataToUpdate.genre = genre === '' ? null : genre;
    if (platform !== undefined) dataToUpdate.platform = platform === '' ? null : platform;
    if (price !== undefined) dataToUpdate.price = typeof price === 'number' ? price : (price === null || String(price).trim() === '' ? null : parseFloat(String(price)));
    if (developer !== undefined) dataToUpdate.developer = developer === '' ? null : developer;
    if (publisher !== undefined) dataToUpdate.publisher = publisher === '' ? null : publisher;
    if (releaseDate !== undefined) dataToUpdate.releaseDate = releaseDate === '' || releaseDate === null ? null : new Date(releaseDate);
    if (coverImageUrl !== undefined) dataToUpdate.coverImageUrl = coverImageUrl === '' ? null : coverImageUrl;

    const updatedPrismaGameResult = await prisma.$transaction(async (tx) => {
        const game = await tx.game.update({
            where: { id: requestedId },
            data: dataToUpdate,
        });

        if (Array.isArray(screenshotUrls)) {
            await tx.screenshot.deleteMany({ where: { gameId: requestedId } });
            if (screenshotUrls.length > 0) {
                await tx.screenshot.createMany({
                    data: screenshotUrls.map((url: string) => ({ url, gameId: requestedId })),
                });
            }
        }
        return tx.game.findUnique({
            where: { id: requestedId },
            include: { screenshots: true },
        });
    });

    if (!updatedPrismaGameResult) {
        return NextResponse.json({ message: 'Игра для обновления не найдена или произошла ошибка транзакции' }, { status: 404 });
    }
    const gameToReturn = mapPrismaGameToSharedType(updatedPrismaGameResult, false);
    return NextResponse.json(gameToReturn, { status: 200 });

  } catch (error) {
    console.error("Ошибка при обновлении игры (/api/games/[id] PUT):", error);
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Игра для обновления не найдена' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при обновлении игры', errorDetails: errorMessage }, { status: 500 });
  }
}