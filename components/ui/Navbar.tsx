// components/ui/Navbar.tsx (или components/Navbar.tsx)
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// Закомментируйте или удалите, если не используете реальные иконки
// import { Gamepad2, LayoutGrid, PlusCircle, Info, Menu, X, type LucideIcon } from 'lucide-react';

// Интерфейс для элемента навигации
interface NavItemType {
  href: string;
  label: string;
  Icon?: React.ElementType; // Icon теперь опциональный
}

// Улучшенный NavLink с более выраженным активным состоянием
const NavLink = ({
  href,
  children,
  Icon,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  Icon?: React.ElementType; // Icon опциональный здесь тоже
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 ease-in-out
        group
        ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }
      `}
    >
      {Icon && <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />}
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Теперь явно указываем тип для массива navItems
  const navItems: NavItemType[] = [
    { href: '/', label: 'Главная' /*, Icon: LayoutGrid */ }, // Icon может быть undefined
    { href: '/games', label: 'Каталог Игр' /*, Icon: LayoutGrid */ },
    { href: '/games/add', label: 'Добавить Игру' /*, Icon: PlusCircle */ },
    { href: '/about', label: 'О Приложении' /*, Icon: Info */ },
  ];
  // Если вы хотите использовать реальные иконки, раскомментируйте их:
  /*
  const navItems: NavItemType[] = [
    { href: '/', label: 'Главная', Icon: LayoutGrid },
    { href: '/games', label: 'Каталог Игр', Icon: LayoutGrid },
    { href: '/games/add', label: 'Добавить Игру', Icon: PlusCircle },
    { href: '/about', label: 'О Приложении', Icon: Info },
  ];
  */


  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-xl bg-slate-900/80 backdrop-blur-lg' : 'bg-slate-900'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
           <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
          <Image
              src="/2.png"    
              alt="GameHub Logo"    
              width={100} 
              height={100} 
              
              priority           
            /> </Link>
         

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map(item => (
              // TypeScript теперь должен знать, что item.Icon может существовать (или быть undefined)
              <NavLink key={item.href} href={item.href} Icon={item.Icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Открыть главное меню</span>
              {isMobileMenuOpen ? (
                <span className="text-2xl">✕</span> // <X className="block h-7 w-7" />
              ) : (
                <span className="text-2xl">☰</span> // <Menu className="block h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 shadow-lg z-40" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navItems.map(item => (
              // TypeScript теперь должен знать, что item.Icon может существовать (или быть undefined)
              <NavLink key={item.href} href={item.href} Icon={item.Icon} onClick={closeMobileMenu}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;