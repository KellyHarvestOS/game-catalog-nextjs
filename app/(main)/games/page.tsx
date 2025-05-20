// app/(main)/games/page.tsx
'use client';

import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GameCard from '@/components/GameCard';
import GameCardSkeleton from '@/components/GameCardSkeleton';
import { useGames } from '@/contexts/GameContext';
import Button from '@/components/ui/Button';
import FilterSidebar from '@/components/filters/FilterSidebar';
import Input from '@/components/ui/Input'; // Ваш кастомный компонент Input
// import { Search as SearchIcon } from 'lucide-react'; // Для иконки

interface ActiveFilters {
  genres: string[];
  platforms: string[];
  searchTerm: string;
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

  const [selectedFilters, setSelectedFilters] = useState<ActiveFilters>({
    genres: [],
    platforms: [],
    searchTerm: '',
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const genresFromUrl = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const platformsFromUrl = searchParams.get('platforms')?.split(',').filter(Boolean) || [];
    const searchTermFromUrl = searchParams.get('search') || '';
    setSelectedFilters({
      genres: genresFromUrl,
      platforms: platformsFromUrl,
      searchTerm: searchTermFromUrl,
    });
  }, [searchParams]);

  useEffect(() => {
    if (filterOptions.genres.length === 0 && filterOptions.platforms.length === 0 && !isLoadingFilterOptions && !filterOptionsError) {
      fetchFilterOptions();
    }
  }, [fetchFilterOptions, filterOptions, isLoadingFilterOptions, filterOptionsError]);

  useEffect(() => {
    const currentQueryString = searchParams.toString();
    fetchGames(currentQueryString);
  }, [searchParams, fetchGames]);

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

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFilters(prev => ({
      ...prev,
      searchTerm: event.target.value,
    }));
  };

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (selectedFilters.genres.length > 0) newParams.set('genres', selectedFilters.genres.join(','));
    if (selectedFilters.platforms.length > 0) newParams.set('platforms', selectedFilters.platforms.join(','));
    if (selectedFilters.searchTerm.trim() !== '') newParams.set('search', selectedFilters.searchTerm.trim());
    
    router.push(`/games?${newParams.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setSelectedFilters({ genres: [], platforms: [], searchTerm: '' });
    router.push('/games', { scroll: false });
  };
  
  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) event.preventDefault();
      handleApplyFilters();
  };

  const renderSkeletons = (count: number = 6) => (
    Array.from({ length: count }).map((_, index) => (
      <GameCardSkeleton key={`skeleton-${index}`} />
    ))
  );

  const renderContent = () => {
    if (isLoadingGames && games.length === 0) {
      return ( <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{renderSkeletons()}</div> );
    }
    if (gamesError) {
      return ( <div className="text-center text-red-400 py-10"><p className="text-xl font-semibold">Произошла ошибка</p><p className="mb-4 text-red-300">{gamesError}</p><Button onClick={() => fetchGames(searchParams.toString())} variant="primary" className="mt-2">Попробовать снова</Button></div> );
    }
    if (!isLoadingGames && games.length === 0) {
      return ( <div className="text-center text-slate-400 py-10"><p className="text-xl font-semibold">Игры не найдены</p><p>Попробуйте изменить фильтры или сбросить их.</p></div> );
    }
    return ( <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{games.map((game) => (<GameCard key={game.id} game={game} />))}</div> );
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const activeUrlGenres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const activeUrlPlatforms = searchParams.get('platforms')?.split(',').filter(Boolean) || [];
  const activeUrlSearchTerm = searchParams.get('search') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-400 mb-4 sm:mb-0 text-center sm:text-left">
          Каталог Игр
        </h1>
        <div className="flex items-center gap-4">
            <Button onClick={() => setIsMobileFilterOpen(true)} variant="secondary" className="md:hidden px-4 py-2 text-sm">
                Фильтры
            </Button>
            <Link href="/games/add" className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-indigo-500/50 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
              Добавить игру
            </Link>
        </div>
      </div>

      {/* --- Секция Поиска --- */}
      <section className="mb-10 md:mb-12 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="w-full">
            {/* Обертка для Input и иконки */}
            <div className="relative group w-full">
              <div 
                className={`
                  absolute left-0 top-0 bottom-0 pl-4 pr-3 flex items-center 
                  pointer-events-none transition-all duration-300 ease-out
                  group-focus-within:text-indigo-400 
                  ${isSearchFocused || selectedFilters.searchTerm ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}
                `}
              >
                <svg className={`h-5 w-5 transition-transform duration-300 ${isSearchFocused ? 'scale-110' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                  type="search"
                  id="gameSearchCatalog"
                  name="gameSearch"
                  label="Поиск игр" 
                  labelClassName="sr-only" // Скрываем label визуально
                  placeholder="Найти свою любимую игру..."
                  value={selectedFilters.searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  // Классы для самого <input> элемента внутри вашего компонента Input
                  inputClassName={`
                    w-full pl-12 pr-4 py-3.5 text-base sm:text-lg 
                    !bg-slate-700/60 !border-2 !border-transparent !rounded-xl 
                    focus:!bg-slate-700 focus:!border-indigo-500 focus:!ring-0 
                    placeholder-slate-500 
                    transition-all duration-300 ease-out
                    shadow-lg hover:shadow-indigo-500/30 focus:shadow-indigo-500/50
                  `}
                  // containerClassName не нужен здесь, так как мы создали свою обертку
              />
            </div>
          </form>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className={`
            fixed inset-0 z-40 transform md:transform-none md:static
            transition-transform duration-300 ease-in-out
            ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:block w-4/5 max-w-xs md:w-72 lg:w-80
        `}>
            <div className="h-full bg-slate-800 shadow-xl p-4 overflow-y-auto md:rounded-lg md:sticky md:top-24 md:h-fit">
             <div className="flex justify-between items-center mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-indigo-400 md:text-2xl md:border-b md:border-slate-700 md:pb-3">Фильтры</h2>
                <Button onClick={() => setIsMobileFilterOpen(false)} variant="ghost" size="icon" className="md:hidden">✕</Button>
             </div>
                <FilterSidebar
                    availableGenres={filterOptions.genres}
                    availablePlatforms={filterOptions.platforms}
                    selectedGenres={selectedFilters.genres}
                    selectedPlatforms={selectedFilters.platforms}
                    onGenreChange={handleGenreChange}
                    onPlatformChange={handlePlatformChange}
                    onApplyFilters={() => { handleApplyFilters(); setIsMobileFilterOpen(false); }}
                    onResetFilters={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
                    isLoadingFilters={isLoadingFilterOptions}
                />
            </div>
        </div>
        {isMobileFilterOpen && (
             <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileFilterOpen(false)}></div>
        )}

        <main className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isLoadingGames && <span className="text-sm text-slate-400 italic">Загрузка игр...</span>}
            {activeUrlSearchTerm && ( <span className="bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-full">Поиск: "{activeUrlSearchTerm}"</span> )}
            {activeUrlGenres.map(g => <span key={`active-${g}`} className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-full">{g}</span>)}
            {activeUrlPlatforms.map(p => <span key={`active-${p}`} className="bg-sky-600 text-white px-3 py-1 text-xs font-medium rounded-full">{p}</span>)}
            {(activeUrlGenres.length > 0 || activeUrlPlatforms.length > 0 || activeUrlSearchTerm) && ( <Button onClick={handleResetFilters} size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-red-400 ml-1">Очистить все</Button> )}
          </div>
          {filterOptionsError && <p className="text-red-400 mb-4 text-sm">Ошибка загрузки опций фильтров: {filterOptionsError}</p>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GamesPage;