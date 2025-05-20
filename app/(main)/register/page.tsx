// app/(main)/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AnimatedBackground from '@/components/ui/AnimatedBackground'; // <--- ДОБАВЛЕНО

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
    // Обертка для позиционирования фона и контента
    <div className="relative flex flex-col items-center justify-center min-h-screen py-2 bg-slate-900 overflow-hidden px-4">
      <AnimatedBackground /> {/* <--- АНИМИРОВАННЫЙ ФОН */}

      {/* Основной контейнер контента страницы */}
      <div className="relative z-10 p-8 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md"> {/* Добавил прозрачность и блюр */}
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Регистрация
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Имя" // Убрал (опционально), если оно не опционально для API
            name="name"
            type="text"
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required // Если имя обязательно
          />
          <Input
            label="Email"
            name="email"
            type="email"
            id="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Пароль"
            name="password"
            type="password"
            id="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center"> {/* Стили ошибки как в LoginPage */}
              {error}
            </p>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-3" // Стили кнопки как в LoginPage
              disabled={isLoading}
              isLoading={isLoading} // Добавил isLoading проп для Button
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