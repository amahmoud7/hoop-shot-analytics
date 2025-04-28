import { useState, useCallback, useEffect } from 'react';
import { Shot } from '../detection/types';
import { GameAnalytics } from '../analytics/types';
import { 
  saveShots, 
  loadShots, 
  saveGame, 
  loadGame, 
  getGamesList, 
  deleteGame, 
  exportAllData, 
  importData 
} from './dataStorage';

interface UseDataStorageProps {
  autoLoad?: boolean;
  storageKey?: string;
  onDataLoaded?: (shots: Shot[]) => void;
}

export const useDataStorage = ({
  autoLoad = true,
  storageKey = 'basketball-shots',
  onDataLoaded
}: UseDataStorageProps = {}) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [savedGames, setSavedGames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load shots on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      loadSavedShots();
    }
    
    // Load games list
    loadGamesList();
  }, [autoLoad]);

  // Load shots from storage
  const loadSavedShots = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedShots = loadShots(storageKey);
      
      if (loadedShots) {
        setShots(loadedShots);
        if (onDataLoaded) {
          onDataLoaded(loadedShots);
        }
      }
    } catch (err) {
      console.error('Error loading shots:', err);
      setError('Failed to load saved shots');
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, onDataLoaded]);

  // Save shots to storage
  const saveCurrentShots = useCallback((shotsToSave: Shot[] = shots) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const success = saveShots(shotsToSave, storageKey);
      
      if (!success) {
        setError('Failed to save shots');
      }
    } catch (err) {
      console.error('Error saving shots:', err);
      setError('Failed to save shots');
    } finally {
      setIsSaving(false);
    }
  }, [shots, storageKey]);

  // Load games list
  const loadGamesList = useCallback(() => {
    try {
      const games = getGamesList();
      setSavedGames(games);
    } catch (err) {
      console.error('Error loading games list:', err);
      setError('Failed to load games list');
    }
  }, []);

  // Save game with analytics
  const saveGameWithAnalytics = useCallback((gameId: string, analytics: GameAnalytics, currentShots: Shot[] = shots) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const gameData = {
        analytics,
        shots: currentShots,
        savedAt: new Date().toISOString()
      };
      
      const success = saveGame(gameData, gameId);
      
      if (success) {
        loadGamesList(); // Refresh games list
      } else {
        setError('Failed to save game');
      }
    } catch (err) {
      console.error('Error saving game:', err);
      setError('Failed to save game');
    } finally {
      setIsSaving(false);
    }
  }, [shots, loadGamesList]);

  // Load a saved game
  const loadSavedGame = useCallback((gameId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gameData = loadGame(gameId);
      
      if (gameData && gameData.shots) {
        setShots(gameData.shots);
        if (onDataLoaded) {
          onDataLoaded(gameData.shots);
        }
        return gameData;
      } else {
        setError('Game data not found or invalid');
        return null;
      }
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  // Delete a saved game
  const deleteSavedGame = useCallback((gameId: string) => {
    try {
      const success = deleteGame(gameId);
      
      if (success) {
        loadGamesList(); // Refresh games list
        return true;
      } else {
        setError('Failed to delete game');
        return false;
      }
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('Failed to delete game');
      return false;
    }
  }, [loadGamesList]);

  // Export all data
  const exportData = useCallback(() => {
    try {
      const exportedData = exportAllData();
      
      if (exportedData) {
        return exportedData;
      } else {
        setError('Failed to export data');
        return null;
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
      return null;
    }
  }, []);

  // Import data
  const importSavedData = useCallback((jsonData: string) => {
    try {
      const success = importData(jsonData);
      
      if (success) {
        loadGamesList(); // Refresh games list
        return true;
      } else {
        setError('Failed to import data');
        return false;
      }
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Failed to import data');
      return false;
    }
  }, [loadGamesList]);

  return {
    shots,
    setShots,
    savedGames,
    isLoading,
    isSaving,
    error,
    loadSavedShots,
    saveCurrentShots,
    saveGameWithAnalytics,
    loadSavedGame,
    deleteSavedGame,
    exportData,
    importSavedData
  };
};
