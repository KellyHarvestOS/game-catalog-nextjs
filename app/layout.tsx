// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProviderWrapper from "@/contexts/AuthSessionProvider";
import { GameProvider } from "@/contexts/GameContext";
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import './globals.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub Catalog",
  description: "Your next-gen game catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-900 text-slate-100 flex flex-col min-h-screen`}>
        <SessionProviderWrapper>
          <GameProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </GameProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}