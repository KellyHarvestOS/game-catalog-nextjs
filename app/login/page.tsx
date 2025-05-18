// app/login/page.tsx
'use client';

import { useState, ChangeEvent } from 'react'; // Добавлен ChangeEvent для типизации
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <--- ДОБАВЛЕН ИМПОРТ
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Вход в GameHub
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email" // <--- ПРЕДПОЛАГАЕМЫЙ ФИКС
              autoComplete="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1 block w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              label="Пароль" // <--- ПРЕДПОЛАГАЕМЫЙ ФИКС
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