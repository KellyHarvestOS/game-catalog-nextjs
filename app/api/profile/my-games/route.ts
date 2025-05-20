// app/api/profile/my-games/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { PurchasedGame, Game } from '@prisma/client'; 
type PurchasedGameWithGame = PurchasedGame & {
  game: Game;
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const purchasedGamesData = await prisma.purchasedGame.findMany({ // `purchasedGame` должно стать доступным после `prisma generate`
      where: { userId: session.user.id },
      include: {
        game: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    // Применяем явно типизированный параметр
    const games = (purchasedGamesData as PurchasedGameWithGame[]).map((pg: PurchasedGameWithGame) => pg.game);
    return NextResponse.json(games);
  } catch (error) {
    console.error("Ошибка при получении купленных игр:", error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}