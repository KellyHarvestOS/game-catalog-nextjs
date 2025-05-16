// components/GameForm.tsx
'use client';
import React, { useState, FormEvent } from 'react';
import { Game } from '@/types';
import Input from './ui/Input';
import Button from './ui/Button';
import { useRouter } from 'next/navigation'; // для редиректа
import { useGames } from '@/contexts/GameContext'; // для добавления игры

interface GameFormProps {
  initialData?: Game; // Для редактирования (если понадобится)
  onSubmitSuccess?: () => void;
}

const GameForm: React.FC<GameFormProps> = ({ initialData, onSubmitSuccess }) => {
  const router = useRouter();
  const { addGame, state } = useGames(); // Используем addGame из контекста
  const [formData, setFormData] = useState<Omit<Game, 'id'>>({
    title: initialData?.title || '',
    genre: initialData?.genre || '',
    platform: initialData?.platform || '',
    releaseDate: initialData?.releaseDate || '',
    developer: initialData?.developer || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Простая валидация
    if (!formData.title || !formData.genre || !formData.platform || !formData.developer || !formData.releaseDate || !formData.description || formData.price <= 0) {
      setError("Пожалуйста, заполните все обязательные поля и укажите корректную цену.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      await addGame(formData); // Вызываем addGame из контекста
      setFormData({ title: '', genre: '', platform: '', releaseDate: '', developer: '', description: '', imageUrl: '', price: 0}); // Очистка формы
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push('/games'); // Редирект на список игр
      }
    } catch (err) {
      setError((err as Error).message || 'Не удалось добавить игру.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-400">
        {initialData ? 'Редактировать игру' : 'Добавить новую игру'}
      </h2>
      
      {error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded mb-4">{error}</p>}
      {state.error && !error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded mb-4">Ошибка Context: {state.error}</p>}


      <Input name="title" label="Название*" value={formData.title} onChange={handleChange} placeholder="Название игры" required />
      <Input name="genre" label="Жанр*" value={formData.genre} onChange={handleChange} placeholder="RPG, Action, Strategy..." required />
      <Input name="platform" label="Платформы*" value={formData.platform} onChange={handleChange} placeholder="PC, PS5, Xbox..." required />
      <Input name="releaseDate" label="Дата выхода*" type="date" value={formData.releaseDate} onChange={handleChange} required />
      <Input name="developer" label="Разработчик*" value={formData.developer} onChange={handleChange} placeholder="CD Projekt Red..." required />
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Описание*</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Краткое описание игры..."
          required
        />
      </div>
      
      <Input name="imageUrl" label="URL изображения обложки" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
      <Input name="price" label="Цена ($)*" type="number" value={String(formData.price)} onChange={handleChange} placeholder="59.99" step="0.01" min="0" required />

      <Button type="submit" disabled={isSubmitting || state.isLoading} className="w-full py-3 mt-2">
        {isSubmitting || state.isLoading ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Добавить игру')}
      </Button>
    </form>
  );
};

export default GameForm;