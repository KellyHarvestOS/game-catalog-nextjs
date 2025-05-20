// app/(main)/games/[id]/edit/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GameForm from '@/components/GameForm';
import { Game } from '@/types';

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string; // 

  const { data: session, status } = useSession();
  const isLoadingSession = status === 'loading';
  const userRole = session?.user?.role as string | undefined;

 
  const [initialGameData, setInitialGameData] = useState<Game | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Защита страницы и загрузка данных игры для редактирования
  useEffect(() => {
    if (!isLoadingSession) {
      if (!session || userRole !== 'ADMIN') {
        router.push('/');
        return;
      }
    }

    if (gameId && session && userRole === 'ADMIN') {
      const fetchGameData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const response = await fetch(`/api/games/${gameId}`);
          if (!response.ok) {
            if (response.status === 404) throw new Error('Игра для редактирования не найдена');
            throw new Error('Не удалось загрузить данные игры');
          }
          const data: Game = await response.json();
          setInitialGameData(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchGameData();
    } else if (!isLoadingSession && (!session || userRole !== 'ADMIN')) {
      setIsLoadingData(false);
    }
  }, [gameId, session, isLoadingSession, userRole, router]);


  if (isLoadingSession || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl">Загрузка данных для редактирования...</p>
      </div>
    );
  }

  if (!session || userRole !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-red-500">Доступ запрещен.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Ошибка: {error}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Назад
        </button>
      </div>
    );
  }

    if (!initialGameData) { 
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Не удалось загрузить данные игры или игра не найдена.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Редактировать игру: {initialGameData.title}
      </h1>
      <GameForm
        isEditing={true}
        initialData={initialGameData}
        gameId={gameId}
      />
    </div>
  );
}