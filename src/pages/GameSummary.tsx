
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share2, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import CourtView from '@/components/CourtView';
import ShotChart from '@/components/ShotChart';
import StatsCard from '@/components/StatsCard';
import { Shot, GameStats } from '@/lib/types';

const GameSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from tracking page or use mock data
  const { shots = [], stats = null, duration = 0, score = { team1: 0, team2: 0 } } = location.state || {};
  
  // Mock stats if none provided
  const gameStats: GameStats = stats || {
    totalShots: shots.length,
    madeShots: shots.filter((shot: Shot) => shot.isMade).length,
    twoPointAttempts: shots.filter((shot: Shot) => !shot.isThreePoint).length,
    twoPointMade: shots.filter((shot: Shot) => !shot.isThreePoint && shot.isMade).length,
    threePointAttempts: shots.filter((shot: Shot) => shot.isThreePoint).length,
    threePointMade: shots.filter((shot: Shot) => shot.isThreePoint && shot.isMade).length,
    shotPercentage: shots.length > 0 ? (shots.filter((shot: Shot) => shot.isMade).length / shots.length) * 100 : 0,
    twoPointPercentage: shots.filter((shot: Shot) => !shot.isThreePoint).length > 0 ? 
      (shots.filter((shot: Shot) => !shot.isThreePoint && shot.isMade).length / shots.filter((shot: Shot) => !shot.isThreePoint).length) * 100 : 0,
    threePointPercentage: shots.filter((shot: Shot) => shot.isThreePoint).length > 0 ?
      (shots.filter((shot: Shot) => shot.isThreePoint && shot.isMade).length / shots.filter((shot: Shot) => shot.isThreePoint).length) * 100 : 0,
  };
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Game Summary" 
        showBack={true} 
        showMenu={false}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Score section */}
        <div className="bg-navy text-white p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-lg font-bold">Final Score</h2>
              <p className="text-xs text-gray-300">Today • {formatDuration(duration)}</p>
            </div>
            <div className="text-3xl font-bold">{score.team1}</div>
          </div>
        </div>
        
        {/* Shot distribution */}
        <div className="p-4">
          <h3 className="text-navy font-semibold mb-2">Shot Distribution</h3>
          
          <div className="bg-white rounded-lg shadow p-3 mb-4">
            <ShotChart shots={shots} width={340} height={220} />
          </div>
          
          {/* Stats card */}
          <StatsCard stats={gameStats} className="mb-4" />
          
          {/* Shot list summary */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-navy font-semibold mb-3">Shot Timeline</h3>
            
            {shots.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                {[...shots].reverse().map((shot, index) => (
                  <div key={shot.id} className="flex items-center py-1.5 border-b last:border-0">
                    <div className={`w-2 h-2 rounded-full mr-3 ${shot.isMade ? 'bg-teal' : 'bg-red-500'}`}></div>
                    <span className="text-sm flex-1">
                      {shot.isMade ? 'Made' : 'Missed'} {shot.isThreePoint ? '3PT' : '2PT'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(shot.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No shots recorded
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1 gap-2"
            >
              <Share2 size={18} />
              Share
            </Button>
            <Button 
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download size={18} />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Button 
          className="w-full bg-basketball hover:bg-orange-600 text-white h-12"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default GameSummary;
