// Файл: app/api/games/[id]/purchase/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Убедитесь, что путь к authOptions правильный
import prisma from '@/data/prisma'; // Убедитесь, что путь к prisma client правильный

export async function POST(
  request: Request, // Первый аргумент - объект Request
  context: { params: { id: string } } // Второй аргумент содержит params
) {
  const { params } = context; // Извлекаем params из context

  console.log("PURCHASE API - Received params:", params);

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.log("Purchase API - Error: Not authenticated");
    return NextResponse.json({ message: 'Не аутентифицирован' }, { status: 401 });
  }

  const userId = session.user.id;
  const gameId = params.id; // Получаем gameId из params.id

  console.log(`Purchase API - Processing for userId: ${userId}, gameId: ${gameId}`);

  if (!gameId) {
    console.log("Purchase API - Error: Game ID is missing from params");
    // Эта ошибка 400 будет, если params.id каким-то образом оказался undefined/null
    return NextResponse.json({ message: 'Требуется ID игры' }, { status: 400 });
  }

  try {
    // 1. Найти игру
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      console.log(`Purchase API - Error: Game not found with id: ${gameId}`);
      return NextResponse.json({ message: 'Игра не найдена' }, { status: 404 });
    }
    console.log(`Purchase API - Game found: ${game.title || game.description}`);

    // 2. Проверить, владеет ли пользователь уже этой игрой
    const existingPurchase = await prisma.purchasedGame.findUnique({
      where: {
        // Убедитесь, что имя вашего уникального индекса в модели PurchasedGame правильное
        // Обычно это `userId_gameId` если вы использовали `@@unique([userId, gameId])`
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (existingPurchase) {
      console.log(`Purchase API - Info: User ${userId} already owns game ${gameId}`);
      return NextResponse.json({ message: 'Вы уже владеете этой игрой' }, { status: 409 }); // Conflict
    }

    // 3. Обработать покупку в зависимости от цены
    const isFree = game.price === null || game.price === 0;

    if (isFree) {
      await prisma.purchasedGame.create({
        data: {
          userId,
          gameId,
        },
      });
      console.log(`Purchase API - Success: Free game ${gameId} added for user ${userId}`);
      return NextResponse.json({
        message: 'Бесплатная игра добавлена в вашу библиотеку!',
        gameTitle: game.title || game.description,
        type: 'free_purchase',
      });
    } else {
      // Симуляция оплаты для платной игры
      // В реальном приложении здесь будет интеграция с платежным шлюзом.
      await prisma.purchasedGame.create({
        data: {
          userId,
          gameId,
        },
      });
      console.log(`Purchase API - Success: Paid game ${gameId} (price: ${game.price}) added for user ${userId}`);
      return NextResponse.json({
        message: `Оплата прошла успешно! "${game.title || game.description}" добавлена в вашу библиотеку.`,
        gameTitle: game.title || game.description,
        type: 'paid_purchase',
        price: game.price,
      });
    }
  } catch (error) {
    console.error('Purchase API - Server Error during purchase process:', error);
    // Здесь можно добавить более специфичную обработку ошибок Prisma, если нужно
    return NextResponse.json({ message: 'Ошибка сервера при покупке (внутренняя)' }, { status: 500 });
  }
}