// app/api/games/route.ts
import { NextResponse } from 'next/server';
import { Game } from '@/types';
import { games_db as games } from '@/data/db'; // <--- ИЗМЕНЕНИЕ ЗДЕСЬ

export async function GET() {
  return NextResponse.json(games);
}

export async function POST(request: Request) {
  try {
    const newGameData = await request.json() as Omit<Game, 'id'>;
    // ... (остальная часть POST-обработчика остается той же)
    // только `games.push(newGame);` теперь будет работать с `games_db`
    if (!newGameData.title || !newGameData.genre || !newGameData.platform || !newGameData.price || !newGameData.developer || !newGameData.releaseDate || !newGameData.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newGame: Game = {
      id: String(Date.now() + Math.random()), // Простой генератор ID, чуть более уникальный
      ...newGameData,
    };
    games.push(newGame);
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Failed to parse POST request body or create game:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}