// components/GameForm.tsx
'use client';
import React, { useState, FormEvent, useEffect } from 'react';
import { Game } from '@/types';
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
  screenshotUrlsText?: string;
};

const GameForm: React.FC<GameFormProps> = ({
  isEditing: propsIsEditing,
  initialData = null,
  gameId: propsGameId,
  onSubmitSuccess,
}) => {
  const router = useRouter();
  const { addGame, updateGame, state } = useGames();

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    genre: '',
    platform: '',
    developer: '',
    publisher: '',
    releaseDate: '',
    price: '',
    imageUrl: '',
    screenshotUrlsText: '', // Initialized as string, so formData.screenshotUrlsText is always string
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormDataType, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const isEditMode = propsIsEditing ?? !!initialData;
  const gameIdForSubmit = propsGameId ?? initialData?.id;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        genre: initialData.genre || '',
        platform: initialData.platform || '',
        developer: initialData.developer || '',
        publisher: initialData.publisher || '',
        releaseDate: initialData.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : '',
        price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
        imageUrl: initialData.imageUrl || '',
        screenshotUrlsText: initialData.screenshots?.join(', ') || '',
      });
    }
  }, [isEditMode, initialData]);

  const validateField = (name: keyof FormDataType, value: string): string | undefined => {
    const strValue = String(value).trim(); // value is already expected to be string here
    switch (name) {
      case 'title': return strValue ? undefined : 'Название обязательно';
      case 'description': return strValue.length >= 10 ? undefined : 'Описание должно быть не менее 10 символов';
      case 'price':
        if (strValue === '') return 'Цена обязательна';
        const numPrice = Number(value); // `value` is string here from FormDataType or input
        return !isNaN(numPrice) && numPrice >= 0 ? undefined : 'Цена должна быть числом (0 или больше)';
      case 'imageUrl':
        if (!strValue) return undefined;
        try { new URL(strValue); return undefined; } catch (_) { return 'Некорректный URL изображения обложки'; }
      case 'screenshotUrlsText':
        if (!strValue) return undefined; // strValue is from (formData[key] ?? '').trim() or e.target.value.trim()
        const urls = strValue.split(',').map(url => url.trim()).filter(url => url);
        for (const url of urls) {
          try { new URL(url); } catch (_) { return `Некорректный URL скриншота: ${url}`; }
        }
        return undefined;
      default: return undefined;
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormDataType, string>> = {};
    let isValid = true;
    (Object.keys(formData) as Array<keyof FormDataType>).forEach(key => {
      // FIX: Ensure the value passed to validateField is a string.
      // formData[key] can be `string | undefined` according to FormDataType for optional fields.
      // Even though screenshotUrlsText is initialized to '', TS type system considers it string | undefined.
      const valueToValidate = formData[key as keyof FormDataType] ?? '';
      const error = validateField(key, valueToValidate);
      if (error) { errors[key] = error; isValid = false; }
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // value is string
    const key = name as keyof FormDataType;
    setFormData(prev => ({ ...prev, [key]: value }));
    // When validating on change, `value` is directly from e.target.value, which is string.
    if (formErrors[key]) { const error = validateField(key, value); setFormErrors(prev => ({...prev, [key]: error }));}
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // value is string
    const key = name as keyof FormDataType;
    // When validating on blur, `value` is directly from e.target.value, which is string.
    const error = validateField(key, value);
    setFormErrors(prev => ({ ...prev, [key]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null); setSuccessMessage(null); setIsFormLoading(true);
    if (!validateForm()) { setIsFormLoading(false); return; }
    
    const priceValue = formData.price.trim();
    const priceAsNumber: number | null = priceValue === '' ? null : Number(priceValue);
    if (priceValue !== '' && (priceAsNumber === null || isNaN(priceAsNumber))) {
        setServerError('Цена должна быть корректным числом.'); setIsFormLoading(false); return;
    }

    const screenshotUrls = formData.screenshotUrlsText?.split(',').map(url => url.trim()).filter(url => url) || [];

    const payloadToSend: Partial<Omit<Game, 'id' | 'isStatic' | 'createdAt' | 'updatedAt' | 'coverImageUrl' >> & { screenshots?: string[] } = {
      title: formData.title,
      description: formData.description,
      genre: formData.genre.trim() === '' ? undefined : formData.genre,
      platform: formData.platform.trim() === '' ? undefined : formData.platform,
      developer: formData.developer.trim() === '' ? undefined : formData.developer,
      publisher: formData.publisher.trim() === '' ? undefined : formData.publisher,
      releaseDate: formData.releaseDate.trim() === '' ? null : formData.releaseDate,
      price: priceAsNumber,
      imageUrl: formData.imageUrl.trim() === '' ? null : formData.imageUrl,
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : undefined,
    };
    
    try {
      let resultGame;
      const apiPayload = payloadToSend as Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'purchasedByUsers' | 'isStatic' | 'coverImageUrl'> & { screenshots?: string[] };

      if (isEditMode && gameIdForSubmit) {
        resultGame = await updateGame(gameIdForSubmit, apiPayload);
        setSuccessMessage('Игра успешно обновлена!');
      } else {
        resultGame = await addGame(apiPayload);
        setSuccessMessage('Игра успешно добавлена!');
        setFormData({ title: '', description: '', genre: '', platform: '', developer: '', publisher: '', releaseDate: '', price: '', imageUrl: '', screenshotUrlsText: ''});
        setFormErrors({});
      }
      if (onSubmitSuccess) { onSubmitSuccess(resultGame?.id); } else { router.push(resultGame?.id ? `/games/${resultGame.id}` : '/games');}
    } catch (err) { setServerError((err as Error).message || `Ошибка.`); } finally { setIsFormLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl my-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-400">
        {isEditMode ? 'Редактирование Игры' : 'Добавить Новую Игру'}
      </h2>
      {serverError && <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6"><span>{serverError}</span></div>}
      {state.error && !serverError && <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6"><span>Ошибка контекста: {state.error}</span></div>}
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
          <Input name="price" label="Цена ($)*" id="price" type="number" value={formData.price} onChange={handleChange} onBlur={handleBlur} step="0.01" min="0" error={formErrors.price} required />
        </div>
        <Input name="imageUrl" label="URL обложки" id="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} onBlur={handleBlur} error={formErrors.imageUrl} />
        <Input name="screenshotUrlsText" label="URL скриншотов (через запятую)" id="screenshotUrlsText" type="text" value={formData.screenshotUrlsText ?? ''} onChange={handleChange} onBlur={handleBlur} error={formErrors.screenshotUrlsText} />
        <Button type="submit" disabled={isFormLoading || state.isLoading} variant="primary" className="w-full py-3 text-base" isLoading={isFormLoading || state.isLoading}>
          {isFormLoading || state.isLoading ? (isEditMode ? 'Сохранение...' : 'Добавление...') : (isEditMode ? 'Сохранить изменения' : 'Добавить игру')}
        </Button>
      </form>
    </div>
  );
};
export default GameForm;