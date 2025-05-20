// app/(main)/games/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Game } from '@/types';
import GameDetailView from '@/components/GameDetailView';

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchGame = async () => {
        setIsLoading(true);
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
          setIsLoading(false);
        }
      };
      fetchGame();
    }
  }, [id]);

  return <GameDetailView game={game} isLoading={isLoading} error={error} />;
}