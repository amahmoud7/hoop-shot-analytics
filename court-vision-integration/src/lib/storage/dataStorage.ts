import { Shot } from '../detection/types';

/**
 * Utility functions for data storage and management
 */

/**
 * Save shots data to localStorage
 */
export const saveShots = (shots: Shot[], key: string = 'basketball-shots'): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(shots));
    return true;
  } catch (error) {
    console.error('Failed to save shots to localStorage:', error);
    return false;
  }
};

/**
 * Load shots data from localStorage
 */
export const loadShots = (key: string = 'basketball-shots'): Shot[] | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as Shot[];
  } catch (error) {
    console.error('Failed to load shots from localStorage:', error);
    return null;
  }
};

/**
 * Save game data to localStorage
 */
export const saveGame = (gameData: any, gameId: string): boolean => {
  try {
    // Get existing games list
    const gamesListStr = localStorage.getItem('basketball-games-list') || '[]';
    const gamesList = JSON.parse(gamesListStr) as string[];
    
    // Add game ID to list if not already present
    if (!gamesList.includes(gameId)) {
      gamesList.push(gameId);
      localStorage.setItem('basketball-games-list', JSON.stringify(gamesList));
    }
    
    // Save game data
    localStorage.setItem(`game_${gameId}`, JSON.stringify(gameData));
    return true;
  } catch (error) {
    console.error('Failed to save game data:', error);
    return false;
  }
};

/**
 * Load game data from localStorage
 */
export const loadGame = (gameId: string): any | null => {
  try {
    const data = localStorage.getItem(`game_${gameId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load game data:', error);
    return null;
  }
};

/**
 * Get list of saved games
 */
export const getGamesList = (): string[] => {
  try {
    const gamesListStr = localStorage.getItem('basketball-games-list') || '[]';
    return JSON.parse(gamesListStr) as string[];
  } catch (error) {
    console.error('Failed to get games list:', error);
    return [];
  }
};

/**
 * Delete a saved game
 */
export const deleteGame = (gameId: string): boolean => {
  try {
    // Remove from games list
    const gamesListStr = localStorage.getItem('basketball-games-list') || '[]';
    const gamesList = JSON.parse(gamesListStr) as string[];
    const updatedList = gamesList.filter(id => id !== gameId);
    localStorage.setItem('basketball-games-list', JSON.stringify(updatedList));
    
    // Remove game data
    localStorage.removeItem(`game_${gameId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete game:', error);
    return false;
  }
};

/**
 * Clear all saved games
 */
export const clearAllGames = (): boolean => {
  try {
    const gamesListStr = localStorage.getItem('basketball-games-list') || '[]';
    const gamesList = JSON.parse(gamesListStr) as string[];
    
    // Remove each game
    gamesList.forEach(gameId => {
      localStorage.removeItem(`game_${gameId}`);
    });
    
    // Clear games list
    localStorage.removeItem('basketball-games-list');
    return true;
  } catch (error) {
    console.error('Failed to clear all games:', error);
    return false;
  }
};

/**
 * Export all data as JSON
 */
export const exportAllData = (): string | null => {
  try {
    const gamesList = getGamesList();
    const games = gamesList.map(gameId => {
      const gameData = loadGame(gameId);
      return { gameId, data: gameData };
    });
    
    const exportData = {
      games,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData);
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

/**
 * Import data from JSON
 */
export const importData = (jsonData: string): boolean => {
  try {
    const importedData = JSON.parse(jsonData);
    
    if (!importedData.games || !Array.isArray(importedData.games)) {
      throw new Error('Invalid import data format');
    }
    
    // Import each game
    importedData.games.forEach((game: any) => {
      if (game.gameId && game.data) {
        saveGame(game.data, game.gameId);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
