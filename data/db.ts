// data/db.ts
import { Game } from '@/types';

// Этот массив будет изменяться API роутами
export let games_db: Game[] = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    platform: 'PC, PS5, Xbox Series X/S',
    releaseDate: '2020-12-10',
    developer: 'CD Projekt Red',
    description: 'An open-world, action-adventure story set in Night City.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    price: 59.99,
  },
  {
    id: '2',
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC, PS4, Xbox One, Switch',
    releaseDate: '2015-05-19',
    developer: 'CD Projekt Red',
    description: 'A story-driven, next-generation open world role-playing game.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
    price: 39.99,
  },
  {
    id: '3',
    title: 'Elden Ring',
    genre: 'Action RPG',
    platform: 'PC, PS5, Xbox Series X/S, PS4, Xbox One',
    releaseDate: '2022-02-25',
    developer: 'FromSoftware',
    description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_Art.jpg',
    price: 69.99,
  }
];

// Для POST в app/api/games/route.ts тоже нужно использовать games_db
// Измените app/api/games/route.ts:
// import { games_db as games } from '@/data/db';
// ... остальной код ...