
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Basketball, History, BarChart2, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "CourtVision",
  showBack = false,
  showMenu = true,
  className
}) => {
  return (
    <header className={cn(
      "flex items-center justify-between py-4 px-4 bg-navy text-white sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center gap-2">
        {showBack ? (
          <Link to="/" className="mr-2 hover:bg-opacity-80 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
        ) : (
          <Basketball className="text-basketball" size={24} />
        )}
        <h1 className="font-bold text-xl">{title}</h1>
      </div>

      {showMenu && (
        <div className="flex items-center gap-4">
          <Link to="/history" className="hover:text-teal">
            <History size={20} />
          </Link>
          <Link to="/stats" className="hover:text-teal">
            <BarChart2 size={20} />
          </Link>
          <Link to="/settings" className="hover:text-teal">
            <Settings size={20} />
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
