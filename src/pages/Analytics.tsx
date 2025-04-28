import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/StatsCard';
import ShotChart from '@/components/ShotChart';
import { useAnalytics, useDataStorage, ShotStats } from '@/lib/courtVision';

const Analytics = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const { savedGames, loadSavedGame } = useDataStorage();
  const { generateStats, generateShotChart, generateHeatmap } = useAnalytics({
    autoUpdate: false
  });
  
  const [gameData, setGameData] = useState<any>(null);
  const [stats, setStats] = useState<ShotStats | null>(null);
  
  useEffect(() => {
    // Load the games list on component mount
    if (savedGames.length > 0 && !selectedGameId) {
      setSelectedGameId(savedGames[0]);
    }
  }, [savedGames]);
  
  useEffect(() => {
    if (selectedGameId) {
      const data = loadSavedGame(selectedGameId);
      setGameData(data);
      
      if (data && data.shots) {
        const shotStats = generateStats();
        setStats(shotStats);
      }
    }
  }, [selectedGameId, loadSavedGame, generateStats]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Analytics Dashboard" />
      
      <div className="container p-4 mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shots">Shot Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <StatsCard stats={stats} />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No stats available. Complete a tracking session first.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Shot Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {gameData?.shots?.length > 0 ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md mb-2 text-sm">
                          {gameData.shots.filter(s => s.isMade).length} Made
                        </div>
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                          {gameData.shots.filter(s => !s.isMade).length} Missed
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No shot data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="shots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shot Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {gameData?.shots?.length > 0 ? (
                  <div className="flex justify-center">
                    <ShotChart shots={gameData.shots} width={400} height={300} />
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No shot data available. Complete a tracking session first.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shot Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold">{stats.totalShots}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-sm text-gray-500">Made</p>
                      <p className="text-2xl font-bold text-green-600">{stats.madeShots}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-sm text-gray-500">FG%</p>
                      <p className="text-2xl font-bold">{stats.shotPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-sm text-gray-500">3PT%</p>
                      <p className="text-2xl font-bold">{stats.threePointPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No stats available. Complete a tracking session first.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
