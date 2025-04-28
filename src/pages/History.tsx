
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import GameHistoryCard from '@/components/GameHistoryCard';
import { Game } from '@/lib/types';

const History = () => {
  // Mock data for the history page
  const mockGames: Game[] = [
    {
      id: 'game_1234',
      date: '2025-04-25T14:30:00',
      duration: 540, // 9 minutes in seconds
      shots: [],
      stats: {
        totalShots: 32,
        madeShots: 18,
        missedShots: 14, // Added missing property
        twoPointAttempts: 22,
        twoPointMade: 14,
        threePointAttempts: 10,
        threePointMade: 4,
        shotPercentage: 56.3,
        twoPointPercentage: 63.6,
        threePointPercentage: 40.0,
        pointsScored: 42 // Added missing property
      },
      location: "Downtown Rec Center"
    },
    {
      id: 'game_5678',
      date: '2025-04-23T09:15:00',
      duration: 720, // 12 minutes in seconds
      shots: [],
      stats: {
        totalShots: 45,
        madeShots: 21,
        missedShots: 24, // Added missing property
        twoPointAttempts: 31,
        twoPointMade: 17,
        threePointAttempts: 14,
        threePointMade: 4,
        shotPercentage: 46.7,
        twoPointPercentage: 54.8,
        threePointPercentage: 28.6,
        pointsScored: 42 // Added missing property
      },
      location: "YMCA Court 3"
    },
    {
      id: 'game_9012',
      date: '2025-04-20T16:00:00',
      duration: 600, // 10 minutes in seconds
      shots: [],
      stats: {
        totalShots: 28,
        madeShots: 16,
        missedShots: 12, // Added missing property
        twoPointAttempts: 18,
        twoPointMade: 12,
        threePointAttempts: 10,
        threePointMade: 4,
        shotPercentage: 57.1,
        twoPointPercentage: 66.7,
        threePointPercentage: 40.0,
        pointsScored: 36 // Added missing property
      },
      location: "Home Driveway"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Game History" showBack={true} />
      
      <div className="p-4">
        {/* Search area */}
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search sessions" 
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter size={18} />
            </Button>
          </div>
        </div>
        
        {/* Month headings */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-basketball" />
          <h3 className="text-sm font-medium text-navy">April 2025</h3>
        </div>
        
        {/* Game history cards */}
        {mockGames.map((game) => (
          <GameHistoryCard key={game.id} game={game} />
        ))}
        
        {/* Earlier month */}
        <div className="flex items-center gap-2 mt-6 mb-3">
          <Calendar size={16} className="text-basketball" />
          <h3 className="text-sm font-medium text-navy">March 2025</h3>
        </div>
        
        {/* Empty state for earlier months */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No recorded sessions in March</p>
        </div>
      </div>
    </div>
  );
};

export default History;
