'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game, UserRole } from '@/types';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: session, status: sessionStatus } = useSession();
  const isLoadingSession = sessionStatus === 'loading';
  const userRole = session?.user?.role as UserRole | undefined;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchGame = async () => {
        setIsLoadingGame(true);
        setError(null);
        try {
          const response = await fetch(`/api/games/${id}`);
          if (!response.ok) {
            if (response.status === 404) throw new Error('Игра не найдена');
            throw new Error('Не удалось загрузить данные об игре');
          }
          const data = await response.json();
          setGame(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsLoadingGame(false);
        }
      };
      fetchGame();
    }
  }, [id]);

  const handleBuyClick = () => {
    // router.push(`/checkout/${game?.id}`);
  };

  const handleDeleteGame = async () => {
    if (!game || userRole !== 'ADMIN') return;
    if (confirm(`Вы уверены, что хотите удалить игру "${game.title}"?`)) {
      try {
        const response = await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка при удалении игры');
        router.push('/games');
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const isLoading = isLoadingGame || isLoadingSession;

  if (isLoading) {
    return <div className="text-center p-10">Загрузка данных об игре...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Ошибка: {error}</div>;
  }

  if (!game) {
    return <div className="text-center p-10">Игра не найдена.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{game.title}</h1>
      <p className="text-lg mb-2">Жанр: {game.genre}</p>
      <p className="text-lg mb-2">Платформа: {game.platform}</p>
      <p className="text-md mb-6">{game.description}</p>

      <div className="mt-6 space-y-4">
        {session?.user ? (
          <>
            <Button onClick={handleBuyClick} variant="success" size="lg">
              Купить игру ({game.price} руб.)
            </Button>

            {userRole === 'ADMIN' && (
              <div className="mt-4 space-x-2">
                <Link href={`/games/${game.id}/edit`}>
                  <Button variant="warning">Редактировать игру</Button>
                </Link>
                <Button variant="danger" onClick={handleDeleteGame}>
                  Удалить игру
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-300">
            Чтобы купить игру или получить доступ к дополнительным действиям, пожалуйста,{' '}
            <Link href="/login" className="text-indigo-400 hover:underline">
              войдите
            </Link>{' '}
            или{' '}
            <Link href="/register" className="text-indigo-400 hover:underline">
              зарегистрируйтесь
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}