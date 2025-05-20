// app/(main)/games/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game as GameType, UserRole } from '@/types';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

const ScreenshotGallery = ({ urls }: { urls: string[] }) => {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-slate-200 mb-4">Скриншоты</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {urls.map((url, index) => (
          <div key={index} className="aspect-video relative rounded-lg overflow-hidden shadow-lg group">
            <Image
              src={url}
              alt={`Скриншот ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-110 transition-transform duration-300"
            />
            {/* Можно добавить лайтбокс или открытие в новой вкладке */}
            <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`Открыть скриншот ${index + 1}`}></a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: session, status: sessionStatus } = useSession();
  const isLoadingSession = sessionStatus === 'loading';
  const userRole = session?.user?.role as UserRole | undefined;

  const [game, setGame] = useState<GameType | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGameData = async () => {
    if (!id) {
      setError("ID игры не предоставлен.");
      setIsLoadingGame(false);
      return;
    }
    setIsLoadingGame(true);
    setError(null);
    try {
      const response = await fetch(`/api/games/${id}`);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          const textError = await response.text().catch(() => "Не удалось прочитать тело ответа с ошибкой.");
          errorMessage = `Ошибка сервера: ${response.status}. ${textError.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        setGame(data);
      } else {
        const textData = await response.text();
        console.warn("Ожидался JSON от /api/games/[id], но получен:", contentType, "Данные:", textData.substring(0,200));
        throw new Error(`Неожиданный формат ответа от сервера: ${contentType}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingGame(false);
    }
  };

  useEffect(() => {
    loadGameData();
  }, [id]); // Зависимость только от id

  const handleRetryFetch = () => {
    loadGameData();
  };

  const handleBuyClick = () => {
    // Логика покупки, например, редирект на страницу оплаты или добавление в корзину
    // router.push(`/checkout/${game?.id}`);
    alert(`Симуляция покупки игры: ${game?.title}`);
  };

  const handleDeleteGame = async () => {
    if (!game || userRole !== 'ADMIN' || game.isStatic) return; // Не удаляем статические игры
    if (confirm(`Вы уверены, что хотите удалить игру "${game.title}"?`)) {
      try {
        const response = await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Не удалось удалить игру.' }));
             throw new Error(errorData.message || 'Ошибка при удалении игры');
        }
        alert('Игра успешно удалена!');
        router.push('/games');
        router.refresh(); // Может помочь обновить список на предыдущей странице
      } catch (err: any) {
        // setError(err.message); // Можно установить локальную ошибку, если нужно
        alert(`Ошибка при удалении: ${err.message}`);
      }
    }
  };

  const isLoading = isLoadingGame || isLoadingSession;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-slate-900">
        <div className="text-center p-10 text-slate-300 text-xl">Загрузка данных об игре...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-slate-900">
        <div className="text-center p-10">
            <div className="text-5xl mb-4 animate-pulse">😔</div>
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Ошибка загрузки</h2>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <Button onClick={handleRetryFetch} variant="secondary">
              Попробовать снова
            </Button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-slate-900">
        <div className="text-center p-10 text-slate-300 text-xl">Игра не найдена.</div>
      </div>
    );
  }

  const screenshotUrlsToDisplay: string[] = game.screenshots || [];

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5 lg:w-1/3 relative w-full aspect-w-3 aspect-h-4 md:aspect-w-4 md:aspect-h-5 xl:aspect-w-3 xl:aspect-h-4">
              {game.imageUrl ? (
                <Image
                  src={game.imageUrl}
                  alt={`Обложка игры ${game.title}`}
                  layout="fill"
                  objectFit="cover"
                  priority
                  className="rounded-tl-xl md:rounded-l-xl md:rounded-tr-none"
                />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center rounded-tl-xl md:rounded-l-xl md:rounded-tr-none">
                  <span className="text-slate-500 text-lg">Нет обложки</span>
                </div>
              )}
            </div>

            <div className="md:w-3/5 lg:w-2/3 p-6 md:p-8 lg:p-10 flex flex-col">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-400 mb-2 leading-tight">
                {game.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-4">
                {game.developer && <span>Разработчик: <span className="text-slate-300">{game.developer}</span></span>}
                {game.publisher && <span>Издатель: <span className="text-slate-300">{game.publisher}</span></span>}
              </div>
              {game.releaseDate && (
                <p className="text-sm text-slate-400 mb-1">
                  Дата выхода: <span className="text-slate-300">{new Date(game.releaseDate).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              )}
              {game.platform && (
                <p className="text-sm text-slate-400 mb-4">
                  Платформы: <span className="text-slate-300">{game.platform}</span>
                </p>
              )}
              {game.genre && (
                <div className="mb-6">
                  <span className="px-3 py-1 text-xs font-semibold text-indigo-200 bg-indigo-700/50 rounded-full">
                    {game.genre}
                  </span>
                </div>
              )}

              <div className="mt-auto"> {/* Прижимает кнопки и цену к низу */}
                {game.price !== null && game.price !== undefined && (
                  <p className="text-3xl lg:text-4xl font-bold text-green-400 mb-6">
                    {game.price === 0 ? 'Бесплатно' : `${game.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                  </p>
                )}

                <div className="space-y-3">
                  {session?.user && (
                    <Button onClick={handleBuyClick} variant="success" size="lg" className="w-full sm:w-auto py-3 text-base">
                      Купить игру
                    </Button>
                  )}
                  {!session?.user && (
                    <p className="text-slate-300 text-center sm:text-left">
                      <Link href="/login" className="text-indigo-400 hover:underline font-semibold">Войдите</Link> или <Link href="/register" className="text-indigo-400 hover:underline font-semibold">зарегистрируйтесь</Link>, чтобы купить.
                    </p>
                  )}

                  {userRole === 'ADMIN' && !game.isStatic && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50 mt-4">
                      <Link href={`/games/${game.id}/edit`} className="w-full sm:w-auto">
                        <Button variant="warning" className="w-full">Редактировать</Button>
                      </Link>
                      <Button variant="danger" onClick={handleDeleteGame} className="w-full sm:w-auto">
                        Удалить игру
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(game.description || screenshotUrlsToDisplay.length > 0) && (
            <div className="p-6 md:p-8 lg:p-10 border-t border-slate-700/50">
              {game.description && (
                <>
                  <h2 className="text-2xl font-semibold text-slate-200 mb-4">Описание</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-8">
                    {game.description}
                  </p>
                </>
              )}
              <ScreenshotGallery urls={screenshotUrlsToDisplay} />
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
            <Link href="/games">
                <Button variant="ghost" className="text-indigo-400 hover:bg-slate-700">
                    ← Вернуться в каталог
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}