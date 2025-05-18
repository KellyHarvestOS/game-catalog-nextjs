// app/(main)/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Регистрация
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле для имени */}
          <Input
            label="Имя (опционально)" // <--- ПЕРЕДАЕМ LABEL
            name="name"
            type="text"
            id="name" // Передаем id, так как Input его использует для htmlFor
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            // className не нужен здесь, если стили уже в компоненте Input
          />

          {/* Поле для Email */}
          <Input
            label="Email" // <--- ПЕРЕДАЕМ LABEL
            name="email"
            type="email"
            id="email" // Передаем id
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Поле для Пароля */}
          <Input
            label="Пароль" // <--- ПЕРЕДАЕМ LABEL
            name="password"
            type="password"
            id="password" // Передаем id
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-100 border border-red-400 p-3 rounded">
              {error}
            </p>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}