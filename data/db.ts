// data/db.ts
import { Game } from '@/types';

export let games_db: Game[] = [
  {
    id: 'amongus', // Используйте уникальные ID
    title: 'Among Us',
    genre: 'Party, Multiplayer',
    platform: 'PC, Mobile, Consoles',
    releaseDate: '2018-06-15',
    developer: 'Innersloth',
    description: 'An online multiplayer social deduction game.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Among_Us_cover_art.jpg/250px-Among_Us_cover_art.jpg', // Пример URL
    price: 4.99,
    isStatic: true,
  },
  {
    id: 'astroneer',
    title: 'ASTRONEER',
    genre: 'Adventure, Sandbox',
    platform: 'PC, Xbox, PS4, Switch',
    releaseDate: '2019-02-06',
    developer: 'System Era Softworks',
    description: 'Explore and reshape distant worlds.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/361420/header.jpg', // Пример URL
    price: 29.99,
    isStatic: true,
  },
  {
    id: 'cuphead',
    title: 'Cuphead',
    genre: 'Action, Platformer',
    platform: 'PC, Xbox, PS4, Switch',
    releaseDate: '2017-09-29',
    developer: 'Studio MDHR',
    description: 'A classic run and gun action game focused on boss battles.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/ru/e/eb/Cuphead_%28artwork%29.png', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'flipperfrenzy',
    title: 'Flipper Frenzy', // Информации мало, заполните сами
    genre: 'Arcade, Pinball',
    platform: 'PC',
    releaseDate: '2020-01-01', // Пример
    developer: 'Unknown Developer',
    description: 'A fun pinball game.',
    imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3305770/4d11773855071f5851428a58dc0a93bea7da1cf0/capsule_616x353.jpg?t=1747286503',
    price: 0.99,
    isStatic: true,
  },
  {
    id: 'theforest',
    title: 'The Forest',
    genre: 'Survival, Horror',
    platform: 'PC, PS4',
    releaseDate: '2018-04-30',
    developer: 'Endnight Games',
    description: 'Survive on a mysterious island after a plane crash.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/242760/header.jpg', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'gonesurvival',
    title: 'Gone: Survival', // Информации мало, заполните сами
    genre: 'Survival',
    platform: 'PC',
    releaseDate: '2021-01-01', // Пример
    developer: 'Unknown Developer',
    description: 'A survival game experience.',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOUHpqXkDjvHRB8UJjuA-rZ5XqAioeNm5JVQ&s', 
    price: 14.99,
    isStatic: true,
  },
  {
    id: 'gtav',
    title: 'Grand Theft Auto V Enhanced',
    genre: 'Action, Open World',
    platform: 'PC, PS5, Xbox Series X/S',
    releaseDate: '2022-03-15', // Для Enhanced версии
    developer: 'Rockstar Games',
    description: 'Experience the interwoven stories of Franklin, Michael and Trevor in Los Santos.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png', // Пример URL
    price: 29.99,
    isStatic: true,
  },
  {
    id: 'humanfallflat',
    title: 'Human Fall Flat',
    genre: 'Puzzle, Platformer',
    platform: 'PC, Consoles, Mobile',
    releaseDate: '2016-07-22',
    developer: 'No Brakes Games',
    description: 'A quirky physics-based puzzle platformer.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/477160/header.jpg', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'idleslayer',
    title: 'Idle Slayer',
    genre: 'Idle, RPG',
    platform: 'PC, Mobile',
    releaseDate: '2020-08-28',
    developer: 'Pablos RPS',
    description: 'An incremental game with idle and active playstyles.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1353300/header.jpg', // Пример URL
    price: 0, // Free to play
    isStatic: true,
  },
  {
    id: 'layersoffear2016',
    title: 'Layers of Fear (2016)',
    genre: 'Horror, Adventure',
    platform: 'PC, PS4, Xbox One, Switch',
    releaseDate: '2016-02-16',
    developer: 'Bloober Team',
    description: 'A first-person psychedelic horror game.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/391720/header.jpg', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'left4dead2',
    title: 'Left 4 Dead 2',
    genre: 'Action, Co-op, FPS',
    platform: 'PC, Xbox 360',
    releaseDate: '2009-11-17',
    developer: 'Valve',
    description: 'The highly anticipated sequel to the award-winning Left 4 Dead.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/ru/1/19/Left_4_dead_2.jpg', // Пример URL
    price: 9.99,
    isStatic: true,
  },
  {
    id: 'nfsheat',
    title: 'Need for Speed™ Heat',
    genre: 'Racing, Action',
    platform: 'PC, PS4, Xbox One',
    releaseDate: '2019-11-08',
    developer: 'Ghost Games',
    description: 'Hustle by day and risk it all at night.',
    imageUrl: 'https://hot.game/uploads/media/game/0001/47/56b1bf1c1a7c700085d285d61eb9865a2e45796d.jpeg', // Пример URL
    price: 59.99,
    isStatic: true,
  },
  {
    id: 'nubsadventure',
    title: 'Nubs!', // Иконка говорила "Nubs!", возможно, это "Nubs' Adventure"
    genre: 'Platformer, Adventure',
    platform: 'PC, Wii U, Mobile',
    releaseDate: '2015-09-02',
    developer: 'IMakeGames',
    description: 'Nubs\' Adventure is a platforming puzzler.',
    imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2337860/771b940505dff799cc8eb0faf076155a8ecdb25e/capsule_616x353.jpg?t=1747399781', // Пример URL для Nubs' Adventure
    price: 4.99,
    isStatic: true,
  },
  {
    id: 'portal2',
    title: 'Portal 2',
    genre: 'Puzzle, Sci-fi',
    platform: 'PC, PS3, Xbox 360',
    releaseDate: '2011-04-19',
    developer: 'Valve',
    description: 'Use portals to solve puzzles in this critically acclaimed sequel.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg', // Пример URL
    price: 9.99,
    isStatic: true,
  },
  {
    id: 'ranchsimulator',
    title: 'Ranch Simulator', // Убрал лишний текст
    genre: 'Simulation, Farming',
    platform: 'PC',
    releaseDate: '2021-03-04', // Early Access
    developer: 'Toxic Dog',
    description: 'Restore your family\'s run-down ranch.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1119730/header.jpg', // Пример URL
    price: 24.99,
    isStatic: true,
  },
  {
    id: 'spiritofthenorth',
    title: 'Spirit of the North',
    genre: 'Adventure, Indie',
    platform: 'PC, PS4, Switch, PS5',
    releaseDate: '2019-11-01',
    developer: 'Infuse Studio',
    description: 'Play as an ordinary red fox whose story becomes entwined with the guardian of the Northern Lights.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/1213700/header.jpg', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'stardewvalley',
    title: 'Stardew Valley',
    genre: 'Farming Sim, RPG',
    platform: 'PC, Consoles, Mobile',
    releaseDate: '2016-02-26',
    developer: 'ConcernedApe',
    description: 'You\'ve inherited your grandfather\'s old farm plot.',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsrBk2PqpPj31EsoYsshaU00pnCxmpZ5n4YA&s', // Пример URL
    price: 14.99,
    isStatic: true,
  },
  {
    id: 'stickfight',
    title: 'Stick Fight: The Game',
    genre: 'Action, Fighting',
    platform: 'PC, Switch, PS4, Xbox One',
    releaseDate: '2017-09-28',
    developer: 'Landfall',
    description: 'A physics-based couch/online fighting game.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/674940/header.jpg', // Пример URL
    price: 4.99,
    isStatic: true,
  },
  {
    id: 'terraria',
    title: 'Terraria',
    genre: 'Action-Adventure, Sandbox',
    platform: 'PC, Consoles, Mobile',
    releaseDate: '2011-05-16',
    developer: 'Re-Logic',
    description: 'Dig, fight, explore, build!',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Terraria_Steam_artwork.jpg/250px-Terraria_Steam_artwork.jpg', // Пример URL
    price: 9.99,
    isStatic: true,
  },
  
  {
    id: 'trickytowers',
    title: 'Tricky Towers',
    genre: 'Puzzle, Physics',
    platform: 'PC, PS4, Xbox One, Switch',
    releaseDate: '2016-08-02',
    developer: 'WeirdBeard',
    description: 'With your brilliant robe and magic powers, it’s time to build some Tricky Towers!',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/437920/header.jpg', // Пример URL
    price: 14.99,
    isStatic: true,
  },
  {
    id: 'tuesdayjs',
    title: 'Tuesday JS visual novel engine', // Предположительно, это не игра, а движок
    genre: 'Tool, Game Engine',
    platform: 'PC',
    releaseDate: 'N/A', // Или дата релиза движка
    developer: 'Tuesday JS Team',
    description: 'An engine for creating visual novels.',
    imageUrl: 'https://img.itch.zone/aW1nLzEzMTEyMDc4LnBuZw==/original/9lnO%2FY.png', 
    price: 0, 
    isStatic: true,
  },
  {
    id: 'ultimatechickenhorse',
    title: 'Ultimate Chicken Horse',
    genre: 'Platformer, Party',
    platform: 'PC, Consoles, Switch',
    releaseDate: '2016-03-04',
    developer: 'Clever Endeavour Games',
    description: 'A party platformer where you build the level as you play.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/386940/header.jpg', // Пример URL
    price: 14.99,
    isStatic: true,
  },
  {
    id: 'valheim',
    title: 'Valheim',
    genre: 'Survival, Sandbox',
    platform: 'PC, Xbox',
    releaseDate: '2021-02-02',
    developer: 'Iron Gate AB',
    description: 'A brutal exploration and survival game inspired by viking culture.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg', // Пример URL
    price: 19.99,
    isStatic: true,
  },
  {
    id: 'wallpaperengine',
    title: 'Wallpaper Engine', // Это приложение, не игра
    genre: 'Utility, Customization',
    platform: 'PC',
    releaseDate: '2018-11-16',
    developer: 'Wallpaper Engine Team',
    description: 'Enables you to use live wallpapers on your Windows desktop.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/431960/header.jpg', // Пример URL
    price: 3.99,
    isStatic: true,
  },
  {
    id: 'worldofwarships',
    title: 'World of Warships',
    genre: 'MMO, Naval Combat',
    platform: 'PC, Consoles',
    releaseDate: '2015-09-17',
    developer: 'Wargaming Group Limited',
    description: 'Immerse yourself in thrilling naval battles.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/552990/header.jpg', // Пример URL
    price: 0, // Free to play
    isStatic: true,
  },
  {
    id: 'zupzero',
    title: 'Zup! Zero',
    genre: 'Puzzle, Indie',
    platform: 'PC',
    releaseDate: '2016-10-28',
    developer: 'Quiet River',
    description: 'Minimalistic puzzle game with portals.',
    imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/533340/header.jpg', // Пример URL
    price: 0.99,
    isStatic: true,
  },
];