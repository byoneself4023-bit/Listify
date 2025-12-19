
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  viewTitle: string;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ viewTitle, user }) => {
  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
      <h2 className="text-lg font-medium capitalize text-white">
        {viewTitle}
      </h2>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-white">{user.nickname}</p>
          <p className="text-xs text-zinc-400">{user.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800">
          <img 
            src={user.profile_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname}`} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
