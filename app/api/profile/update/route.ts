// app/api/profile/update/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface UpdateProfileRequestBody {
  name?: string;
  image?: string | null;
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UpdateProfileRequestBody;
    const { name, image } = body;
    
    // Тип для Prisma update
    const updateData: { name?: string | null; image?: string | null } = {};
    let hasChanges = false;

    if (name !== undefined) { // Если поле name пришло в запросе
      if (name.trim() === '' || name.trim().length >= 3) { // Разрешаем пустое имя для обнуления или имя >= 3 символов
        if (name !== session.user.name) { // Проверяем, отличается ли от текущего
          updateData.name = name.trim() === '' ? null : name.trim();
          hasChanges = true;
        }
      } else {
        return NextResponse.json({ message: 'Имя должно содержать не менее 3 символов или быть пустым для сброса.' }, { status: 400 });
      }
    }

    // image может быть строкой (новый URL) или null (удалить аватар)
    if (image !== undefined) { // Если поле image пришло в запросе
      if (image !== session.user.image) { // Проверяем, отличается ли от текущего
         updateData.image = image; // image уже может быть null, если клиент так передал
         hasChanges = true;
      }
    }

    if (!hasChanges) {
      const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      return NextResponse.json({ message: 'Нет фактических изменений для сохранения.', ...currentUser });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
    });

  } catch (error: any) {
    console.error("[API UPDATE-PROFILE] Ошибка:", error);
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Пользователь для обновления не найден.' }, { status: 404 });
    }
    return NextResponse.json({ message: error.message || 'Ошибка сервера при обновлении профиля' }, { status: 500 });
  }
}