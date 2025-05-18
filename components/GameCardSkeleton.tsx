// components/GameCardSkeleton.tsx
import React from 'react';

const GameCardSkeleton: React.FC = () => {
  // Выберите одну из анимаций: 'animate-pulse' (Tailwind по умолчанию) или 'animate-shimmer' (кастомная)
  const animationClass = 'animate-pulse'; // или 'animate-shimmer'
  // Если используете 'animate-shimmer', убедитесь, что стили для него добавлены в globals.css

  return (
    <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      {/* Имитация изображения */}
      <div className={`relative w-full h-56 md:h-64 bg-slate-700 ${animationClass}`}></div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Имитация заголовка */}
          <div className={`h-6 bg-slate-700 rounded w-3/4 mb-3 ${animationClass}`}></div>
          {/* Имитация текста (жанр, платформа) */}
          <div className="space-y-2 mb-4">
            <div className={`h-4 bg-slate-700 rounded w-1/2 ${animationClass}`}></div>
            <div className={`h-4 bg-slate-700 rounded w-1/3 ${animationClass}`}></div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center gap-2">
          {/* Имитация кнопок */}
          <div className={`h-10 bg-slate-700 rounded flex-1 ${animationClass}`}></div>
          <div className={`h-10 bg-slate-700 rounded w-1/4 ${animationClass}`}></div>
        </div>
      </div>
    </div>
  );
};

export default GameCardSkeleton;