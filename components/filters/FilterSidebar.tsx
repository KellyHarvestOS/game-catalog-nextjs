// components/filters/FilterSidebar.tsx
'use client';

import React from 'react';
import Button from '@/components/ui/Button';
// Позже мы добавим сюда импорты для конкретных компонентов фильтров
// import GenreFilter from './GenreFilter';
// import PlatformFilter from './PlatformFilter';
// import PriceFilter from './PriceFilter';

// Предположим, эти пропсы будут приходить из GamesPage или контекста
interface FilterSidebarProps {
  availableGenres: string[];
  availablePlatforms: string[];
  // другие доступные опции...
  selectedGenres: string[];
  selectedPlatforms: string[];
  // другие выбранные фильтры...
  onGenreChange: (genre: string) => void;
  onPlatformChange: (platform: string) => void;
  // другие обработчики...
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isLoadingFilters: boolean; // Для состояния загрузки самих опций фильтров
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  availableGenres,
  availablePlatforms,
  selectedGenres,
  selectedPlatforms,
  onGenreChange,
  onPlatformChange,
  onApplyFilters,
  onResetFilters,
  isLoadingFilters,
}) => {
  // Для мобильной версии - состояние открытия/закрытия сайдбара
  // const [isOpen, setIsOpen] = useState(false);
  // Это лучше будет управляться из GamesPage

  if (isLoadingFilters) {
    return (
        <aside className="w-full md:w-72 lg:w-80 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg space-y-6 h-fit sticky top-24">
            <h2 className="text-2xl font-semibold text-indigo-400 border-b border-slate-700 pb-3">Фильтры</h2>
            <p className="text-slate-400">Загрузка опций...</p>
        </aside>
    );
  }


  return (
    // Стилизация для десктопа и мобильных (позже)
    // `h-fit sticky top-24` чтобы сайдбар "прилипал" при скролле, но не выходил за пределы контента
    <aside className="w-full md:w-72 lg:w-80 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg space-y-6 h-fit sticky top-24">
      <h2 className="text-2xl font-semibold text-indigo-400 border-b border-slate-700 pb-3">
        Фильтры
      </h2>

      {/* Раздел для Жанров */}
      <div className="filter-section">
        <h3 className="text-lg font-medium text-slate-200 mb-3">Жанры</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Ограничение высоты и скролл */}
          {availableGenres.length > 0 ? availableGenres.map((genre) => (
            <label key={genre} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 p-1 rounded-md transition-colors">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-500 bg-slate-600 border-slate-500 rounded focus:ring-indigo-400 focus:ring-offset-slate-800"
                checked={selectedGenres.includes(genre)}
                onChange={() => onGenreChange(genre)}
              />
              <span className="text-slate-300">{genre}</span>
            </label>
          )) : <p className="text-sm text-slate-500">Нет доступных жанров</p>}
        </div>
      </div>

      {/* Раздел для Платформ */}
      <div className="filter-section">
        <h3 className="text-lg font-medium text-slate-200 mb-3">Платформы</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {availablePlatforms.length > 0 ? availablePlatforms.map((platform) => (
            <label key={platform} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 p-1 rounded-md transition-colors">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-500 bg-slate-600 border-slate-500 rounded focus:ring-indigo-400 focus:ring-offset-slate-800"
                checked={selectedPlatforms.includes(platform)}
                onChange={() => onPlatformChange(platform)}
              />
              <span className="text-slate-300">{platform}</span>
            </label>
          )) : <p className="text-sm text-slate-500">Нет доступных платформ</p>}
        </div>
      </div>
      
      {/* --- Другие фильтры (цена, разработчик и т.д.) будут добавлены сюда --- */}
      {/* Например, фильтр по цене (очень упрощенный) */}
      {/* <div className="filter-section">
        <h3 className="text-lg font-medium text-slate-200 mb-3">Цена</h3>
        <input type="range" min="0" max="100" className="w-full"/>
      </div> */}


      {/* Кнопки управления */}
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <Button onClick={onApplyFilters} variant="primary" className="w-full">
          Применить
        </Button>
        <Button onClick={onResetFilters} variant="ghost" className="w-full text-slate-400 hover:bg-slate-700">
          Сбросить все
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;