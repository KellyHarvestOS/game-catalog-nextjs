// app/(main)/games/page.tsx
'use client';
import { useEffect } from 'react';
import GameCard from '@/components/GameCard'; // Убедитесь, что GameCard стилизован современно
import { useGames } from '@/contexts/GameContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
// import { PlusCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Пример иконок

// Компонент для состояния загрузки (можно вынести в отдельный файл)
const LoadingSkeletonCard = () => (
  <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden animate-pulse">
    <div className="w-full h-56 md:h-64 bg-slate-700"></div>
    <div className="p-5">
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-slate-700 rounded w-full"></div>
    </div>
  </div>
);

export default function GamesListPage() {
  const { state, fetchGames } = useGames();
  const { games, isLoading, error } = state;

  useEffect(() => {
    // Загружаем игры при монтировании компонента, если их еще нет
    // или если мы хотим принудительно обновить (можно добавить логику)
    if (games.length === 0 && !isLoading && !error) {
        fetchGames();
    }
    // Если вы хотите, чтобы данные всегда обновлялись при переходе на эту страницу:
    // fetchGames();
  }, [fetchGames, games.length, isLoading, error]); // Добавляем зависимости

  // Отображение скелетонов во время загрузки, если игры еще не загружены
  if (isLoading && games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400">Каталог Игр</h1>
          <div className="h-10 bg-slate-700 rounded w-48 animate-pulse"></div> {/* Placeholder для кнопки */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => ( // Показываем 8 скелетонов
            <LoadingSkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Улучшенное отображение ошибки
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" /> */}
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-2xl font-semibold text-red-400 mb-2">Не удалось загрузить игры</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <Button onClick={() => fetchGames()} variant="secondary">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400">Каталог Игр</h1>
        <Link href="/games/add">
          <Button variant="primary" className="flex items-center">
            {/* <PlusCircleIcon className="h-5 w-5 mr-2" /> */}
            <span className="text-lg mr-1">＋</span> Добавить Игру
          </Button>
        </Link>
      </div>

      {games.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-24 w-24 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">

          </svg>
          <h2 className="mt-2 text-2xl font-semibold text-slate-300">Каталог пока пуст</h2>
          <p className="mt-1 text-slate-500">Начните с добавления вашей первой игры!</p>
          <div className="mt-6">
            <Link href="/games/add">
              <Button variant="primary" size="lg"> {/* Увеличил кнопку */}
                Добавить первую игру
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"> {/* Увеличил gap на больших экранах */}
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
      
      {/* Можно добавить пагинацию здесь, если игр много */}
    </div>
  );
}