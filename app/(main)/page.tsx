// app/(main)/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';
// Предположим, у вас есть или вы можете добавить иконки, например, из heroicons
// import { MagnifyingGlassIcon, PlusCircleIcon, TrashIcon, InformationCircleIcon, DevicePhoneMobileIcon, GameControllerIcon } from '@heroicons/react/24/outline'; // Пример

// Если у вас нет ../globals.css или он пустой, убедитесь, что базовые стили для body (фон, цвет текста) заданы там или в layout.tsx
// import '../globals.css'; // Уже есть

const features = [
  {
    name: 'Обширный Каталог',
    description: 'Просматривайте тысячи игр с подробной информацией и удобным поиском.',
    // icon: MagnifyingGlassIcon, // Пример иконки
    iconPlaceholder: '🔍', // Заглушка для иконки
  },
  {
    name: 'Добавляйте Новинки',
    description: 'Легко делитесь информацией о новых играх, пополняя нашу общую базу.',
    // icon: PlusCircleIcon,
    iconPlaceholder: '➕',
  },
  {
    name: 'Актуальная Информация',
    description: 'Удаляйте устаревшие или неверные данные, поддерживая каталог в актуальном состоянии.',
    // icon: TrashIcon,
    iconPlaceholder: '🗑️',
  },
  {
    name: 'Все Детали Об Игре',
    description: 'Получайте полную информацию: описания, жанры, платформы, скриншоты и многое другое.',
    // icon: InformationCircleIcon,
    iconPlaceholder: 'ℹ️',
  },
  {
    name: 'Адаптивность',
    description: 'Наслаждайтесь комфортным использованием GameHub на любом устройстве, будь то ПК или смартфон.',
    // icon: DevicePhoneMobileIcon,
    iconPlaceholder: '📱💻',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] flex flex-col"> {/* Задаем минимальную высоту, чтобы контент занимал экран */}
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        {/* <GameControllerIcon className="h-24 w-24 text-indigo-400 mb-6" /> Пример иконки для заголовка */}
        <div className="mb-6 text-6xl text-indigo-400 animate-pulse">🎮</div> {/* Простая иконка-эмодзи как пример */}
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Добро пожаловать в <span className="text-indigo-400">GameHub</span>!
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl">
          Ваш лучший портал для поиска, открытия и добавления информации о любимых играх.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/games">
            <Button variant="primary" className="px-8 py-4 text-lg w-full sm:w-auto">
              {/* <MagnifyingGlassIcon className="h-5 w-5 mr-2" /> */}
              Смотреть каталог
            </Button>
          </Link>
          <Link href="/games/add">
            <Button variant="secondary" className="px-8 py-4 text-lg w-full sm:w-auto">
              {/* <PlusCircleIcon className="h-5 w-5 mr-2" /> */}
              Добавить игру
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-slate-900"> {/* Чуть другой фон для разделения секций */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-indigo-300">
            Ключевые Возможности GameHub
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-slate-800 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center mb-4">
                  {/* {feature.icon && <feature.icon className="h-10 w-10 text-indigo-400 mr-4" />} */}
                  {feature.iconPlaceholder && <span className="text-3xl mr-4">{feature.iconPlaceholder}</span>}
                  <h3 className="text-2xl font-semibold text-slate-100">{feature.name}</h3>
                </div>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}