// components/GameDetailView.tsx
'use client';
import { Game } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Button from "./ui/Button";
// Иконки для примера (можно использовать heroicons или другие)
// import { TagIcon, ComputerDesktopIcon, UserGroupIcon, CalendarDaysIcon, ArrowLeftIcon, ShoppingCartIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface GameDetailViewProps {
    game: Game | null;
    isLoading: boolean;
    error: string | null;
}

// Вспомогательный компонент для отображения строки деталей
const DetailItem: React.FC<{ label: string, value: string | number, IconComponent?: React.ElementType }> = ({ label, value, IconComponent }) => (
    <div className="flex items-start py-3 border-b border-slate-700 last:border-b-0">
        {IconComponent && <IconComponent className="h-5 w-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />}
        <span className="font-medium text-slate-300 w-1/3 md:w-1/4 capitalize">{label}:</span> {/* capitalize для метки */}
        <span className="text-slate-400 w-2/3 md:w-3/4">{value}</span>
    </div>
);

const GameDetailView: React.FC<GameDetailViewProps> = ({ game, isLoading, error }) => {
    // Улучшенные состояния загрузки, ошибки и отсутствия игры
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-slate-300">
                {/* Можно добавить спиннер */}
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
                {/* <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" /> */}
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
                {/* <InformationCircleIcon className="h-16 w-16 text-slate-500 mb-4" /> */}
                <div className="text-5xl mb-4">❓</div>
                <p className="text-2xl text-slate-400 mb-6">Игра не найдена.</p>
                <Link href="/games">
                    <Button variant="primary">Посмотреть другие игры</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Кнопка "Назад" стала заметнее */}
            <div className="mb-6 sm:mb-8">
                <Link href="/games" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors group">
                    {/* <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" /> */}
                    <span className="text-xl mr-2 transition-transform group-hover:-translate-x-1">‹</span>
                    <span className="text-sm font-medium">Назад к каталогу</span>
                </Link>
            </div>

            <article className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden"> {/* Используем article для семантики */}
                <div className="grid grid-cols-1 lg:grid-cols-5"> {/* Изменено на lg:grid-cols-5 для большего изображения */}
                    {/* Изображение игры */}
                    <div className="lg:col-span-2 relative min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-full">
                        <Image
                            src={game.imageUrl || '/placeholder-image.jpg'}
                            alt={`Обложка игры ${game.title}`}
                            fill
                            sizes="(max-width: 1023px) 100vw, 40vw" // Изображение занимает 2/5 на lg экранах
                            className="object-cover"
                            priority // Загружать изображение приоритетно
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                        />
                    </div>

                    {/* Информация об игре */}
                    <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-2 leading-tight">
                            {game.title}
                        </h1>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-6 sm:mb-8">
                            {/* <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7 inline mr-2 opacity-80" /> */}
                            ${game.price.toFixed(2)}
                        </p>
                        
                        <section className="mb-6 sm:mb-8"> {/* Семантический тег для группы деталей */}
                            <h2 className="sr-only">Основная информация</h2> {/* Скрытый заголовок для доступности */}
                            {/* Используем DetailItem для структурированного вывода */}
                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                <DetailItem label="Жанр" value={game.genre} /> {/* IconComponent={TagIcon} */}
                                <DetailItem label="Платформы" value={game.platform} /> {/* IconComponent={ComputerDesktopIcon} */}
                                <DetailItem label="Разработчик" value={game.developer} /> {/* IconComponent={UserGroupIcon} */}
                                <DetailItem 
                                    label="Дата выхода" 
                                    value={new Date(game.releaseDate).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })} 
                                /> {/* IconComponent={CalendarDaysIcon} */}
                            </div>
                        </section>

                        <section className="mb-6 sm:mb-8">
                            <h2 className="text-xl font-semibold text-indigo-300 mb-3">Описание:</h2>
                            {/* Использование @tailwindcss/typography для стилизации HTML из описания */}
                            <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed selection:bg-indigo-500 selection:text-white">
                                {game.description ? (
                                    <p>{game.description}</p> // Оберните в <p> если описание просто текст
                                    // Если описание может содержать HTML: <div dangerouslySetInnerHTML={{ __html: game.description }} />
                                    // Но будьте осторожны с XSS, если HTML не санитайзится.
                                ) : (
                                    <p className="italic text-slate-500">Описание для этой игры пока отсутствует.</p>
                                )}
                            </div>
                        </section>
                        
                     
                    </div>
                </div>
            </article>
        </div>
    );
}

export default GameDetailView;