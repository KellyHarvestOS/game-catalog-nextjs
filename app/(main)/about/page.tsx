// app/(main)/about/page.tsx
// import { CubeTransparentIcon, CodeBracketIcon, CheckBadgeIcon, UserCircleIcon } from '@heroicons/react/24/outline'; // Пример иконок

const TechItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <svg className="flex-shrink-0 h-5 w-5 text-indigo-400 mr-2 mt-1" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span className="text-slate-300">{children}</span>
  </li>
);

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <svg className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-1" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span className="text-slate-300">{children}</span>
  </li>
);

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-12 md:mb-16">
        {/* <CubeTransparentIcon className="h-20 w-20 text-indigo-400 mx-auto mb-4" /> */}
        <div className="text-6xl mb-4 mx-auto w-fit">🚀</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100">
          О Проекте <span className="text-indigo-400">GameHub</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
          <strong>GameHub</strong> — это современное веб-приложение, созданное для демонстрации
          возможностей каталогизации видеоигр, вдохновленное платформами вроде Steam.
        </p>
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
        <section className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
          {/* <CodeBracketIcon className="h-10 w-10 text-indigo-400 mb-4" /> */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-indigo-300">Технологический Стек</h2>
          <ul className="space-y-3">
            <TechItem>React (Next.js 14+ App Router)</TechItem>
            <TechItem>TypeScript для статической типизации</TechItem>
            <TechItem>Tailwind CSS для стилизации UI</TechItem>
            <TechItem>React Context API для управления глобальным состоянием</TechItem>
            <TechItem>Next.js API Routes (имитация бэкенда с in-memory DB)</TechItem>
          </ul>
        </section>

        <section className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
          {/* <CheckBadgeIcon className="h-10 w-10 text-green-400 mb-4" /> */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-300">Ключевые Возможности</h2>
          <ul className="space-y-3">
            <FeatureItem>Просмотр обширного каталога игр</FeatureItem>
            <FeatureItem>Детальная информация по каждой игре</FeatureItem>
            <FeatureItem>Удобное добавление новых игр в каталог</FeatureItem>
            <FeatureItem>Возможность удаления игр</FeatureItem>
            <FeatureItem>Полностью адаптивный дизайн</FeatureItem>
          </ul>
        </section>
      </div>

      <footer className="mt-12 md:mt-16 pt-8 border-t border-slate-700 text-center">
        {/* <UserCircleIcon className="h-8 w-8 text-slate-500 mx-auto mb-2" /> */}
        <p className="text-slate-500">
          Разработано с ❤️ как учебный проект для демонстрации навыков.
        </p>
        <p className="text-xs text-slate-600 mt-2">
          GameHub © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}