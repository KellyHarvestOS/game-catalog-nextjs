<h1 align="center">🎮 GameHub Catalog</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/6841bdf3-4bab-456a-833b-492ca821caf0" alt="GameHub Catalog" style="border-radius: 1rem; box-shadow: 0 8px 20px rgba(0,0,0,0.3);" width="100%" />
</p>

<p align="center">
  Это современный каталог игр, созданный с использованием <strong>Next.js</strong>, <strong>TypeScript</strong>, <strong>Prisma</strong> и <strong>Tailwind CSS</strong>, вдохновлённый такими платформами, как <em>Steam</em>.
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextauthdotjs&logoColor=white" alt="NextAuth.js" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white" alt="Prettier" />
</p>


## О проекте

GameHub — это веб-приложение, предназначенное для каталогизации видеоигр. Пользователи могут просматривать игры, добавлять новые (если у них есть права администратора) и просматривать детальную информацию о каждой игре. Проект демонстрирует использование современного стека технологий для создания интерактивных веб-приложений.

**Ключевые возможности:**
* Просмотр каталога игр с фильтрацией и поиском.
* Детальные страницы игр с описаниями, скриншотами и другой информацией.
* Регистрация и аутентификация пользователей с использованием NextAuth.js.
* Управление профилем пользователя, включая возможность загрузки аватара.
* CRUD-операции для игр (создание, чтение, обновление, удаление) для администраторов.
* Адаптивный дизайн для удобного использования на различных устройствах.
* Анимированные фоны на некоторых страницах для улучшения пользовательского опыта.

## Используемые технологии

*   **Фронтенд:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **Бэкенд (API Routes):** Next.js API Routes, TypeScript
*   **База данных:** SQL Server(используемая с Prisma)
*   **ORM:** Prisma
*   **Аутентификация:** NextAuth.js
*   **Управление состоянием:** React Context API
*   **Стилизация:** Tailwind CSS
*   **Линтинг/Форматирование:** ESLint, Prettier

## Установка и запуск

1.  Клонируйте репозиторий:
    ```bash
    git clone https://your-repository-url.git
    cd game-catalog-nextjs
    ```
2.  Установите зависимости:
    ```bash
    npm install
    # или
    yarn install
    ```
3.  Настройте переменные окружения. Скопируйте `.env.example` (если есть) в `.env` и заполните необходимые значения (строка подключения к БД, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` и т.д.).
    ```bash
    cp .env.example .env
    ```
4.  Примените миграции Prisma:
    ```bash
    npx prisma migrate dev
    ```
5.  (Опционально) Заполните базу данных начальными данными:
    ```bash
    npx prisma db seed
    ```
6.  Запустите сервер для разработки:
    ```bash
    npm run dev
    # или
    yarn dev
    ```
    Приложение будет доступно по адресу `http://localhost:3000`.


