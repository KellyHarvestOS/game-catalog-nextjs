// app/(main)/games/page.tsx
'use client'; // Так как используем useGames хук
import { useEffect } from 'react';
import GameCard from '@/components/GameCard';
import { useGames } from '@/contexts/GameContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function GamesListPage() {
  const { state, fetchGames } = useGames();
  const { games, isLoading, error } = state;

  useEffect(() => {
    // Данные уже загружаются в GameProvider, но можно добавить принудительное обновление если нужно
    // fetchGames();
  }, [fetchGames]);


  if (isLoading && games.length === 0) return <p className="text-center text-xl">Загрузка игр...</p>;
  if (error) return <p className="text-center text-red-500 text-xl">Ошибка: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-400">Каталог Игр</h1>
        <Link href="/games/add">
          <Button>Добавить новую игру</Button>
        </Link>
      </div>
      {games.length === 0 && !isLoading ? (
        <p className="text-center text-gray-400">Пока нет игр в каталоге. Добавьте первую!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}