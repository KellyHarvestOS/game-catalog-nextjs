// app/(main)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">О приложении GameHub</h1>
      <p className="text-gray-300 mb-4">
        <strong>GameHub</strong> - это демонстрационное одностраничное веб-приложение (SPA),
        созданное для каталогизации видеоигр, подобно Steam.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-3 text-indigo-300">Технологический стек:</h2>
      <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
        <li>React (с использованием Next.js 14+ App Router)</li>
        <li>TypeScript</li>
        <li>Tailwind CSS</li>
        <li>React Context API для управления состоянием</li>
        <li>Next.js API Routes для имитации бэкенда (in-memory DB)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-3 text-indigo-300">Функциональность:</h2>
      <ul className="list-disc list-inside text-gray-400 space-y-1">
        <li>Просмотр списка игр</li>
        <li>Просмотр детальной информации о каждой игре</li>
        <li>Добавление новых игр в каталог</li>
        <li>Удаление игр из каталога</li>
        <li>Адаптивная верстка для различных устройств</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">
        Разработано в качестве учебного проекта.
      </p>
    </div>
  );
}