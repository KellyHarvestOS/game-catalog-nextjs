// app/(main)/games/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GameCard from '@/components/GameCard';
import GameCardSkeleton from '@/components/GameCardSkeleton';
import { useGames } from '@/contexts/GameContext';
import Button from '@/components/ui/Button';
import FilterSidebar from '@/components/filters/FilterSidebar';

interface ActiveFilters {
  genres: string[];
  platforms: string[];
  // searchTerm?: string;
  // priceRange?: {min?: number, max?: number};
}

const GamesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { 
    state: gameState, 
    fetchGames, 
    fetchFilterOptions 
  } = useGames();
  
  const { 
    games, 
    isLoading: isLoadingGames, 
    error: gamesError,
    filterOptions, 
    isLoadingFilterOptions,
    filterOptionsError 
  } = gameState;

  // Локальное состояние для ВЫБРАННЫХ фильтров (изменяется пользователем в UI)
  const [selectedFilters, setSelectedFilters] = useState<ActiveFilters>({
    genres: [],
    platforms: [],
  });

  // 1. Инициализация выбранных фильтров из URL при монтировании
  useEffect(() => {
    const genresFromUrl = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const platformsFromUrl = searchParams.get('platforms')?.split(',').filter(Boolean) || [];
    // console.log('Initializing filters from URL:', { genres: genresFromUrl, platforms: platformsFromUrl });
    setSelectedFilters({
      genres: genresFromUrl,
      platforms: platformsFromUrl,
    });
  }, [searchParams]); // Зависит только от searchParams для первоначальной загрузки

  // 2. Загрузка доступных опций для фильтров
  useEffect(() => {
    if (filterOptions.genres.length === 0 && filterOptions.platforms.length === 0 && !isLoadingFilterOptions && !filterOptionsError) {
      fetchFilterOptions();
    }
  }, [fetchFilterOptions, filterOptions, isLoadingFilterOptions, filterOptionsError]);

  // 3. Загрузка игр на основе строки запроса из URL (это будет источником правды для данных)
  useEffect(() => {
    // searchParams.toString() вернет всю строку запроса: "genres=Action,RPG&platforms=PC"
    const currentQueryString = searchParams.toString();
    // console.log('Query string changed, fetching games:', currentQueryString);
    fetchGames(currentQueryString);
  }, [searchParams, fetchGames]); // Загружаем игры, когда searchParams меняются


  const handleGenreChange = (genre: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (selectedFilters.genres.length > 0) newParams.set('genres', selectedFilters.genres.join(','));
    if (selectedFilters.platforms.length > 0) newParams.set('platforms', selectedFilters.platforms.join(','));
    // ... добавить другие фильтры
    
    // router.push обновит URL, что вызовет useEffect, который зависит от searchParams,
    // и он, в свою очередь, вызовет fetchGames.
    router.push(`/games?${newParams.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setSelectedFilters({ genres: [], platforms: [] });
    router.push('/games', { scroll: false });
  };

  const renderSkeletons = (count: number = 6) => ( // Уменьшил количество для сайдбара
    Array.from({ length: count }).map((_, index) => (
      <GameCardSkeleton key={`skeleton-${index}`} />
    ))
  );

  const renderContent = () => {
    if (isLoadingGames && games.length === 0) { // Показываем скелеты только если список игр пуст
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {renderSkeletons()}
        </div>
      );
    }
    if (gamesError) {
      return (
        <div className="text-center text-red-400 py-10">
          <p className="text-xl font-semibold">Произошла ошибка</p>
          <p className="mb-4 text-red-300">{gamesError}</p>
          <Button onClick={() => fetchGames(searchParams.toString())} variant="primary" className="mt-2">
            Попробовать снова
          </Button>
        </div>
      );
    }
    if (!isLoadingGames && games.length === 0) {
      return (
        <div className="text-center text-slate-400 py-10">
          <p className="text-xl font-semibold">Игры не найдены</p>
          <p>Попробуйте изменить фильтры или сбросить их.</p>
        </div>
      );
    }
    // Если isLoadingGames === true, но games.length > 0, мы показываем старые игры и индикатор загрузки где-то еще (по желанию)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    );
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Текущие активные фильтры из URL для отображения "тегов"
  const activeUrlGenres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const activeUrlPlatforms = searchParams.get('platforms')?.split(',').filter(Boolean) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-4 sm:mb-0 text-center sm:text-left">
          Каталог Игр
        </h1>
        <div className="flex items-center gap-4">
            <Button onClick={() => setIsMobileFilterOpen(true)} variant="secondary" className="md:hidden">
                Фильтры
            </Button>
            <Link
              href="/games/add"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg"
            >
              Добавить игру
            </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Обертка для сайдбара, чтобы управлять его видимостью */}
        <div className={`
            fixed inset-0 z-40 transform md:transform-none md:static
            transition-transform duration-300 ease-in-out
            ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:block w-4/5 max-w-xs md:w-72 lg:w-80
        `}>
            <div className="h-full bg-slate-800 shadow-xl p-4 overflow-y-auto md:rounded-lg md:sticky md:top-24 md:h-fit">
                <div className="flex justify-between items-center mb-4 md:mb-0">
                    <h2 className="text-xl font-semibold text-indigo-400 md:text-2xl md:border-b md:border-slate-700 md:pb-3">Фильтры</h2>
                    <Button onClick={() => setIsMobileFilterOpen(false)} variant="ghost" size="icon"  className="md:hidden" >
                        ✕
                    </Button>
                </div>
                <FilterSidebar
                    availableGenres={filterOptions.genres}
                    availablePlatforms={filterOptions.platforms}
                    selectedGenres={selectedFilters.genres} // Используем selectedFilters для UI
                    selectedPlatforms={selectedFilters.platforms} // Используем selectedFilters для UI
                    onGenreChange={handleGenreChange}
                    onPlatformChange={handlePlatformChange}
                    onApplyFilters={() => { handleApplyFilters(); setIsMobileFilterOpen(false); }}
                    onResetFilters={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
                    isLoadingFilters={isLoadingFilterOptions}
                />
            </div>
        </div>
        {/* Затемняющая подложка для мобильного сайдбара */}
        {isMobileFilterOpen && (
             <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileFilterOpen(false)}></div>
        )}


        <main className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isLoadingGames && <span className="text-sm text-slate-400 italic">Обновление...</span>}
            {activeUrlGenres.map(g => <span key={`active-${g}`} className="bg-indigo-500 text-white px-2 py-1 text-xs rounded-full">{g}</span>)}
            {activeUrlPlatforms.map(p => <span key={`active-${p}`} className="bg-sky-500 text-white px-2 py-1 text-xs rounded-full">{p}</span>)}
            {(activeUrlGenres.length > 0 || activeUrlPlatforms.length > 0) && (
                <Button onClick={handleResetFilters} size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-red-400 ml-2">
                    Очистить все
                </Button>
            )}
          </div>
          {filterOptionsError && <p className="text-red-400 mb-4">Ошибка загрузки опций фильтров: {filterOptionsError}</p>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GamesPage;