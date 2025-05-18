import { NextResponse } from 'next/server';
import prisma from '@/data/prisma';
import { games_db as staticGamesSource } from '@/data/db';
import { Game as SharedGameType } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface StaticGameInput {
  id: string | number;
  title: string;
  description: string;
  genre?: string;
  platform?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string | null;
  price: number | null | undefined; // MODIFIED: Allow undefined for price
  imageUrl?: string | null;
  screenshots?: (string | { url: string } | null | undefined)[];
  [key: string]: any;
}

// This assertion assumes games_db items generally conform to StaticGameInput.
// If games_db has a more specific own type, you might map it to StaticGameInput[] instead of direct assertion.
const staticGames: StaticGameInput[] = staticGamesSource as StaticGameInput[];


export async function GET() {
  try {
    const prismaGames = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: { screenshots: true }
    });

    const allGames: SharedGameType[] = [
      ...staticGames.map(sg => {
        let processedScreenshots: string[] = [];
        if (Array.isArray(sg.screenshots)) {
          processedScreenshots = sg.screenshots
            .map(s_item => {
              if (typeof s_item === 'string') {
                return s_item;
              }
              if (s_item && typeof s_item === 'object' && 'url' in s_item && typeof s_item.url === 'string') {
                return s_item.url;
              }
              return null;
            })
            .filter((url): url is string => typeof url === 'string');
        }

        // Map sg (StaticGameInput) to SharedGameType structure
        return {
          id: `static-${sg.id}`,
          title: sg.title,
          description: sg.description,
          genre: sg.genre ?? undefined, // Ensure undefined if null/empty for consistency with SharedGameType
          platform: sg.platform ?? undefined,
          developer: sg.developer ?? undefined,
          publisher: sg.publisher ?? undefined,
          releaseDate: sg.releaseDate, // Assuming string | null is fine for SharedGameType
          price: sg.price ?? null,      // MODIFIED: Coerce undefined price to null for SharedGameType
          imageUrl: sg.imageUrl,       // Assuming string | null is fine
          isStatic: true,
          screenshots: processedScreenshots,
          // Add any other fields required by SharedGameType, handling potential undefined from sg
          // For example, if SharedGameType requires createdAt/updatedAt (even for static), provide defaults
          createdAt: sg.createdAt || new Date().toISOString(), // Example default
          updatedAt: sg.updatedAt || new Date().toISOString(), // Example default
        } as SharedGameType; // Added 'as SharedGameType' for clarity, ensure all fields match
      }),
      ...prismaGames.map(pg => {
        const { coverImageUrl, releaseDate, screenshots: prismaScreenshots, createdAt, updatedAt, ...restOfPrismaGame } = pg;
        return {
          ...restOfPrismaGame,
          id: pg.id,
          imageUrl: coverImageUrl || null,
          releaseDate: releaseDate ? releaseDate.toISOString().split('T')[0] : null,
          screenshots: prismaScreenshots?.map(s => s.url) || [],
          isStatic: false,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
          genre: restOfPrismaGame.genre ?? undefined,
          platform: restOfPrismaGame.platform ?? undefined,
          developer: restOfPrismaGame.developer ?? undefined,
          publisher: restOfPrismaGame.publisher ?? undefined,
          price: restOfPrismaGame.price ?? null,
        } as SharedGameType; // Added 'as SharedGameType' for clarity
      })
    ];
    return NextResponse.json(allGames);
  } catch (error) {
    console.error("Ошибка при получении списка игр (объединенного):", error);
    return NextResponse.json({ message: 'Ошибка сервера при получении списка игр' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const body: Omit<SharedGameType, 'id' | 'isStatic' | 'createdAt' | 'updatedAt'> = await request.json();
    const { title, description, genre, platform, developer, publisher, releaseDate, price, imageUrl, screenshots } = body;

    if (!title || !description) {
        return NextResponse.json({ message: 'Отсутствуют обязательные поля: title, description' }, { status: 400 });
    }

    const newGameInDb = await prisma.game.create({
      data: {
        title, description,
        genre: genre || null,
        platform: platform || null,
        developer: developer || null,
        publisher: publisher || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        price: typeof price === 'number' ? price : null, // SharedGameType price is number | null
        coverImageUrl: imageUrl || null,
        screenshots: screenshots && Array.isArray(screenshots) ? { create: screenshots.map((url: string) => ({ url })) } : undefined,
      },
      include: { screenshots: true }
    });
    const { coverImageUrl: newCover, releaseDate: newRelease, screenshots: newScreenshots, createdAt, updatedAt, ...rest } = newGameInDb;
    const responseGame: SharedGameType = {
        ...rest,
        id: newGameInDb.id,
        imageUrl: newCover || null,
        releaseDate: newRelease ? newRelease.toISOString().split('T')[0] : null,
        screenshots: newScreenshots?.map(s => s.url) || [],
        isStatic: false,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        genre: rest.genre ?? undefined,
        platform: rest.platform ?? undefined,
        developer: rest.developer ?? undefined,
        publisher: rest.publisher ?? undefined,
        price: rest.price ?? null,
    };
    return NextResponse.json(responseGame, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании игры в Prisma:", error);
    return NextResponse.json({ message: 'Ошибка сервера при создании игры' }, { status: 500 });
  }
}