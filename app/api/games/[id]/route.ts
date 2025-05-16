// app/api/games/[id]/route.ts
import { NextResponse } from 'next/server';
import { Game } from '@/types';

// Получаем доступ к тому же in-memory store (это упрощение)
// В реальном приложении здесь был бы импорт 'games' или доступ к БД
// Для простоты примера, представим что 'games' доступен (но это не так между файлами в serverless функциях)
// Правильный способ - использовать БД или какой-то общий модуль для хранения состояния.
// Но для учебных целей, мы будем модифицировать его здесь, понимая, что это не лучший подход.
// Для этого примера, чтобы он заработал без БД, нужно будет переопределить games здесь или передавать
// его как-то. Поскольку это serverless, каждый запрос к API - это отдельный инстанс.
// Чтобы это работало как ожидается с in-memory, нужно чтобы `games` было в отдельном модуле
// и импортировалось в оба файла `route.ts`.

// Давайте сделаем так: создадим файл `data/db.ts`
// data/db.ts
// export let games_db: Game[] = [ ... начальные данные ... ];

// И импортируем его. Сначала создадим `data/db.ts`
/*
Файл `data/db.ts`:
import { Game } from '@/types';

export let games_db: Game[] = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    platform: 'PC, PS5, Xbox Series X/S',
    releaseDate: '2020-12-10',
    developer: 'CD Projekt Red',
    description: 'An open-world, action-adventure story set in Night City.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    price: 59.99,
  },
  {
    id: '2',
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC, PS4, Xbox One, Switch',
    releaseDate: '2015-05-19',
    developer: 'CD Projekt Red',
    description: 'A story-driven, next-generation open world role-playing game.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
    price: 39.99,
  },
  {
    id: '3',
    title: 'Elden Ring',
    genre: 'Action RPG',
    platform: 'PC, PS5, Xbox Series X/S, PS4, Xbox One',
    releaseDate: '2022-02-25',
    developer: 'FromSoftware',
    description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_Art.jpg',
    price: 69.99,
  }
];
*/
// Убедитесь, что создали этот файл.
// Теперь вернемся к `app/api/games/[id]/route.ts`

// Этот подход с in-memory DB в виде переменной в модуле будет работать в режиме разработки (npm run dev)
// из-за особенностей кэширования модулей Node.js.
// В продакшене (serverless environment) каждый вызов API может быть отдельной функцией,
// и состояние не будет сохраняться между вызовами таким образом. Нужна внешняя БД.
import { games_db as games } from '@/data/db'; // Предполагаем, что db.ts создан в /data

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const game = games.find(g => g.id === params.id);
  if (game) {
    return NextResponse.json(game);
  }
  return NextResponse.json({ error: 'Game not found' }, { status: 404 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gameIndex = games.findIndex(g => g.id === params.id);
  if (gameIndex !== -1) {
    const deletedGame = games.splice(gameIndex, 1);
    // Важно: Это изменит массив `games_db` в `data/db.ts` для последующих запросов в dev режиме.
    return NextResponse.json(deletedGame[0]);
  }
  return NextResponse.json({ error: 'Game not found' }, { status: 404 });
}

// PUT для обновления (опционально)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gameIndex = games.findIndex(g => g.id === params.id);
  if (gameIndex !== -1) {
    try {
      const updatedData = await request.json() as Partial<Game>;
      games[gameIndex] = { ...games[gameIndex], ...updatedData, id: params.id }; // Ensure ID is not changed
      return NextResponse.json(games[gameIndex]);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }
  return NextResponse.json({ error: 'Game not found' }, { status: 404 });
}