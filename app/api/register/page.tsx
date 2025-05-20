// app/games/page.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard'; // Ваша существующая карточка игры
import GameCardSkeleton from '@/components/GameCardSkeleton'; // Компонент скелета
import { useGames } from '@/contexts/GameContext';
// Предполагается, что у вас есть компонент Button в '@/components/ui/Button'
// Если нет, замените на обычную кнопку или стилизуйте Link как кнопку
import Button from '@/components/ui/Button';

const GamesPage = () => {
  // Ваш контекст уже предоставляет state напрямую, а не state.state
  const { state, fetchGames } = useGames();
  const { games, isLoading, error } = state; // Деструктурируем из state

  useEffect(() => {
    // Загружаем игры, если они еще не загружены и нет ошибки
    // Это предотвратит повторную загрузку, если данные уже есть или была ошибка
    if (games.length === 0 && !isLoading && !error) {
      fetchGames();
    }
  }, [fetchGames, games.length, isLoading, error]); // Добавляем все зависимости

  const renderSkeletons = (count: number = 8) => ( // Можно передать количество скелетов
    Array.from({ length: count }).map((_, index) => (
      <GameCardSkeleton key={`skeleton-${index}`} />
    ))
  );

  const renderContent = () => {
    // Показываем скелеты, если идет загрузка И список игр еще пуст (первоначальная загрузка)
    if (isLoading && games.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {renderSkeletons()}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 py-10">
          <p className="text-xl font-semibold">Произошла ошибка при загрузке игр</p>
          <p className="mb-4 text-red-300">{error}</p>
          <Button onClick={() => fetchGames()} variant="primary" className="mt-2">
            Попробовать снова
          </Button>
        </div>
      );
    }

    // Если не идет загрузка и список игр пуст (например, после неудачной загрузки или если игр действительно нет)
    if (!isLoading && games.length === 0) {
      return (
        <div className="text-center text-slate-400 py-10">
          <p className="text-xl font-semibold">Игры не найдены</p>
          <p>Кажется, в нашем каталоге пока пусто. Попробуйте добавить новую игру!</p>
        </div>
      );
    }

    // Если есть игры (загрузка могла завершиться или игры уже были в состоянии)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-4 sm:mb-0 text-center sm:text-left">
          Каталог Игр
        </h1>
        {/* ИСПРАВЛЕНО: Используем Link по-новому */}
        <Link
          href="/games/add" // 'new' было в предыдущем коде, но '/games/add' у вас в структуре папок для добавления
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm sm:text-base"
        >
          Добавить игру
        </Link>
      </div>
      {renderContent()}
    </div>
  );
};

export default GamesPage;