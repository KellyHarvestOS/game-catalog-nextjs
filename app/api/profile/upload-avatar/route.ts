// app/api/profile/upload-avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat, rm } from 'fs/promises';
import path from 'path';
import prisma from '@/data/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const uploadDir = path.join(process.cwd(), 'public/avatars');

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Файл не найден' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Недопустимый тип файла.' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      return NextResponse.json({ message: 'Файл слишком большой (макс 2MB).' }, { status: 400 });
    }

    // Удаление старого аватара, если он есть и хранится локально
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } });
    if (currentUser?.image && currentUser.image.startsWith('/avatars/')) {
        const oldAvatarName = path.basename(currentUser.image);
        const oldAvatarPath = path.join(uploadDir, oldAvatarName);
        try {
            await stat(oldAvatarPath); // Проверяем, существует ли файл
            await rm(oldAvatarPath); // Удаляем файл
            console.log(`[API UPLOAD-AVATAR] Старый аватар удален: ${oldAvatarPath}`);
        } catch (e: any) {
            if (e.code !== 'ENOENT') { // Игнорируем, если файл не найден, но логируем другие ошибки
                console.error(`[API UPLOAD-AVATAR] Ошибка удаления старого аватара ${oldAvatarPath}:`, e);
            }
        }
    }


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${session.user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const imageUrl = `/avatars/${filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      message: 'Аватар успешно загружен!',
      user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          role: updatedUser.role,
      }
    });

  } catch (error: any) {
    console.error("[API UPLOAD-AVATAR] Ошибка:", error);
    if (error.code === 'ENOENT' && (error.syscall === 'open' || error.syscall === 'mkdir')) {
        console.error("[API UPLOAD-AVATAR] Ошибка ENOENT: Папка для загрузки не существует или нет прав. Убедитесь, что 'public/avatars' создана и доступна для записи.");
        return NextResponse.json({ message: "Ошибка сервера: проблема с директорией для загрузки." }, { status: 500 });
    }
    return NextResponse.json({ message: error.message || 'Ошибка сервера при загрузке аватара' }, { status: 500 });
  }
}