// app/api/games/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const gamesFromDb = await prisma.game.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        screenshots: true, // Если у вас есть связанная модель Screenshot
      }
    });
    return NextResponse.json(gamesFromDb);
  } catch (error) {
    console.error("Ошибка при получении списка игр из Prisma:", error);
    return NextResponse.json({ message: 'Ошибка сервера при получении списка игр' }, { status: 500 });
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
    const {
      title,
      description,
      genre,
      platform,
      developer,
      publisher,
      releaseDate,
      price,
      coverImageUrl,
      screenshotUrls // Предполагаем, что это массив URL строк от клиента
    } = body;

    if (!title || !description ) { // Добавьте другие обязательные поля
      return NextResponse.json({ message: 'Отсутствуют обязательные поля: title, description' }, { status: 400 });
    }

    const newGameInDb = await prisma.game.create({
      data: {
        title,
        description,
        genre,
        platform,
        developer,
        publisher,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        price,
        coverImageUrl,
        screenshots: screenshotUrls && Array.isArray(screenshotUrls)
          ? {
              create: screenshotUrls.map((url: string) => ({ url })),
            }
          : undefined,
      },
      include: { // Чтобы вернуть созданную игру вместе со скриншотами
        screenshots: true,
      }
    });
    return NextResponse.json(newGameInDb, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании игры в Prisma:", error);
    return NextResponse.json({ message: 'Ошибка сервера при создании игры' }, { status: 500 });
  }
}