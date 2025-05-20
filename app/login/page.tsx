// app/login/page.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AnimatedBackground from '@/components/ui/AnimatedBackground'; // <--- ДОБАВЛЕНО

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
        router.push(callbackUrl || '/');
      } else {
        setError('Произошла неизвестная ошибка входа.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Произошла ошибка при попытке входа.');
      setIsLoading(false);
    }
  };

  return (
    // Обертка для позиционирования фона и контента
    <div className="relative flex flex-col items-center justify-center min-h-screen py-2 bg-slate-900 overflow-hidden px-4">
      <AnimatedBackground /> {/* <--- АНИМИРОВАННЫЙ ФОН */}
      
      {/* Основной контейнер контента страницы */}
      <div className="relative z-10 p-8 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md"> {/* Добавил прозрачность и блюр */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Вход в GameHub
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* Label убран, т.к. он есть в Input */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 block w-full" // className можно оставить для Input если он не задает w-full сам
              placeholder="you@example.com"
            />
          </div>

          <div>
            {/* Label убран */}
            <Input
              id="password"
              name="password"
              type="password"
              label="Пароль" 
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="mt-1 block w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">
              {error === 'CredentialsSignin' ? 'Неверный email или пароль.' : error}
            </p>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-3"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Еще нет аккаунта?{' '}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}