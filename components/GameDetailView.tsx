// components/GameDetailView.tsx
'use client';
import { Game } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Button from "./ui/Button";

interface GameDetailViewProps {
    game: Game | null;
    isLoading: boolean;
    error: string | null;
}

const GameDetailView: React.FC<GameDetailViewProps> = ({ game, isLoading, error }) => {
    if (isLoading) return <p className="text-center text-xl">Загрузка данных об игре...</p>;
    if (error) return <p className="text-center text-red-500 text-xl">Ошибка: {error}</p>;
    if (!game) return <p className="text-center text-xl text-gray-400">Игра не найдена.</p>;

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
            <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3 relative min-h-[300px] md:min-h-0">
                    <Image
                        src={game.imageUrl || '/placeholder-image.jpg'}
                        alt={game.title}
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                    />
                </div>
                <div className="p-8 md:w-2/3">
                    <h1 className="text-4xl font-bold text-indigo-400 mb-2">{game.title}</h1>
                    <p className="text-green-400 font-semibold text-2xl mb-4">${game.price.toFixed(2)}</p>
                    
                    <div className="space-y-3 text-gray-300 mb-6">
                        <p><span className="font-semibold text-indigo-300">Жанр:</span> {game.genre}</p>
                        <p><span className="font-semibold text-indigo-300">Платформы:</span> {game.platform}</p>
                        <p><span className="font-semibold text-indigo-300">Разработчик:</span> {game.developer}</p>
                        <p><span className="font-semibold text-indigo-300">Дата выхода:</span> {new Date(game.releaseDate).toLocaleDateString()}</p>
                    </div>

                    <h2 className="text-xl font-semibold text-indigo-300 mb-2">Описание:</h2>
                    <p className="text-gray-400 leading-relaxed mb-6">{game.description}</p>

                    <Link href="/games">
                        <Button variant="secondary">Назад к каталогу</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default GameDetailView;