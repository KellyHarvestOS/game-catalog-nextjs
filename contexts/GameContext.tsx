// contexts/GameContext.tsx
'use client';

import React, { createContext, useReducer, useContext, useCallback, ReactNode } from 'react';
import { Game } from '@/types';

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  games: [],
  isLoading: false,
  error: null,
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
  | { type: 'DELETE_GAME_FAILURE'; payload: string };

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
      return { ...state, isLoading: false, games: [...state.games, action.payload], error: null };
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
        games: state.games.filter(game => game.id !== action.payload),
        error: null,
      };

    case 'FETCH_GAMES_FAILURE':
    case 'ADD_GAME_FAILURE':
    case 'UPDATE_GAME_FAILURE':
    case 'DELETE_GAME_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  fetchGames: () => Promise<void>;
  addGame: (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'purchasedByUsers'>) => Promise<Game>; // Адаптируйте Omit под вашу модель
  updateGame: (id: string, gameData: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'purchasedByUsers'>>) => Promise<Game>;
  deleteGame: (id: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const API_BASE_URL = '/api/games';

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

  const addGame = async (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'purchasedByUsers'>): Promise<Game> => {
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
      throw new Error(message);
    }
  };

  const updateGame = async (id: string, gameData: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'purchasedByUsers'>>): Promise<Game> => {
    dispatch({ type: 'UPDATE_GAME_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
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
      throw new Error(message);
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
      throw error;
    }
  };

  return (
    <GameContext.Provider value={{ state, fetchGames, addGame, updateGame, deleteGame }}>
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