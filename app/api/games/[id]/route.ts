// app/api/games/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { games_db as staticGamesSource } from '@/data/db'; // Импортируем статические игры
import { Game as SharedGameType } from '@/types';         // Ваш общий тип Game
import { getServerSession } from 'next-auth/next';        // Для PUT/DELETE
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Для PUT/DELETE

// Вспомогательная функция для маппинга статической игры в SharedGameType
// (можете вынести в утилиты, если используется в нескольких местах)
const mapStaticGameToSharedType = (sg: any): SharedGameType => {
  let processedScreenshots: string[] = [];
  if (Array.isArray(sg.screenshots)) {
    processedScreenshots = sg.screenshots
      .map((s_item: { url: any; }) => {
        if (typeof s_item === 'string') return s_item;
        if (s_item && typeof s_item === 'object' && 'url' in s_item && typeof s_item.url === 'string') return s_item.url;
        return null;
      })
      .filter((url: any): url is string => typeof url === 'string');
  }
  // Убедитесь, что поля здесь соответствуют вашему типу SharedGameType и данным в data/db.ts
  return {
    id: `static-${sg.id}`,
    title: sg.title,
    description: sg.description,
    genre: sg.genre ?? undefined,
    platform: sg.platform ?? undefined,
    developer: sg.developer ?? undefined,
    publisher: sg.publisher ?? undefined,
    releaseDate: sg.releaseDate ?? null, // Убедитесь, что тип соответствует
    price: sg.price ?? null,           // Убедитесь, что тип соответствует
    imageUrl: sg.imageUrl ?? null,     // Убедитесь, что тип соответствует
    isStatic: true,
    screenshots: processedScreenshots,
    // Добавляем createdAt и updatedAt, если они есть в SharedGameType
    // и вы хотите их для статических игр (можно использовать дату из файла или текущую)
    createdAt: sg.createdAt || new Date().toISOString(),
    updatedAt: sg.updatedAt || new Date().toISOString(),
  } as SharedGameType;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestedId = params.id;

    if (requestedId.startsWith('static-')) {
      // Это статическая игра
      const staticGameId = requestedId.substring('static-'.length);
      const staticGameData = staticGamesSource.find(g => String(g.id) === staticGameId);

      if (!staticGameData) {
        return NextResponse.json({ message: 'Статическая игра не найдена' }, { status: 404 });
      }
      const gameToReturn = mapStaticGameToSharedType(staticGameData);
      return NextResponse.json(gameToReturn);

    } else {
      // Это игра из Prisma
      const prismaGame = await prisma.game.findUnique({
        where: { id: requestedId },
        include: { screenshots: true }
      });

      if (!prismaGame) {
        return NextResponse.json({ message: 'Игра не найдена в базе данных' }, { status: 404 });
      }
      // Маппинг игры из Prisma в SharedGameType
      const { coverImageUrl, releaseDate, screenshots: prismaScreenshots, createdAt, updatedAt, ...restOfPrismaGame } = prismaGame;
      const gameToReturn: SharedGameType = {
        ...restOfPrismaGame,
        id: prismaGame.id, // Используем ID из Prisma
        imageUrl: coverImageUrl || null,
        releaseDate: releaseDate ? releaseDate.toISOString().split('T')[0] : null,
        screenshots: prismaScreenshots?.map(s => s.url) || [],
        isStatic: false,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        genre: restOfPrismaGame.genre ?? undefined,
        platform: restOfPrismaGame.platform ?? undefined,
        developer: restOfPrismaGame.developer ?? undefined,
        publisher: restOfPrismaGame.publisher ?? undefined,
        price: restOfPrismaGame.price ?? null,
      };
      return NextResponse.json(gameToReturn);
    }
  } catch (error) {
    console.error("Ошибка при получении игры по ID:", error);
    // В реальном приложении лучше не возвращать детали ошибки клиенту
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при получении игры', error: errorMessage }, { status: 500 });
  }
}

