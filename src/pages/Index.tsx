
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Play, History, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <div className="bg-navy text-white px-4 pb-8 pt-4 rounded-b-3xl">
          <h1 className="text-3xl font-bold mb-2">CourtVision</h1>
          <p className="text-gray-300 mb-6">Track your shots. Improve your game.</p>
          
          <Link to="/tracking">
            <Button className="w-full bg-basketball hover:bg-orange-600 text-white flex items-center justify-center gap-2 h-12 rounded-xl">
              <Camera size={20} />
              <span className="font-medium">Start Tracking</span>
            </Button>
          </Link>
        </div>
        
        {/* Feature cards */}
        <div className="px-4 py-6">
          <h2 className="text-xl font-semibold text-navy mb-4">Quick Start</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/calibration" className="block">
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Play size={24} className="text-purple-700" />
                </div>
                <h3 className="font-semibold mb-1">New Session</h3>
                <p className="text-sm text-gray-600">Calibrate court and start tracking shots</p>
              </div>
            </Link>
            
            <Link to="/history" className="block">
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <History size={24} className="text-blue-700" />
                </div>
                <h3 className="font-semibold mb-1">History</h3>
                <p className="text-sm text-gray-600">View your past shooting sessions</p>
              </div>
            </Link>
            
            <Link to="/stats" className="block">
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <BarChart2 size={24} className="text-teal-700" />
                </div>
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-gray-600">Detailed stats and shot analytics</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Recent activity section */}
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-navy">Recent Activity</h2>
            <Link to="/history" className="text-basketball text-sm font-medium">View All</Link>
          </div>
          
          {/* Empty state for demo */}
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Basketball size={32} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-navy mb-1">No sessions yet</h3>
            <p className="text-sm text-gray-600 mb-4">Track your first shooting session to see stats here</p>
            <Link to="/calibration">
              <Button variant="outline" className="text-basketball border-basketball hover:bg-basketball hover:text-white">
                Start Tracking
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
