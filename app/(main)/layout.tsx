
// app/(main)/layout.tsx
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { GameProvider } from '@/contexts/GameContext'; // Обернем все в провайдер

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider> {/* Оборачиваем здесь, чтобы контекст был доступен на всех страницах группы (main) */}
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </GameProvider>
  );
}