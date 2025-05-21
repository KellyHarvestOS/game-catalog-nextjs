// contexts/GameContext.tsx
'use client';

import React, { createContext, useReducer, useContext, useCallback, ReactNode } from 'react';
import { Game } from '@/types'; // Game из @/types

// Тип для данных, которые GameForm будет отправлять в addGame/updateGame
// и которые эти функции будут отправлять на API
interface GameApiPayload {
  title: string;
  description: string;
  genre?: string | null;
  platform?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseDate?: string | null; // Строка из формы
  price: number | null;         // Число
  coverImageUrl: string | null; // Отправляем это имя на API
  screenshots?: string[];        // Массив URL-строк
}

// --- Остальная часть вашего GameContext.tsx (GameState, initialState, GameAction, gameReducer) остается такой же, как вы предоставили ---
// ... (вставьте сюда ваш GameState, initialState, GameAction, gameReducer)...
interface FilterOptions {
  genres: string[];
  platforms: string[];
  developers?: string[];
}

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  isLoadingFilterOptions: boolean;
  filterOptionsError: string | null;
}

const initialState: GameState = {
  games: [],
  isLoading: false,
  error: null,
  filterOptions: { genres: [], platforms: [], developers: [] },
  isLoadingFilterOptions: false,
  filterOptionsError: null,
};

type GameAction =
  | { type: 'FETCH_GAMES_REQUEST' }
  | { type: 'FETCH_GAMES_SUCCESS'; payload: Game[] }
  | { type: 'FETCH_GAMES_FAILURE'; payload: string }
  | { type: 'ADD_GAME_REQUEST' }
  | { type: 'ADD_GAME_SUCCESS'; payload: Game }
  | { type: 'ADD_GAME_FAILURE'; payload: string }
  | { type: 'UPDATE_GAME_REQUEST' }
  | { type: 'UPDATE_GAME_SUCCESS'; payload: Game }
  | { type: 'UPDATE_GAME_FAILURE'; payload: string }
  | { type: 'DELETE_GAME_REQUEST' }
  | { type: 'DELETE_GAME_SUCCESS'; payload: string }
  | { type: 'DELETE_GAME_FAILURE'; payload: string }
  | { type: 'FETCH_FILTER_OPTIONS_REQUEST' }
  | { type: 'FETCH_FILTER_OPTIONS_SUCCESS'; payload: FilterOptions }
  | { type: 'FETCH_FILTER_OPTIONS_FAILURE'; payload: string };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'FETCH_GAMES_REQUEST':
    case 'ADD_GAME_REQUEST':
    case 'UPDATE_GAME_REQUEST':
    case 'DELETE_GAME_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_GAMES_SUCCESS':
      return { ...state, isLoading: false, games: action.payload, error: null };
    case 'ADD_GAME_SUCCESS':
      // Убедимся, что добавляем игру в начало списка для немедленного отображения
      return { ...state, isLoading: false, games: [action.payload, ...state.games], error: null };
    case 'UPDATE_GAME_SUCCESS':
      return {
        ...state,
        isLoading: false,
        games: state.games.map(game =>
          game.id === action.payload.id ? action.payload : game
        ),
        error: null,
      };
    case 'DELETE_GAME_SUCCESS':
      return {
        ...state,
        isLoading: false,
        games: state.games.filter(game => game.id !== action.payload), // action.payload здесь ID удаленной игры
        error: null,
      };
    case 'FETCH_GAMES_FAILURE':
    case 'ADD_GAME_FAILURE':
    case 'UPDATE_GAME_FAILURE':
    case 'DELETE_GAME_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_FILTER_OPTIONS_REQUEST':
      return { ...state, isLoadingFilterOptions: true, filterOptionsError: null };
    case 'FETCH_FILTER_OPTIONS_SUCCESS':
      return { ...state, isLoadingFilterOptions: false, filterOptions: action.payload };
    case 'FETCH_FILTER_OPTIONS_FAILURE':
      return { ...state, isLoadingFilterOptions: false, filterOptionsError: action.payload, filterOptions: initialState.filterOptions };
    default:
      // const exhaustiveCheck: never = action; // Для проверки полноты, если нужно
      return state;
  }
};
// --- Конец вставленного кода ---


