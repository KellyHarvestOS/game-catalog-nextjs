// app/(main)/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6 text-indigo-400">Добро пожаловать в GameHub!</h1>
      <p className="text-lg mb-8 text-gray-300">
        Ваш лучший источник для поиска и добавления информации об играх.
      </p>
      <div className="space-x-4">
        <Link href="/games">
          <Button variant="primary" className="px-6 py-3 text-lg">
            Смотреть каталог
          </Button>
        </Link>
        <Link href="/games/add">
          <Button variant="secondary" className="px-6 py-3 text-lg">
            Добавить игру
          </Button>
        </Link>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Особенности:</h2>
        <ul className="list-disc list-inside text-left max-w-md mx-auto text-gray-400 space-y-2">
          <li>Просмотр каталога игр</li>
          <li>Добавление новых игр</li>
          <li>Удаление игр из каталога</li>
          <li>Детальная информация о каждой игре</li>
          <li>Адаптивный дизайн</li>
        </ul>
      </div>
    </div>
  );
}