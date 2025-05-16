// components/GameForm.tsx
'use client';
import React, { useState, FormEvent, useEffect } from 'react';
import { Game } from '@/types';
import Input from './ui/Input'; // Предполагаем, что этот компонент уже хорошо стилизован
import Button from './ui/Button';
import { useRouter } from 'next/navigation';
import { useGames } from '@/contexts/GameContext';
// import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'; // Для сообщений

interface GameFormProps {
  initialData?: Game;
  onSubmitSuccess?: (newGameId?: string) => void; // Может принимать ID новой игры для редиректа на нее
}

const GameForm: React.FC<GameFormProps> = ({ initialData, onSubmitSuccess }) => {
  const router = useRouter();
  const { addGame, updateGame, state } = useGames(); // Добавляем updateGame для редактирования
  const [formData, setFormData] = useState<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>({ // Убираем поля, которые не должны редактироваться напрямую
    title: '',
    genre: '',
    platform: '',
    releaseDate: '',
    developer: '',
    description: '',
    imageUrl: '',
    price: 0,
    // Добавьте другие поля из вашего типа Game, если они есть
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null); // Ошибка от сервера/контекста
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        genre: initialData.genre || '',
        platform: initialData.platform || '',
        // Форматируем дату для input type="date"
        releaseDate: initialData.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : '',
        developer: initialData.developer || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        price: initialData.price || 0,
      });
    }
  }, [initialData]);

  const validateField = (name: keyof typeof formData, value: any): string | undefined => {
    switch (name) {
      case 'title':
        return value.trim() ? undefined : 'Название обязательно';
      case 'genre':
        return value.trim() ? undefined : 'Жанр обязателен';
      case 'platform':
        return value.trim() ? undefined : 'Платформа обязательна';
      case 'developer':
        return value.trim() ? undefined : 'Разработчик обязателен';
      case 'releaseDate':
        return value ? undefined : 'Дата выхода обязательна';
      case 'description':
        return value.trim().length > 10 ? undefined : 'Описание должно быть не менее 10 символов';
      case 'price':
        return value > 0 ? undefined : 'Цена должна быть больше нуля';
      case 'imageUrl':
        if (value.trim() === '') return undefined; // Не обязательно
        try {
          new URL(value);
          return undefined;
        } catch (_) {
          return 'Некорректный URL изображения';
        }
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof typeof formData, string>> = {};
    let isValid = true;
    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'price' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    // Валидация при изменении
    if (formErrors[name as keyof typeof formData]) {
        const error = validateField(name as keyof typeof formData, parsedValue);
        setFormErrors(prev => ({...prev, [name as keyof typeof formData]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'price' ? parseFloat(value) || 0 : value;
    const error = validateField(name as keyof typeof formData, parsedValue);
    setFormErrors(prev => ({ ...prev, [name as keyof typeof formData]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }
    
    try {
      let resultGame;
      if (isEditMode && initialData) {
        resultGame = await updateGame(initialData.id, formData); // updateGame должен возвращать обновленную игру или ее ID
        setSuccessMessage('Игра успешно обновлена!');
      } else {
        resultGame = await addGame(formData); // addGame должен возвращать созданную игру или ее ID
        setSuccessMessage('Игра успешно добавлена!');
        setFormData({ title: '', genre: '', platform: '', releaseDate: '', developer: '', description: '', imageUrl: '', price: 0 });
        setFormErrors({});
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess(resultGame?.id); // Передаем ID, если он есть
      } else {
        router.push(resultGame?.id ? `/games/${resultGame.id}` : '/games'); // Редирект на страницу игры или каталог
      }
    } catch (err) {
      setServerError((err as Error).message || `Не удалось ${isEditMode ? 'обновить' : 'добавить'} игру.`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl my-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-400">
        {isEditMode ? 'Редактирование Игры' : 'Добавить Новую Игру'}
      </h2>
      
      {serverError && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 flex items-center">
          {/* <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-400" /> */}
          <span>{serverError}</span>
        </div>
      )}
      {state.error && !serverError && ( // Показываем ошибку из контекста, если нет локальной
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 flex items-center">
          {/* <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-400" /> */}
          <span>Ошибка контекста: {state.error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-md mb-6 flex items-center">
          {/* <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" /> */}
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Используем грид для лучшего расположения полей */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="title" label="Название*" value={formData.title} onChange={handleChange} onBlur={handleBlur} placeholder="Например, Cyberpunk 2077" error={formErrors.title} required />
          <Input name="genre" label="Жанр*" value={formData.genre} onChange={handleChange} onBlur={handleBlur} placeholder="RPG, Action, Strategy" error={formErrors.genre} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="platform" label="Платформы*" value={formData.platform} onChange={handleChange} onBlur={handleBlur} placeholder="PC, PlayStation 5, Xbox Series X" error={formErrors.platform} required />
          <Input name="developer" label="Разработчик*" value={formData.developer} onChange={handleChange} onBlur={handleBlur} placeholder="CD Projekt Red" error={formErrors.developer} required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="releaseDate" label="Дата выхода*" type="date" value={formData.releaseDate} onChange={handleChange} onBlur={handleBlur} error={formErrors.releaseDate} required />
          <Input name="price" label="Цена ($)*" type="number" value={String(formData.price)} onChange={handleChange} onBlur={handleBlur} placeholder="59.99" step="0.01" min="0.01" error={formErrors.price} required />
        </div>
        
        <Input name="imageUrl" label="URL изображения обложки" value={formData.imageUrl} onChange={handleChange} onBlur={handleBlur} placeholder="https://example.com/image.jpg" error={formErrors.imageUrl} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Описание*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={5}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm
                        ${formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-indigo-500'}`}
            placeholder="Подробное описание игры, ее особенности, сюжет..."
            required
          />
          {formErrors.description && <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>}
        </div>

        <Button type="submit" disabled={state.isLoading} variant="primary" className="w-full py-3 text-base">
          {state.isLoading ? 'Обработка...' : (isEditMode ? 'Сохранить изменения' : 'Добавить игру')}
        </Button>
      </form>
    </div>
  );
};

export default GameForm;