// --- ВАШИ СУЩЕСТВУЮЩИЕ МЕТОДЫ DELETE И PUT (НУЖНО АДАПТИРОВАТЬ) ---
// Они пока работают только с Prisma. Вам нужно решить, как они должны вести себя
// для статических игр (например, запрещать операции или обрабатывать иначе).

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestedId = params.id;

  // ЗАПРЕТИТЬ УДАЛЕНИЕ СТАТИЧЕСКИХ ИГР (пример)
  if (requestedId.startsWith('static-')) {
    return NextResponse.json({ message: 'Статические игры не могут быть удалены через это API' }, { status: 403 });
  }

  // Ваша текущая логика для удаления из Prisma
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }
  try {
    const existingGame = await prisma.game.findUnique({
      where: { id: requestedId }, // Используем requestedId
    });
    if (!existingGame) {
      return NextResponse.json({ message: 'Игра для удаления не найдена' }, { status: 404 });
    }
    await prisma.game.delete({
      where: { id: requestedId }, // Используем requestedId
    });
    return NextResponse.json({ message: 'Игра успешно удалена' }, { status: 200 });
  } catch (error) {
    console.error("Ошибка при удалении игры:", error);
    return NextResponse.json({ message: 'Ошибка сервера при удалении игры' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestedId = params.id;

  // ЗАПРЕТИТЬ ОБНОВЛЕНИЕ СТАТИЧЕСКИХ ИГР (пример)
  if (requestedId.startsWith('static-')) {
    return NextResponse.json({ message: 'Статические игры не могут быть обновлены через это API' }, { status: 403 });
  }

  // Ваша текущая логика для обновления в Prisma
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    // Убедитесь, что вы извлекаете все необходимые поля, которые есть в вашей модели Prisma Game
    // и которые вы хотите обновлять.
    const { title, description, genre, platform, price, developer, publisher, releaseDate, imageUrl, screenshots } = body;

    const existingGame = await prisma.game.findUnique({
      where: { id: requestedId }, // Используем requestedId
    });
    if (!existingGame) {
      return NextResponse.json({ message: 'Игра для обновления не найдена' }, { status: 404 });
    }

    // Данные для обновления, адаптируйте под свою Prisma модель
    const dataToUpdate: any = {
        title,
        description,
        genre: genre || null,
        platform: platform || null,
        price: typeof price === 'number' ? price : null,
        developer: developer || null,
        publisher: publisher || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        coverImageUrl: imageUrl || null,
        // Обновление скриншотов (screenshots) потребует более сложной логики:
        // - Удаление старых скриншотов, связанных с игрой
        // - Создание новых записей для новых URL скриншотов
        // Это выходит за рамки простого `screenshots: { create: ... }` при обновлении.
        // Пока что можно опустить обновление скриншотов или реализовать его отдельно.
    };
    
    // Удаляем поля, которые не должны быть undefined, если они не переданы
    Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
            // Для Prisma лучше передавать null, если поле обнуляется,
            // или не передавать поле вообще, если оно не меняется.
            // Если поле опционально и может быть null, то `dataToUpdate[key] = null;`
            // Если поле не должно меняться, если не передано, то `delete dataToUpdate[key];`
            // Текущая логика с `|| null` выше уже это обрабатывает для большинства полей.
        }
    });

    const updatedPrismaGame = await prisma.game.update({
      where: { id: requestedId }, // Используем requestedId
      data: dataToUpdate,
      include: { screenshots: true } // Включаем скриншоты, если они нужны в ответе
    });

    // Маппинг обновленной игры из Prisma в SharedGameType
    const { coverImageUrl: updatedCover, releaseDate: updatedRel, screenshots: updatedScreenshotsData, createdAt: crAt, updatedAt: upAt, ...rest } = updatedPrismaGame;
    const gameToReturn: SharedGameType = {
      ...rest,
      id: updatedPrismaGame.id,
      imageUrl: updatedCover || null,
      releaseDate: updatedRel ? updatedRel.toISOString().split('T')[0] : null,
      screenshots: updatedScreenshotsData?.map(s => s.url) || [],
      isStatic: false,
      createdAt: crAt.toISOString(),
      updatedAt: upAt.toISOString(),
      genre: rest.genre ?? undefined,
      platform: rest.platform ?? undefined,
      developer: rest.developer ?? undefined,
      publisher: rest.publisher ?? undefined,
      price: rest.price ?? null,
    };

    return NextResponse.json(gameToReturn, { status: 200 });
  } catch (error) {
    console.error("Ошибка при обновлении игры:", error);
    // В реальном приложении лучше не возвращать детали ошибки клиенту
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная серверная ошибка';
    return NextResponse.json({ message: 'Ошибка сервера при обновлении игры', error: errorMessage }, { status: 500 });
  }
}