// ИЗМЕНЕНЫ ТИПЫ АРГУМЕНТОВ И ВОЗВРАЩАЕМЫХ ЗНАЧЕНИЙ
interface GameContextType {
  state: GameState;
  fetchGames: (filterQueryString?: string) => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  addGame: (gameData: GameApiPayload) => Promise<Game | undefined>; // <--- ИЗМЕНЕНО
  updateGame: (id: string, gameData: GameApiPayload) => Promise<Game | undefined>; // <--- ИЗМЕНЕНО (gameData теперь GameApiPayload)
  deleteGame: (id: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const API_BASE_URL = '/api/games';

  const fetchGames = useCallback(async (filterQueryString?: string) => {
    dispatch({ type: 'FETCH_GAMES_REQUEST' });
    try {
      const url = filterQueryString && filterQueryString.length > 0 ? `${API_BASE_URL}?${filterQueryString}` : API_BASE_URL;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} on ${url}` }));
        throw new Error(errorData.message || `Failed to fetch games from ${url}`);
      }
      const data: Game[] = await response.json();
      dispatch({ type: 'FETCH_GAMES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_GAMES_FAILURE', payload: (error as Error).message });
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    dispatch({ type: 'FETCH_FILTER_OPTIONS_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/filter-options`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to fetch filter options');
      }
      const data: FilterOptions = await response.json();
      dispatch({ type: 'FETCH_FILTER_OPTIONS_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_FILTER_OPTIONS_FAILURE', payload: (error as Error).message });
    }
  }, []);

  // ИЗМЕНЕНО: addGame принимает GameApiPayload и возвращает Promise<Game | undefined>
  const addGame = useCallback(async (gameData: GameApiPayload): Promise<Game | undefined> => {
    dispatch({ type: 'ADD_GAME_REQUEST' });
    try {
      const response = await fetch(API_BASE_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(gameData)});
      const newGame = await response.json(); // Сначала получаем JSON
      if (!response.ok) {
        throw new Error(newGame.message || "Failed to add game");
      }
      dispatch({ type: 'ADD_GAME_SUCCESS', payload: newGame as Game }); // newGame должен быть типа Game
      return newGame as Game; // Возвращаем созданную игру
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: 'ADD_GAME_FAILURE', payload: errorMessage });
      // throw error; // Можно перебросить, чтобы GameForm поймал и установил serverError
      return undefined; // Или вернуть undefined, если ошибка уже обработана dispatch
    }
  }, []);

  // ИЗМЕНЕНО: updateGame принимает GameApiPayload и возвращает Promise<Game | undefined>
  const updateGame = useCallback(async (id: string, gameData: GameApiPayload): Promise<Game | undefined> => {
    dispatch({ type: 'UPDATE_GAME_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(gameData)});
      const updatedGame = await response.json(); // Сначала получаем JSON
      if (!response.ok) {
        throw new Error(updatedGame.message || "Failed to update game");
      }
      dispatch({ type: 'UPDATE_GAME_SUCCESS', payload: updatedGame as Game }); // updatedGame должен быть типа Game
      return updatedGame as Game; // Возвращаем обновленную игру
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: 'UPDATE_GAME_FAILURE', payload: errorMessage });
      // throw error;
      return undefined;
    }
  }, []);

  const deleteGame = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_GAME_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || "Failed to delete game");
      }
      dispatch({ type: 'DELETE_GAME_SUCCESS', payload: id });
      // Для deleteGame обычно не нужно возвращать данные игры
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: 'DELETE_GAME_FAILURE', payload: errorMessage });
      throw error; // Перебрасываем, чтобы компонент мог отреагировать, если нужно
    }
  }, []);

  return (
    <GameContext.Provider value={{
        state,
        fetchGames,
        fetchFilterOptions,
        addGame,
        updateGame,
        deleteGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGames = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};