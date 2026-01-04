
import React from 'react';
import { MenuIcon, CreditIcon, LinkIcon, SparklesIcon, BrainIcon } from './icons';
import { User } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  webAccessEnabled: boolean;
  onToggleWebAccess: () => void;
  user: User;
  isSavingMemory?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, webAccessEnabled, onToggleWebAccess, user, isSavingMemory }) => {
  const FREE_MESSAGE_LIMIT = 6;
  const creditsDisplay = user.plan === 'Pro' 
    ? 'Unlimited' 
    : `${Math.max(0, FREE_MESSAGE_LIMIT - user.messageCount)} left`;

  return (
    <header className="flex items-center justify-between p-4 bg-light-secondary dark:bg-secondary border-b border-light-accent dark:border-accent h-16 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-1 rounded-md text-light-text-main dark:text-text-main hover:bg-light-accent dark:hover:bg-accent/80 md:hidden">
            <MenuIcon className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-highlight" />
            <span className="font-bold text-xl text-light-text-main dark:text-text-main">UF AI</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {isSavingMemory && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-highlight/10 text-highlight animate-pulse border border-highlight/20">
            <BrainIcon className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Saving Memory...</span>
          </div>
        )}
        <button 
            onClick={onToggleWebAccess} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                webAccessEnabled 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-light-accent/50 dark:bg-accent/50 text-light-text-main dark:text-text-main hover:bg-light-accent dark:hover:bg-accent'
            }`}
        >
            <LinkIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Web Access</span>
        </button>
        <div className="flex items-center space-x-2 text-sm bg-light-accent/50 dark:bg-accent/50 px-3 py-1.5 rounded-full">
            <CreditIcon className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-light-text-main dark:text-text-main">{creditsDisplay}</span>
        </div>
      </div>
    </header>
  );
};
