// components/ui/Navbar.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Button from './Button';

interface NavItemType {
  href: string;
  label: string;
  Icon?: React.ElementType;
  adminOnly?: boolean;
  loggedInOnly?: boolean;
  loggedOutOnly?: boolean;
}

const NavLink = ({
  href,
  children,
  Icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  Icon?: React.ElementType;
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
  const { data: session, status } = useSession();
  console.log('Navbar --- Session Data:', JSON.stringify(session, null, 2), '--- Status:', status);
  const isLoadingSession = status === 'loading';
  const userRole = (session?.user as { role?: string })?.role;

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

  const allNavItems: NavItemType[] = [
    { href: '/', label: 'Главная' },
    { href: '/games', label: 'Каталог Игр' },
    { href: '/about', label: 'О Приложении' },
    { href: '/games/add', label: 'Добавить Игру', adminOnly: true },
    { href: '/profile', label: 'Профиль', loggedInOnly: true },
  ];

  const navItemsToDisplay = allNavItems.filter(item => {
    if (isLoadingSession) return false;
    if (item.adminOnly && userRole !== 'ADMIN') return false;
    if (item.loggedInOnly && !session) return false;
    if (item.loggedOutOnly && session) return false;
    return true;
  });

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
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItemsToDisplay.map(item => (
              <NavLink key={item.href} href={item.href} Icon={item.Icon}>
                {item.label}
              </NavLink>
            ))}
            {!isLoadingSession && (
              <>
                {session?.user ? (
                  <Button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant="danger"
                    size="sm"
                    className="text-sm ml-2"
                  >
                    Выйти
                  </Button>
                ) : (
                  <>
                    <NavLink href="/login">Войти</NavLink>
                    <Link href="/register" className="ml-2">
                      <Button variant="primary" size="sm" className="text-sm">
                        Регистрация
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="md:hidden flex items-center">
            {!isLoadingSession && session?.user && (
                 <Button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant="danger"
                    size="sm"
                    className="text-sm mr-2 py-1 px-2"
                  >
                    Выйти
                  </Button>
            )}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Открыть главное меню</span>
              {isMobileMenuOpen ? (
                <span className="text-2xl">✕</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 shadow-lg z-40" id="mobile-menu">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navItemsToDisplay.map(item => (
              <NavLink key={item.href} href={item.href} Icon={item.Icon} onClick={closeMobileMenu}>
                {item.label}
              </NavLink>
            ))}
            {!isLoadingSession && !session?.user && (
              <>
                <NavLink href="/login" onClick={closeMobileMenu}>Войти</NavLink>
                <div className="px-1 py-1">
                  <Link href="/register" onClick={closeMobileMenu} className="block">
                    <Button variant="primary" size="sm" className="text-sm w-full">
                      Регистрация
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
export default Navbar;