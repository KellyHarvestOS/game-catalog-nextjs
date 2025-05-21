// app/(main)/games/[id]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game as GameTypeFromShared, UserRole, ScreenshotType as LocalScreenshotType } from '@/types';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

interface GamePageStateType extends GameTypeFromShared {
  isOwned?: boolean;
  screenshots?: LocalScreenshotType[];
}

const ScreenshotGallery = ({ urls }: { urls: LocalScreenshotType[] | undefined }) => {
  if (!urls || urls.length === 0) return null;
  return (
    <section className="mt-8 sm:mt-10">
      <h3 className="text-xl sm:text-2xl font-semibold text-indigo-300 mb-4">Скриншоты</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {urls.map((screenshot, index) => (
          <a
            key={screenshot.id || `ss-${index}`}
            href={screenshot.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-video relative rounded-lg overflow-hidden shadow-lg group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            <Image
              src={screenshot.url}
              alt={`Скриншот ${index + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image-error.jpg';}}
            />
          </a>
        ))}
      </div>
    </section>
  );
};

const DetailItem: React.FC<{ label: string, value?: string | number | null, IconComponent?: React.ElementType }> = ({ label, value, IconComponent }) => (
    <div className="flex items-start py-3 border-b border-slate-700 last:border-b-0">
        {IconComponent && <IconComponent className="h-5 w-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />}
        <span className="font-medium text-slate-300 w-1/3 md:w-1/4 capitalize">{label}:</span>
        <span className="text-slate-400 w-2/3 md:w-3/4">{value || 'N/A'}</span>
    </div>
);


export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: session, status: sessionStatus } = useSession();
  const isLoadingSession = sessionStatus === 'loading';
  const userRole = session?.user?.role as UserRole | undefined;

  const [game, setGame] = useState<GamePageStateType | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  const loadGameData = useCallback(async () => {
    if (!id) {
      setError("ID игры не предоставлен.");
      setIsLoadingGame(false);
      return;
    }
    setIsLoadingGame(true);
    setError(null);
    setPurchaseMessage(null);
    try {
      const response = await fetch(`/api/games/${id}`);
      if (!response.ok) {
        let errorMessage = `Ошибка сервера: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) { /* ignore */ }
        throw new Error(errorMessage);
      }
      const data: GamePageStateType = await response.json();
      console.log("ДАННЫЕ ИГРЫ НА СТРАНИЦЕ ДЕТАЛЕЙ (page.tsx):", data);
      setGame(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingGame(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) { // Загружаем данные только если id доступен
        loadGameData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sessionStatus, loadGameData]); // Добавил loadGameData в зависимости

  const handleRetryFetch = () => {
    loadGameData();
  };

  const handlePurchaseGame = async () => {
    if (!game || !session?.user) {
      setPurchaseMessage('Необходимо авторизоваться для покупки.');
      return;
    }
    if (game.isOwned) {
      setPurchaseMessage('Эта игра уже в вашей библиотеке.');
      return;
    }
    setIsProcessingPurchase(true);
    setPurchaseMessage(null); setError(null);
    if (game.price && game.price > 0) {
      const confirmPayment = confirm(
        `Игра "${game.title}" стоит ${game.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}. Продолжить симуляцию оплаты?`
      );
      if (!confirmPayment) {
        setPurchaseMessage('Оплата отменена.');
        setIsProcessingPurchase(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    try {
      const response = await fetch(`/api/games/${game.id}/purchase`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Не удалось совершить покупку.');
      setPurchaseMessage(data.message);
      setGame(prevGame => prevGame ? { ...prevGame, isOwned: true } : null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!game || userRole !== 'ADMIN' || game.isStatic) return;
    if (confirm(`Вы уверены, что хотите удалить игру "${game.title}"? Эту операцию нельзя будет отменить.`)) {
      try {
        const response = await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Не удалось удалить игру.' }));
             throw new Error(errorData.message || 'Ошибка при удалении игры');
        }
        alert('Игра успешно удалена!');
        router.push('/games');
        router.refresh();
      } catch (err: any) { alert(`Ошибка при удалении: ${err.message}`); }
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

  if (error && !purchaseMessage) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-slate-900">
        <div className="text-center p-10">
            <div className="text-5xl mb-4 animate-pulse">😔</div>
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Ошибка загрузки</h2>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <Button onClick={handleRetryFetch} variant="secondary">Попробовать снова</Button>
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

  const imageDisplaySrc = game.coverImageUrl || (game as any).imageUrl || '/placeholder-game-detail.jpg';
  const errorDisplaySrc = '/placeholder-image-error.jpg';

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 sm:mb-8">
            <Link href="/games" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors group">
                <span className="text-xl mr-2 transition-transform group-hover:-translate-x-1">‹</span>
                <span className="text-sm font-medium">Назад к каталогу</span>
            </Link>
        </div>

        <article className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5 lg:w-1/3 relative w-full aspect-[3/4] sm:aspect-[16/9] md:aspect-auto md:min-h-[500px] lg:min-h-0 bg-slate-700 md:rounded-l-xl md:rounded-tr-none">
              {imageDisplaySrc && imageDisplaySrc !== '/placeholder-game-detail.jpg' ? (
                <Image
                  src={imageDisplaySrc}
                  alt={`Обложка игры ${game.title || 'Без названия'}`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 33vw"
                  className="object-cover md:rounded-l-xl md:rounded-tr-none"
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).srcset = errorDisplaySrc;
                    (e.target as HTMLImageElement).src = errorDisplaySrc;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-500 text-lg">Нет обложки</span>
                </div>
              )}
            </div>

            <div className="md:w-3/5 lg:w-2/3 p-6 sm:p-8 lg:p-10 flex flex-col">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-2 leading-tight">
                {game.title || 'Без названия'}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-6 sm:mb-8">
                {typeof game.price === 'number' ? (game.price === 0 ? 'Бесплатно' : `$${game.price.toFixed(2)}`) : 'Цена не указана'}
              </p>

              {purchaseMessage && <p className={`mb-4 p-3 rounded-md text-center text-sm ${purchaseMessage.toLowerCase().includes('успешно') || purchaseMessage.toLowerCase().includes('добавлена') ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{purchaseMessage}</p>}
              {error && !purchaseMessage && <p className="mb-4 p-3 rounded-md text-center text-sm bg-red-900/50 text-red-300">{error}</p>}

              <div className="space-y-3 mb-6 sm:mb-8">
                  {session?.user && (
                    game.isOwned ? (
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto py-3 text-base" disabled>
                        В вашей библиотеке
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePurchaseGame}
                        variant="success"
                        size="lg"
                        className="w-full sm:w-auto py-3 text-base"
                        isLoading={isProcessingPurchase}
                        disabled={isProcessingPurchase || isLoadingGame}
                      >
                        {isProcessingPurchase ? 'Обработка...' : (game.price === 0 ? 'Получить бесплатно' : 'Купить игру')}
                      </Button>
                    )
                  )}
                  {!session?.user && (
                    <p className="text-slate-300 text-center sm:text-left">
                      <Link href="/login" className="text-indigo-400 hover:underline font-semibold">Войдите</Link> или <Link href="/register" className="text-indigo-400 hover:underline font-semibold">зарегистрируйтесь</Link>, чтобы купить.
                    </p>
                  )}
              </div>

              <section className="mb-6 sm:mb-8">
                <h2 className="sr-only">Основная информация</h2>
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <DetailItem label="Жанр" value={game.genre} />
                    <DetailItem label="Платформы" value={game.platform} />
                    <DetailItem label="Разработчик" value={game.developer} />
                    <DetailItem label="Издатель" value={game.publisher} />
                    <DetailItem
                        label="Дата выхода"
                        value={game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined}
                    />
                </div>
              </section>

              {game.description && (
                <section className="mb-6 sm:mb-8">
                  <h2 className="text-xl font-semibold text-indigo-300 mb-3">Описание:</h2>
                  <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed">
                    <p>{game.description}</p>
                  </div>
                </section>
              )}

              {game.screenshots && game.screenshots.length > 0 && (
                <ScreenshotGallery urls={game.screenshots} />
              )}

              {userRole === 'ADMIN' && !game.isStatic && (
                <div className="mt-auto pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                  <Link href={`/games/${game.id}/edit`} className="w-full sm:w-auto">
                    <Button variant="warning" className="w-full">Редактировать</Button>
                  </Link>
                  <Button variant="danger" onClick={handleDeleteGame} className="w-full sm:w-auto">
                    Удалить игру
                  </Button>
                </div>
              )}
            </div> {/* Закрывающий div для md:w-3/5 lg:w-2/3 */}
          </div> {/* Закрывающий div для md:flex */}
        </article> {/* Закрывающий тег article */}
      </div> {/* Закрывающий div для container */}
    </div> // Закрывающий div для bg-slate-900
  );
}