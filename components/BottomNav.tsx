import React from 'react';
import { Home, Heart, PlusCircle, MessageSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <Link to="/home" className={`flex flex-col items-center gap-1 ${isActive('/home') ? 'text-primary-600' : 'text-gray-400'}`}>
          <Home size={24} strokeWidth={isActive('/home') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link to="/saved" className={`flex flex-col items-center gap-1 ${isActive('/saved') ? 'text-primary-600' : 'text-gray-400'}`}>
          <Heart size={24} strokeWidth={isActive('/saved') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Saved</span>
        </Link>
        
        <Link to="/sell" className="flex flex-col items-center -mt-8">
          <div className="bg-primary-500 text-white p-3 rounded-full shadow-lg shadow-primary-200 hover:scale-105 transition-transform">
            <PlusCircle size={32} />
          </div>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Sell</span>
        </Link>
        
        <Link to="/messages" className={`flex flex-col items-center gap-1 ${isActive('/messages') ? 'text-primary-600' : 'text-gray-400'}`}>
          <MessageSquare size={24} strokeWidth={isActive('/messages') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary-600' : 'text-gray-400'}`}>
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
