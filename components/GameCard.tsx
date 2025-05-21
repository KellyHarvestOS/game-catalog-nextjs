// components/GameCard.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Game } from '@/types';
import Button from './ui/Button';
import { useGames } from '@/contexts/GameContext';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { deleteGame, state: gameContextState } = useGames();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Вы уверены, что хотите удалить "${game.title}"? Эту операцию нельзя будет отменить.`)) {
      try {
        await deleteGame(game.id);
      } catch (error) {
        console.error("Ошибка при удалении игры из GameCard:", error);
        alert(`Не удалось удалить игру: ${(error as Error).message}`);
      }
    }
  };

  const imageSrc = game.coverImageUrl || game.imageUrl || '/placeholder-game-cover.jpg';
  const errorImageSrc = '/placeholder-image-error.jpg';

  return (
    <div className="group bg-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-indigo-500/40 flex flex-col h-full">
      <Link href={`/games/${game.id}`} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-t-xl">
        <div className="relative w-full aspect-[3/4] sm:aspect-video md:aspect-[4/3] lg:aspect-[3/4] xl:h-72">
          <Image
            src={imageSrc}
            alt={game.title || 'Обложка игры'}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1280px) 30vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            onError={(e) => {
              (e.target as HTMLImageElement).srcset = errorImageSrc;
              (e.target as HTMLImageElement).src = errorImageSrc;
            }}
          />
          {(game.price !== null && game.price !== undefined) && (
            <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shadow-lg">
              {game.price === 0 ? 'Бесплатно' : `$${game.price.toFixed(2)}`}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex-grow flex flex-col">
        <div>
          <Link href={`/games/${game.id}`} className="focus:outline-none">
            <h3
              className="text-lg sm:text-xl font-bold mb-1 text-slate-100 group-hover:text-indigo-300 transition-colors duration-200 truncate"
              title={game.title}
            >
              {game.title || 'Без названия'}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mb-2 h-4">
            {game.developer || <> </>}
          </p>
          <div className="space-y-1 mb-3 text-sm text-slate-400">
            {game.genre && (
              <p className="flex items-center text-xs">
                <span className="font-medium text-slate-300 mr-1">Жанр:</span>
                <span className="truncate" title={game.genre}>{game.genre}</span>
              </p>
            )}
            {game.platform && (
              <p className="flex items-center text-xs">
                <span className="font-medium text-slate-300 mr-1">Платформы:</span>
                <span className="truncate" title={game.platform}>{game.platform}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-700 flex items-center gap-2 sm:gap-3">
          <Link href={`/games/${game.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full py-2">
              Подробнее
            </Button>
          </Link>
       
        </div>
      </div>
    </div>
  );
};

export default GameCard;