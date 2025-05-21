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

const DetailItem: React.FC<{ label: string, value: string | number | null | undefined, IconComponent?: React.ElementType }> = ({ label, value, IconComponent }) => (
    <div className="flex items-start py-3 border-b border-slate-700 last:border-b-0">
        {IconComponent && <IconComponent className="h-5 w-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />}
        <span className="font-medium text-slate-300 w-1/3 md:w-1/4 capitalize">{label}:</span>
        <span className="text-slate-400 w-2/3 md:w-3/4">{value || 'N/A'}</span>
    </div>
);

const GameDetailView: React.FC<GameDetailViewProps> = ({ game, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-slate-300">
                <svg className="animate-spin h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl">Загрузка данных об игре...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-2xl text-red-400 mb-2">Произошла ошибка</p>
                <p className="text-slate-400 mb-6 max-w-md">{error}</p>
                <Link href="/games">
                    <Button variant="primary">Вернуться к каталогу</Button>
                </Link>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4">
                <div className="text-5xl mb-4">❓</div>
                <p className="text-2xl text-slate-400 mb-6">Игра не найдена.</p>
                <Link href="/games">
                    <Button variant="primary">Посмотреть другие игры</Button>
                </Link>
            </div>
        );
    }

    const imageDisplaySrc = game.coverImageUrl || game.imageUrl || '/placeholder-game-detail.jpg';
    const errorDisplaySrc = '/placeholder-image-error.jpg';

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-6 sm:mb-8">
                <Link href="/games" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors group">
                    <span className="text-xl mr-2 transition-transform group-hover:-translate-x-1">‹</span>
                    <span className="text-sm font-medium">Назад к каталогу</span>
                </Link>
            </div>

            <article className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                    <div className="lg:col-span-2 relative min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-full bg-slate-700">
                        <Image
                            src={imageDisplaySrc}
                            alt={`Обложка игры ${game.title || 'Без названия'}`}
                            fill
                            sizes="(max-width: 1023px) 100vw, 40vw"
                            className="object-cover"
                            priority
                            onError={(e) => { (e.target as HTMLImageElement).src = errorDisplaySrc; }}
                        />
                    </div>

                    <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-2 leading-tight">
                            {game.title || 'Без названия'}
                        </h1>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-6 sm:mb-8">
                            {typeof game.price === 'number' ? (game.price === 0 ? 'Бесплатно' : `$${game.price.toFixed(2)}`) : 'Цена не указана'}
                        </p>
                        
                        <section className="mb-6 sm:mb-8">
                            <h2 className="sr-only">Основная информация</h2>
                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                <DetailItem label="Жанр" value={game.genre} />
                                <DetailItem label="Платформы" value={game.platform} />
                                <DetailItem label="Разработчик" value={game.developer} />
                                <DetailItem 
                                    label="Дата выхода" 
                                    value={game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined}
                                />
                                <DetailItem label="Издатель" value={game.publisher} />
                            </div>
                        </section>

                        <section className="mb-6 sm:mb-8">
                            <h2 className="text-xl font-semibold text-indigo-300 mb-3">Описание:</h2>
                            <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed selection:bg-indigo-500 selection:text-white">
                                {game.description ? (
                                    <p>{game.description}</p>
                                ) : (
                                    <p className="italic text-slate-500">Описание для этой игры пока отсутствует.</p>
                                )}
                            </div>
                        </section>
                        
                        {game.screenshots && game.screenshots.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-indigo-300 mb-3">Скриншоты:</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {game.screenshots.map(ss => (
                                        <div key={ss.id} className="aspect-video relative rounded-lg overflow-hidden shadow-md">
                                            <Image src={ss.url} alt={`Скриншот ${game.title || 'игры'}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
}

export default GameDetailView;