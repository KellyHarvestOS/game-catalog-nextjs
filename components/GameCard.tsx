// components/GameCard.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Game } from '@/types';
import Button from './ui/Button';
import { useGames } from '@/contexts/GameContext';
// Иконки можно добавить, например, из heroicons
// import { EyeIcon, TrashIcon, CurrencyDollarIcon, TagIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { deleteGame } = useGames();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Остановить переход по ссылке, если карточка целиком ссылка
    e.stopPropagation(); // Остановить всплытие события
    if (window.confirm(`Вы уверены, что хотите удалить "${game.title}"?`)) {
      try {
        await deleteGame(game.id);
        // Можно добавить уведомление об успехе здесь (например, с react-toastify)
      } catch (error) {
        console.error("Failed to delete game:", error);
        // Можно добавить уведомление об ошибке
      }
    }
  };

  return (
    <div className="group bg-slate-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-indigo-500/50 flex flex-col">
      <Link href={`/games/${game.id}`} className="block"> {/* Обернем карточку в ссылку для лучшего UX */}
        <div className="relative w-full h-56 md:h-64"> {/* Увеличил высоту изображения */}
          <Image
            // Consider using a public path for placeholder images. 
            // e.g., if '/public/placeholder-game-cover.jpg' exists, use '/placeholder-game-cover.jpg'
            src={game.imageUrl || '/placeholder-game-cover.jpg'} // Updated placeholder
            alt={game.title}
            fill // Заменил layout="fill" objectFit="cover" на fill для Next.js 13+
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Примерные размеры для оптимизации
            className="object-cover transition-transform duration-500 group-hover:scale-110" // Эффект приближения при наведении на группу
            onError={(e) => { 
              // Ensure '/placeholder-image.jpg' exists in your /public folder
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; 
            }}
          />
          {/* Оверлей для цены или других акцентов */}
          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {/* <CurrencyDollarIcon className="h-4 w-4 inline mr-1" /> */}
            {game.price !== null && game.price !== undefined ? `$${game.price.toFixed(2)}` : 'N/A'}
          </div>
        </div>
      </Link>

      <div className="p-5 flex-grow flex flex-col justify-between"> {/* flex-grow для заполнения пространства */}
        <div>
          <Link href={`/games/${game.id}`} className="block">
            <h3 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-indigo-400 transition-colors duration-300 truncate" title={game.title}>
              {game.title}
            </h3>
          </Link>
          <div className="space-y-1 mb-4 text-sm text-slate-400">
            <p className="flex items-center">
              {/* <TagIcon className="h-4 w-4 mr-1.5 text-indigo-400" /> */}
              <span className="font-medium text-slate-300 mr-1">Жанр:</span> {game.genre || 'N/A'}
            </p>
            <p className="flex items-center">
              {/* <ComputerDesktopIcon className="h-4 w-4 mr-1.5 text-indigo-400" /> */}
              <span className="font-medium text-slate-300 mr-1">Платформа:</span> {game.platform || 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between items-center gap-2">
          <Link href={`/games/${game.id}`} className="flex-1">
            <Button variant="primary" className="w-full text-sm py-2">
              {/* <EyeIcon className="h-4 w-4 mr-1" /> */}
              Подробнее
            </Button>
          </Link>
          {/* Conditionally render delete button if user is admin, or handle in context/API */}
          <Button variant="danger" onClick={handleDelete} className="text-sm py-2 px-3" title="Удалить игру">
            {/* <TrashIcon className="h-4 w-4" /> */}
            <span className="sm:hidden">🗑️</span> {/* Иконка для маленьких экранов */}
            <span className="hidden sm:inline">Удалить</span> {/* Текст для больших */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;