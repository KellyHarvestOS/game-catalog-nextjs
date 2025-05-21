// components/GameForm.tsx
'use client';
import React, { useState, FormEvent, useEffect } from 'react';
import { Game, ScreenshotType } from '@/types';
import Input from './ui/Input';
import Button from './ui/Button';
import { useRouter } from 'next/navigation';
import { useGames } from '@/contexts/GameContext';

export interface GameFormProps {
  isEditing?: boolean;
  initialData?: Game | null;
  gameId?: string;
  onSubmitSuccess?: (gameId?: string) => void;
}

type FormDataType = {
  title: string;
  description: string;
  genre: string;
  platform: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  price: string;
  imageUrl: string;
  screenshotUrlsText: string;
};

// Тип для данных, которые отправляются на API и в функции контекста
interface GameApiPayload {
  title: string;
  description: string;
  genre?: string | null;
  platform?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseDate?: string | null;
  price: number | null;
  coverImageUrl: string | null;
  screenshots?: string[];
}

const GameForm: React.FC<GameFormProps> = ({
  isEditing: propsIsEditing,
  initialData = null,
  gameId: propsGameId,
  onSubmitSuccess,
}) => {
  const router = useRouter();
  const { addGame, updateGame, state: gameContextState } = useGames();

  const [formData, setFormData] = useState<FormDataType>({
    title: '', description: '', genre: '', platform: '',
    developer: '', publisher: '', releaseDate: '', price: '',
    imageUrl: '', screenshotUrlsText: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormDataType, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = propsIsEditing ?? !!initialData;
  const gameIdToUpdate = propsGameId ?? initialData?.id;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        genre: initialData.genre || '',
        platform: initialData.platform || '',
        developer: initialData.developer || '',
        publisher: initialData.publisher || '',
        releaseDate: initialData.releaseDate ? (typeof initialData.releaseDate === 'string' ? initialData.releaseDate.split('T')[0] : new Date(initialData.releaseDate).toISOString().split('T')[0]) : '',
        price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
        imageUrl: initialData.coverImageUrl || (initialData as any).imageUrl || '',
        screenshotUrlsText: initialData.screenshots?.map(s => s.url).join(', ') || '',
      });
    }
  }, [isEditMode, initialData]);

  const validateField = (name: keyof FormDataType, value: string): string | undefined => { /* ... (без изменений, как в предыдущем ответе) ... */
    const strValue = String(value).trim();
    switch (name) {
      case 'title': return strValue ? undefined : 'Название обязательно';
      case 'description': return strValue.length >= 10 ? undefined : 'Описание должно быть не менее 10 символов';
      case 'price':
        if (strValue === '') return 'Цена обязательна';
        const numPrice = Number(value);
        return !isNaN(numPrice) && numPrice >= 0 ? undefined : 'Цена должна быть числом (0 или больше)';
      case 'imageUrl':
        if (!strValue) return 'URL обложки обязателен';
        try { new URL(strValue); return undefined; } catch (_) { return 'Некорректный URL изображения обложки'; }
      case 'screenshotUrlsText':
        if (!strValue) return undefined;
        const urls = strValue.split(',').map(url => url.trim()).filter(url => url);
        for (const url of urls) { try { new URL(url); } catch (_) { return `Некорректный URL скриншота: ${url}`; } }
        return undefined;
      default: return undefined;
    }
  };
  const validateForm = (): boolean => { /* ... (без изменений) ... */
    const errors: Partial<Record<keyof FormDataType, string>> = {};
    let isValid = true;
    (Object.keys(formData) as Array<keyof FormDataType>).forEach(key => {
      const valueToValidate = formData[key as keyof FormDataType] ?? '';
      const error = validateField(key, valueToValidate);
      if (error) { errors[key] = error; isValid = false; }
    });
    setFormErrors(errors);
    return isValid;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... (без изменений) ... */
    const { name, value } = e.target;
    const key = name as keyof FormDataType;
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) { const error = validateField(key, value); setFormErrors(prev => ({...prev, [key]: error }));}
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... (без изменений) ... */
    const { name, value } = e.target;
    const key = name as keyof FormDataType;
    const error = validateField(key, value);
    setFormErrors(prev => ({ ...prev, [key]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null); setSuccessMessage(null); setIsSubmitting(true);
    if (!validateForm()) { setIsSubmitting(false); return; }

    const priceValue = formData.price.trim();
    let priceAsNumber: number | null = null;
    if (priceValue === '') {
      setFormErrors(prev => ({ ...prev, price: 'Цена обязательна.' }));
      setIsSubmitting(false); return;
    }
    priceAsNumber = Number(priceValue);
    if (isNaN(priceAsNumber) || priceAsNumber < 0) {
      setFormErrors(prev => ({ ...prev, price: 'Цена должна быть числом (0 или больше).' }));
      setIsSubmitting(false); return;
    }

    const screenshotUrls = formData.screenshotUrlsText?.split(',').map(url => url.trim()).filter(url => url) || [];

    const payloadToSend: GameApiPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      genre: formData.genre.trim() === '' ? null : formData.genre.trim(),
      platform: formData.platform.trim() === '' ? null : formData.platform.trim(),
      developer: formData.developer.trim() === '' ? null : formData.developer.trim(),
      publisher: formData.publisher.trim() === '' ? null : formData.publisher.trim(),
      releaseDate: formData.releaseDate.trim() === '' ? null : formData.releaseDate,
      price: priceAsNumber,
      coverImageUrl: formData.imageUrl.trim() === '' ? null : formData.imageUrl.trim(),
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : undefined,
    };

    console.log("ОТПРАВЛЯЕМЫЕ ДАННЫЕ ИЗ GameForm:", payloadToSend);

    try {
      let resultGame: Game | undefined; // Ожидаем Game | undefined от функций контекста

      if (isEditMode && gameIdToUpdate) {
        resultGame = await updateGame(gameIdToUpdate, payloadToSend); // Передаем GameApiPayload
      } else {
        resultGame = await addGame(payloadToSend); // Передаем GameApiPayload
      }

      if (resultGame) {
        setSuccessMessage(isEditMode ? 'Игра успешно обновлена!' : 'Игра успешно добавлена!');
        if (!isEditMode) {
          setFormData({ title: '', description: '', genre: '', platform: '', developer: '', publisher: '', releaseDate: '', price: '', imageUrl: '', screenshotUrlsText: ''});
          setFormErrors({});
        }
        if (onSubmitSuccess) {
          onSubmitSuccess(resultGame.id);
        } else {
          router.push(resultGame.id ? `/games/${resultGame.id}` : '/games');
        }
      } else if (!gameContextState?.error) {
        setServerError(`Не удалось ${isEditMode ? 'обновить' : 'добавить'} игру. Попробуйте еще раз.`);
      }
    } catch (err) {
      setServerError((err as Error).message || `Произошла ошибка.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl my-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-400">
        {isEditMode ? 'Редактирование Игры' : 'Добавить Новую Игру'}
      </h2>
      {serverError && <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6"><span>{serverError}</span></div>}
      {gameContextState?.error && !serverError && <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6"><span>Ошибка: {gameContextState.error}</span></div>}
      {successMessage && <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-md mb-6"><span>{successMessage}</span></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input name="title" label="Название*" id="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} error={formErrors.title} required />
        <Input name="description" label="Описание*" id="description" type="textarea" rows={4} value={formData.description} onChange={handleChange} onBlur={handleBlur} error={formErrors.description} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="genre" label="Жанр" id="genre" value={formData.genre} onChange={handleChange} onBlur={handleBlur} error={formErrors.genre} />
          <Input name="platform" label="Платформы" id="platform" value={formData.platform} onChange={handleChange} onBlur={handleBlur} error={formErrors.platform} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="developer" label="Разработчик" id="developer" value={formData.developer} onChange={handleChange} onBlur={handleBlur} error={formErrors.developer} />
          <Input name="publisher" label="Издатель" id="publisher" value={formData.publisher} onChange={handleChange} onBlur={handleBlur} error={formErrors.publisher} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="releaseDate" label="Дата выхода" id="releaseDate" type="date" value={formData.releaseDate} onChange={handleChange} onBlur={handleBlur} error={formErrors.releaseDate} />
          <Input name="price" label="Цена ($)*" id="price" type="text" inputMode="decimal" value={formData.price} onChange={handleChange} onBlur={handleBlur} error={formErrors.price} required />
        </div>
        <Input name="imageUrl" label="URL обложки*" id="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} onBlur={handleBlur} error={formErrors.imageUrl} required />
        <Input name="screenshotUrlsText" label="URL скриншотов (через запятую)" id="screenshotUrlsText" type="text" value={formData.screenshotUrlsText ?? ''} onChange={handleChange} onBlur={handleBlur} error={formErrors.screenshotUrlsText} />
        <Button type="submit" disabled={isSubmitting || gameContextState?.isLoading} variant="primary" className="w-full py-3 text-base" isLoading={isSubmitting || gameContextState?.isLoading}>
          {isSubmitting || gameContextState?.isLoading ? (isEditMode ? 'Сохранение...' : 'Добавление...') : (isEditMode ? 'Сохранить изменения' : 'Добавить игру')}
        </Button>
      </form>
    </div>
  );
};
export default GameForm;