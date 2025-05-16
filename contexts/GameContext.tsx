// contexts/GameContext.tsx
'use client';
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Game } from '@/types';

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: string } // payload is game id
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: GameState = {
  games: [],
  isLoading: true,
  error: null,
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  addGame: (gameData: Omit<Game, 'id'>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  fetchGames: () => Promise<void>;
} | undefined>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAMES':
      return { ...state, games: action.payload, isLoading: false, error: null };
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] };
    case 'DELETE_GAME':
      return { ...state, games: state.games.filter(game => game.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const fetchGames = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      dispatch({ type: 'SET_GAMES', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };
  
  useEffect(() => {
    fetchGames();
  }, []);


  const addGame = async (gameData: Omit<Game, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add game');
      }
      const newGame = await response.json();
      dispatch({ type: 'ADD_GAME', payload: newGame });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteGame = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete game');
      dispatch({ type: 'DELETE_GAME', payload: id });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, addGame, deleteGame, fetchGames }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};