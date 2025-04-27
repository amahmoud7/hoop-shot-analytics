
import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';

interface GameHistoryCardProps {
  game: Game;
}

const GameHistoryCard: React.FC<GameHistoryCardProps> = ({ game }) => {
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format duration in seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const points = (game.stats.twoPointMade * 2) + (game.stats.threePointMade * 3);

  return (
    <Link to={`/game/${game.id}`} className="block">
      <div className="bg-white rounded-lg shadow p-4 mb-3 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-navy">Session #{game.id.slice(-4)}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(game.date)}</span>
              <Clock size={14} className="ml-3 mr-1" />
              <span>{formatDuration(game.duration)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-navy">{points}</div>
            <div className="text-xs text-gray-500">POINTS</div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex-1">
            <div className="text-xs text-gray-500">SHOTS</div>
            <div>{game.stats.madeShots}/{game.stats.totalShots}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500">FG%</div>
            <div>{game.stats.shotPercentage.toFixed(1)}%</div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-xs text-gray-500">3PT%</div>
            <div>{game.stats.threePointPercentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameHistoryCard;
