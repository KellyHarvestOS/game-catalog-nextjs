import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const game = await prisma.game.findUnique({
      where: { id: id },
    });

    if (!game) {
      return NextResponse.json({ message: 'Игра не найдена' }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return NextResponse.json({ message: 'Ошибка сервера при получении игры' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }

  try {
    const id = params.id;
    const existingGame = await prisma.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return NextResponse.json({ message: 'Игра для удаления не найдена' }, { status: 404 });
    }

    await prisma.game.delete({
      where: { id: id },
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
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Доступ запрещен: требуется авторизация администратора' },
      { status: 403 }
    );
  }

  try {
    const id = params.id;
    const body = await request.json();
    const { title, description, genre, platform, price } = body;

    const existingGame = await prisma.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return NextResponse.json({ message: 'Игра для обновления не найдена' }, { status: 404 });
    }

    const updatedGame = await prisma.game.update({
      where: { id: id },
      data: {
        title,
        description,
        genre,
        platform,
        price,
      },
    });
    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    console.error("Ошибка при обновлении игры:", error);
    return NextResponse.json({ message: 'Ошибка сервера при обновлении игры' }, { status: 500 });
  }
}