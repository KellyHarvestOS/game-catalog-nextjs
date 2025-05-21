// app/(main)/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';
// import { Gamepad2Icon, SearchIcon, PlusCircleIcon, ListChecksIcon, InfoIcon, SmartphoneIcon } from 'lucide-react'; // Пример иконок, если решите использовать

const features = [
  {
    name: 'Обширный Каталог',
    description: 'Просматривайте тысячи игр с подробной информацией и удобным поиском.',
    // icon: SearchIcon,
    iconPlaceholder: '🔍',
  },
  {
    name: 'Добавляйте Новинки',
    description: 'Легко делитесь информацией о новых играх, пополняя нашу общую базу.',
    // icon: PlusCircleIcon,
    iconPlaceholder: '➕',
  },
  {
    name: 'Актуальная Информация', // Было "Удаление игр", что не совсем отражает суть для пользователя
    description: 'Управляйте контентом, поддерживая каталог в актуальном и достоверном состоянии.',
    // icon: ListChecksIcon, // Иконка проверки или управления
    iconPlaceholder: '📊', // Или другая подходящая
  },
  {
    name: 'Все Детали Об Игре',
    description: 'Получайте полную информацию: описания, жанры, платформы, скриншоты и многое другое.',
    // icon: InfoIcon,
    iconPlaceholder: 'ℹ️',
  },
  {
    name: 'Адаптивность',
    description: 'Наслаждайтесь комфортным использованием GameHub на любом устройстве, будь то ПК или смартфон.',
    // icon: SmartphoneIcon,
    iconPlaceholder: '📱💻',
  },
];

export default function HomePage() {
 
  const heroBackgroundImage = '3.png'; 

  return (
    <div className="flex flex-col"> 
    <section
      className="relative flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 md:py-40 lg:py-48 text-white overflow-hidden min-h-[70vh] sm:min-h-[80vh]"
      style={{
        backgroundImage: `url(${heroBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-slate-900/70 md:bg-slate-900/75 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6 text-5xl sm:text-6xl text-indigo-400 animate-pulse mx-auto w-fit">🎮</div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Добро пожаловать в <span className="text-indigo-400">GameHub</span>!
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto">
          Ваш лучший портал для поиска, открытия и добавления информации о любимых играх.
        </p>

     <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-12">
            <Link
              href="/games"
              className={`
                inline-block relative
                px-12 py-6 sm:px-16 sm:py-8
                text-xl sm:text-2xl md:text-3xl font-extrabold
                text-white
                tracking-wider
                rounded-2xl
                shadow-2xl
                overflow-hidden
                transition-all duration-300 ease-out
                transform hover:scale-110 hover:shadow-purple-500/50
                focus:outline-none focus:ring-4 focus:ring-purple-500/60 focus:ring-offset-2 focus:ring-offset-slate-900
                button-lava-animated
              `}
            >
              <span className="relative z-10">
                Смотреть каталог
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Предполагаем, что остальная часть приложения остается темной. Если нет - адаптируйте фон. */}
      <section className="py-16 md:py-24 bg-slate-900"> 
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-indigo-300">
            Ключевые Возможности GameHub
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-slate-800 p-6 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 flex flex-col" // Добавил flex flex-col
              >
                <div className="flex items-center mb-4">
                  {feature.iconPlaceholder && (
                    <span className="text-3xl sm:text-4xl p-3 bg-slate-700 rounded-lg mr-4 text-indigo-400">
                      {feature.iconPlaceholder}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-100">{feature.name}</h3>
                </div>
                <p className="text-slate-400 text-sm sm:text-base flex-grow">{feature.description}</p> {/* flex-grow для выравнивания высоты карточек */}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}