// app/(main)/games/page.tsx
'use client';
import { useEffect, useRef } from 'react';
import GameCard from '@/components/GameCard';
import { useGames } from '@/contexts/GameContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

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
  const { data: session, status: sessionStatus } = useSession();
  const isLoadingSession = sessionStatus === 'loading';
  const userRole = session?.user?.role as string | undefined;

  const { state, fetchGames } = useGames();
  const { games, isLoading, error } = state;

  const initialFetchAttempted = useRef(false);

  useEffect(() => {
    if (!initialFetchAttempted.current && !isLoading) {
      fetchGames();
      initialFetchAttempted.current = true;
    }
  }, [fetchGames, isLoading]);

  if (isLoading && !initialFetchAttempted.current && games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400">Каталог Игр</h1>
          <div className="h-10 bg-slate-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingSkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-2xl font-semibold text-red-400 mb-2">Не удалось загрузить игры</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <Button onClick={() => {
            initialFetchAttempted.current = false; // Разрешаем повторную попытку
            fetchGames();
          }}
          variant="secondary"
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400">Каталог Игр</h1>
        {!isLoadingSession && session && userRole === 'ADMIN' && (
          <Link href="/games/add">
            <Button variant="primary" className="flex items-center">
              <span className="text-lg mr-1">＋</span> Добавить Игру
            </Button>
          </Link>
        )}
      </div>

      {games.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15 10V9a3 3 0 00-3-3H9M9 10v1a3 3 0 003 3h3m-3-3V9m0 3H9m0-3h3" />
          </svg>
          <h2 className="mt-2 text-2xl font-semibold text-slate-300">Каталог пока пуст</h2>
          <p className="mt-1 text-slate-500">Начните с добавления вашей первой игры!</p>
          <div className="mt-6">
          {!isLoadingSession && session && userRole === 'ADMIN' && (
            <Link href="/games/add">
              <Button variant="primary" size="lg">
                Добавить первую игру
              </Button>
            </Link>
          )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}