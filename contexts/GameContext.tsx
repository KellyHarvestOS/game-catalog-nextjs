// contexts/GameContext.tsx
'use client'; // Если используется в клиентских компонентах Next.js App Router

import React, { createContext, useReducer, useContext, useCallback, ReactNode } from 'react';
import { Game } from '@/types'; // Убедитесь, что тип Game правильно импортирован

// ----- СОСТОЯНИЕ (State) -----
interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  // Можно добавить состояние для отдельной игры, если нужно
  // currentGame: Game | null; 
}

const initialState: GameState = {
  games: [],
  isLoading: false,
  error: null,
  // currentGame: null,
};

// ----- ДЕЙСТВИЯ (Actions) -----
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
  | { type: 'DELETE_GAME_SUCCESS'; payload: string } // payload - id удаленной игры
  | { type: 'DELETE_GAME_FAILURE'; payload: string };
  // Можно добавить действия для получения одной игры:
  // | { type: 'FETCH_GAME_BY_ID_REQUEST' }
  // | { type: 'FETCH_GAME_BY_ID_SUCCESS'; payload: Game }
  // | { type: 'FETCH_GAME_BY_ID_FAILURE'; payload: string };

// ----- РЕДЬЮСЕР (Reducer) -----
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'FETCH_GAMES_REQUEST':
    case 'ADD_GAME_REQUEST':
    case 'UPDATE_GAME_REQUEST':
    case 'DELETE_GAME_REQUEST':
    // case 'FETCH_GAME_BY_ID_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_GAMES_SUCCESS':
      return { ...state, isLoading: false, games: action.payload, error: null };
    case 'ADD_GAME_SUCCESS':
      return { ...state, isLoading: false, games: [...state.games, action.payload], error: null };
    case 'UPDATE_GAME_SUCCESS':
      return {
        ...state,
        isLoading: false,
        games: state.games.map(game =>
          game.id === action.payload.id ? action.payload : game
        ),
        error: null,
        // currentGame: state.currentGame?.id === action.payload.id ? action.payload : state.currentGame,
      };
    case 'DELETE_GAME_SUCCESS':
      return {
        ...state,
        isLoading: false,
        games: state.games.filter(game => game.id !== action.payload),
        error: null,
      };
    // case 'FETCH_GAME_BY_ID_SUCCESS':
    //   return { ...state, isLoading: false, currentGame: action.payload, error: null };

    case 'FETCH_GAMES_FAILURE':
    case 'ADD_GAME_FAILURE':
    case 'UPDATE_GAME_FAILURE':
    case 'DELETE_GAME_FAILURE':
    // case 'FETCH_GAME_BY_ID_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
};

// ----- КОНТЕКСТ (Context) -----
// Тип для значения контекста
interface GameContextType {
  state: GameState;
  // dispatch: React.Dispatch<GameAction>; // Можно экспортировать dispatch, если нужен прямой доступ
  fetchGames: () => Promise<void>;
  addGame: (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Game>; // Возвращает созданную игру
  updateGame: (id: string, gameData: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Game>; // Возвращает обновленную игру
  deleteGame: (id: string) => Promise<void>;
  // fetchGameById: (id: string) => Promise<Game | null>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ----- ПРОВАЙДЕР (Provider) -----
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const API_BASE_URL = '/api/games'; // Ваш базовый URL для API игр

  const fetchGames = useCallback(async () => {
    dispatch({ type: 'FETCH_GAMES_REQUEST' });
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Game[] = await response.json();
      dispatch({ type: 'FETCH_GAMES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_GAMES_FAILURE', payload: (error as Error).message });
    }
  }, []);

  const addGame = async (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game> => {
    dispatch({ type: 'ADD_GAME_REQUEST' });
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to add game`);
      }
      const newGame: Game = await response.json();
      dispatch({ type: 'ADD_GAME_SUCCESS', payload: newGame });
      return newGame;
    } catch (error) {
      const message = (error as Error).message;
      dispatch({ type: 'ADD_GAME_FAILURE', payload: message });
      throw new Error(message); // Перебрасываем ошибку для обработки в компоненте
    }
  };

  const updateGame = async (id: string, gameData: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Game> => {
    dispatch({ type: 'UPDATE_GAME_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT', // Или PATCH, если ваш API это поддерживает для частичного обновления
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to update game`);
      }
      const updatedGame: Game = await response.json();
      dispatch({ type: 'UPDATE_GAME_SUCCESS', payload: updatedGame });
      return updatedGame;
    } catch (error) {
      const message = (error as Error).message;
      dispatch({ type: 'UPDATE_GAME_FAILURE', payload: message });
      throw new Error(message); // Перебрасываем ошибку
    }
  };

  const deleteGame = async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_GAME_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete game`);
      }
      dispatch({ type: 'DELETE_GAME_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'DELETE_GAME_FAILURE', payload: (error as Error).message });
      throw error; // Перебрасываем ошибку
    }
  };

  // Пример функции для получения одной игры (если нужно)
  // const fetchGameById = useCallback(async (id: string): Promise<Game | null> => {
  //   dispatch({ type: 'FETCH_GAME_BY_ID_REQUEST' });
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/${id}`);
  //     if (!response.ok) {
  //       if (response.status === 404) { // Обработка случая "не найдено"
  //         dispatch({ type: 'FETCH_GAME_BY_ID_FAILURE', payload: 'Game not found' });
  //         return null;
  //       }
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data: Game = await response.json();
  //     dispatch({ type: 'FETCH_GAME_BY_ID_SUCCESS', payload: data });
  //     return data;
  //   } catch (error) {
  //     dispatch({ type: 'FETCH_GAME_BY_ID_FAILURE', payload: (error as Error).message });
  //     return null; // или throw error;
  //   }
  // }, []);

  return (
    <GameContext.Provider value={{ state, fetchGames, addGame, updateGame, deleteGame /*, fetchGameById */ }}>
      {children}
    </GameContext.Provider>
  );
};

// ----- ХУК (Hook) -----
export const useGames = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};