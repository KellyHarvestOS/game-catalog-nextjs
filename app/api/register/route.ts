// app/api/register/route.ts
import prisma from '@/data/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { ROLES } from '@/types';

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequestBody;
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 409 } // 409 Conflict
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        hashedPassword: hashedPassword,
        role: ROLES.USER, // Новые пользователи по умолчанию USER
      },
    });

    return NextResponse.json(
      {
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { message: 'Произошла ошибка при регистрации' },
      { status: 500 }
    );
  }
}