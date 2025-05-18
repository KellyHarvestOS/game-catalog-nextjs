'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import GameForm from '@/components/GameForm'; // Предполагается, что у вас есть такой компонент
// import { UserRole } from '@/types'; // Если UserRole определен

export default function AddGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoadingSession = status === 'loading';
  // Типизация будет лучше с next-auth.d.ts
  const userRole = session?.user?.role as string | undefined; // или ваш UserRole тип

  useEffect(() => {
    if (!isLoadingSession) {
      if (!session || userRole !== 'ADMIN') {
        // Если сессии нет или пользователь не админ, перенаправляем
        // Можно на главную или на страницу логина с сообщением
        alert('Доступ запрещен. Только администраторы могут добавлять игры.');
        router.push('/'); // или router.push('/login');
      }
    }
  }, [session, status, isLoadingSession, userRole, router]);

  if (isLoadingSession || !session || userRole !== 'ADMIN') {
    // Можно показать индикатор загрузки или сообщение о проверке прав
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl">Проверка прав доступа...</p>
      </div>
    );
  }

  // Если пользователь - админ, показываем форму
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Добавить новую игру</h1>
      <GameForm /> {/* Ваш компонент формы для добавления игры */}
    </div>
  );
}