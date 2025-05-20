// app/(main)/profile/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from 'next/image';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function ProfilePage() {
  const { data: session, status, update: updateSessionHook } = useSession();
  const router = useRouter();

  // Состояния для полей формы
  const [nameInput, setNameInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState(''); // Для поля ввода URL
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoadingSession = status === 'loading';

  // Инициализация состояний формы из сессии
  useEffect(() => {
    if (session?.user) {
      setNameInput(session.user.name || '');
      const userImage = session.user.image || '';
      setImageUrlInput(userImage); 
      // Превью обновляется из другого useEffect, который следит за selectedFile и session.user.image
    }
  }, [session]); 

  // Обновление превью аватара
  useEffect(() => {
    if (editMode) { // Обновляем превью только в режиме редактирования
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (imageUrlInput.trim() !== '') {
            setPreviewUrl(imageUrlInput);
        } else {
            setPreviewUrl(session?.user?.image || null); // Если URL очищен, показываем из сессии или ничего
        }
    } else { // Вне режима редактирования, превью всегда из сессии
        setPreviewUrl(session?.user?.image || null);
    }
  }, [editMode, selectedFile, imageUrlInput, session?.user?.image]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null); setSuccessMessage(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите файл изображения.'); event.target.value = ''; return;
      }
      if (file.size > 2 * 1024 * 1024) { 
        setError('Файл слишком большой (макс 2MB).'); event.target.value = ''; return;
      }
      setSelectedFile(file);
      setImageUrlInput(''); 
    } else {
      setSelectedFile(null);
    }
  };

  const handleUrlInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null); setSuccessMessage(null);
    const newUrl = event.target.value;
    setImageUrlInput(newUrl);
    setSelectedFile(null);
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoadingUpdate(true); setError(null); setSuccessMessage(null);

    let newImageUrlForServer: string | null | undefined = undefined; // undefined - не меняем, null - удаляем, string - новый URL
    let statusMsg = '';
    let dataForSessionUpdate: { name?: string; image?: string | null } = {};

    // 1. Обработка загрузки файла (если выбран)
    if (selectedFile) {
      const formDataHttp = new FormData();
      formDataHttp.append('avatar', selectedFile);
      try {
        const uploadResponse = await fetch('/api/profile/upload-avatar', { method: 'POST', body: formDataHttp });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.message || 'Не удалось загрузить аватар');
        newImageUrlForServer = uploadData.user.image; // URL из ответа API загрузки
        statusMsg = uploadData.message || 'Аватар успешно загружен!';
      } catch (err: any) {
        setError(`Ошибка загрузки аватара: ${err.message}`);
        setIsLoadingUpdate(false); return;
      }
    } else {
      // Если файл не выбран, проверяем, изменился ли URL в поле ввода
      const currentSessionImage = session?.user?.image || '';
      if (imageUrlInput !== currentSessionImage) {
        newImageUrlForServer = imageUrlInput.trim() === '' ? null : imageUrlInput.trim();
      }
    }

    // 2. Подготовка данных для API /api/profile/update
    const payloadForUpdateApi: { name?: string; image?: string | null } = {};
    let nameChanged = false;
    let imageActuallyChangedOnServer = newImageUrlForServer !== undefined; // Был ли установлен новый URL (включая null)

    if (nameInput !== (session?.user?.name || '')) {
      payloadForUpdateApi.name = nameInput;
      nameChanged = true;
    }
    if (imageActuallyChangedOnServer) {
      payloadForUpdateApi.image = newImageUrlForServer;
    }
    
    // 3. Вызов API /api/profile/update, если есть что обновлять
    if (Object.keys(payloadForUpdateApi).length > 0) {
      try {
        const response = await fetch('/api/profile/update', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadForUpdateApi),
        });
        const dataFromUpdateApi = await response.json();
        if (!response.ok) throw new Error(dataFromUpdateApi.message || 'Не удалось обновить профиль');

        // Готовим данные для обновления сессии из ответа API
        dataForSessionUpdate.name = dataFromUpdateApi.name;
        dataForSessionUpdate.image = dataFromUpdateApi.image;
        
        if (nameChanged && imageActuallyChangedOnServer) statusMsg = statusMsg ? `${statusMsg} Имя обновлено.` : 'Профиль обновлен.';
        else if (nameChanged) statusMsg = 'Имя успешно обновлено!';
        else if (imageActuallyChangedOnServer && !statusMsg) statusMsg = 'Аватар обновлен!';

      } catch (err: any) {
        setError(`Ошибка обновления профиля: ${err.message}`);
        setIsLoadingUpdate(false); return;
      }
    } else if (statusMsg) { // Если только файл был загружен, но имя не менялось (и URL тоже)
      // Данные для сессии из ответа upload-avatar
      dataForSessionUpdate.image = newImageUrlForServer;
    } else {
      setSuccessMessage('Нет изменений для сохранения.');
      setIsLoadingUpdate(false); setEditMode(false); setSelectedFile(null); return;
    }
    
    // 4. Обновление сессии NextAuth, если что-то изменилось
    if (updateSessionHook && (dataForSessionUpdate.name !== undefined || dataForSessionUpdate.image !== undefined)) {
      await updateSessionHook(dataForSessionUpdate);
    }
    
    setSuccessMessage(statusMsg || 'Профиль успешно обновлен!');
    setSelectedFile(null); // Сбрасываем файл
    setEditMode(false);
    setIsLoadingUpdate(false);
  };

  if (isLoadingSession) { return ( <div className="relative flex items-center justify-center min-h-screen bg-slate-900"> <AnimatedBackground /><p className="text-xl text-slate-300 z-10">Загрузка профиля...</p></div> ); }
  if (!session) { if (typeof window !== 'undefined') router.push('/login?callbackUrl=/profile'); return ( <div className="relative flex items-center justify-center min-h-screen bg-slate-900"><AnimatedBackground /><p className="text-xl text-slate-300 z-10">Перенаправление...</p></div> );}

  const user = session.user;
  const avatarToDisplay = editMode ? previewUrl : user.image;

  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="bg-slate-800/80 backdrop-blur-sm shadow-xl rounded-lg p-6 md:p-10 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-8 text-center">Ваш Профиль</h1>
          {error && <p className="mb-4 text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
          {successMessage && <p className="mb-4 text-center text-green-400 bg-green-900/30 p-3 rounded-md">{successMessage}</p>}

          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center overflow-hidden mb-4 relative shadow-lg">
              {avatarToDisplay ? (
                <Image src={avatarToDisplay} alt="Аватар" layout="fill" objectFit="cover" key={avatarToDisplay} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 sm:h-20 sm:w-20 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              )}
            </div>
            {!editMode && (
              <>
                {user.name && <h2 className="text-2xl font-semibold text-white">{user.name}</h2>}
                {user.email && <p className="text-slate-400">{user.email}</p>}
              </>
            )}
          </div>

          {!editMode ? (
            <>
              <div className="space-y-3 text-slate-200 mb-6 border-y border-slate-700 py-4">
                {user.id && <div><strong className="text-slate-400 w-20 inline-block">ID:</strong> {user.id}</div>}
                {user.role && <div><strong className="text-slate-400 w-20 inline-block">Роль:</strong> <span className="uppercase font-semibold px-2 py-0.5 bg-indigo-600 text-indigo-100 text-xs rounded">{user.role}</span></div>}
              </div>
              <Button onClick={() => { setEditMode(true); setError(null); setSuccessMessage(null); setSelectedFile(null); setNameInput(user.name || ''); setImageUrlInput(user.image || '');}} variant="secondary" className="w-full">
                Редактировать профиль
              </Button>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input label="Никнейм (Имя)" name="nameInput" id="nameInput" type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Ваш никнейм или имя" />
              <div>
                <label htmlFor="avatarFile" className="block text-sm font-medium text-slate-300 mb-1">Новый аватар (файл до 2MB)</label>
                <input id="avatarFile" name="avatarFile" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-indigo-50 hover:file:bg-indigo-600"/>
              </div>
              <Input label="Или URL Аватарки" name="imageUrlInput" id="imageUrlInput" type="url" value={imageUrlInput} onChange={handleUrlInputChange} placeholder="https://example.com/avatar.jpg или пусто для удаления" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" variant="primary" isLoading={isLoadingUpdate} disabled={isLoadingUpdate} className="flex-1">{isLoadingUpdate ? 'Сохранение...' : 'Сохранить'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setEditMode(false); setError(null); setSuccessMessage(null); setNameInput(user.name || ''); setImageUrlInput(user.image || ''); setSelectedFile(null);}} className="flex-1">Отмена</Button>
              </div>
            </form>
          )}
          <div className="mt-10 border-t border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-slate-200 mb-4">Мои игры</h3>
            <p className="text-slate-400">Раздел "Мои игры" находится в разработке.</p>
          </div>
          <div className="mt-6 text-center">
            <Button onClick={() => signOut({ callbackUrl: '/' })} variant="danger" className="px-6">Выйти из аккаунта</Button>
          </div>
        </div>
      </div>
    </div>
  );
}