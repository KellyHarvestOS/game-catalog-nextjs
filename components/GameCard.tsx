// components/GameCard.tsx
'use client';
import Link from 'next/link';
import { Game } from '@/types';
import Button from './ui/Button';
import { useGames } from '@/contexts/GameContext'; // Для кнопки удаления
import Image from 'next/image'; // Для оптимизации изображений

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { deleteGame } = useGames();

  const handleDelete = async () => {
    if (window.confirm(`Вы уверены, что хотите удалить "${game.title}"?`)) {
      await deleteGame(game.id);
      // UI обновится через контекст
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-105 duration-300 ease-in-out">
      <div className="relative w-full h-48">
        <Image
          src={game.imageUrl || '/placeholder-image.jpg'} // Добавьте placeholder-image.jpg в public
          alt={game.title}
          layout="fill"
          objectFit="cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-2 text-indigo-400">{game.title}</h3>
        <p className="text-gray-400 text-sm mb-1">Жанр: {game.genre}</p>
        <p className="text-gray-400 text-sm mb-1">Платформа: {game.platform}</p>
        <p className="text-green-400 font-bold text-lg mb-4">${game.price.toFixed(2)}</p>
        <div className="flex justify-between items-center">
          <Link href={`/games/${game.id}`}>
            <Button variant="primary" className="text-sm px-3 py-1">Подробнее</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} className="text-sm px-3 py-1">
            Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;