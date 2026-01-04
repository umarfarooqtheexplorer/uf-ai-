
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, User, Project, TabId, Avatar } from '../types';
import { 
    PenIcon, SearchIcon, LibraryIcon, ProjectsIcon, SettingsIcon, 
    MessageSquareIcon, UserPlusIcon, LogoutIcon, TrashIcon, PlusIcon
} from './icons';

interface SidebarProps {
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onNewAvatarChat: (avatar: Avatar) => void;
  onEditAvatar?: (avatar: Avatar) => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  user: User | null;
  onOpenSettings: (tab: TabId, editMode?: boolean) => void;
  onOpenProjectModal: () => void;
  projects: Project[];
  onLogout: () => void;
  avatars: Avatar[];
  onOpenCreateAvatar?: () => void;
}

const SidebarMenuItem: React.FC<{ icon: React.FC<{className?:string}>, label: string, onClick?: () => void }> = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-2 rounded-md text-sm text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main transition-colors duration-200">
        <Icon className="w-5 h-5 mr-3 shrink-0" />
        <span className="truncate font-medium">{label}</span>
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ chatHistory, activeChatId, onSelectChat, onNewChat, onNewAvatarChat, onEditAvatar, onDeleteChat, isOpen, user, onOpenSettings, onOpenProjectModal, projects, onLogout, avatars, onOpenCreateAvatar }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`w-72 bg-light-secondary dark:bg-secondary flex flex-col p-2 border-r border-light-accent dark:border-accent 
      fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
      md:static md:flex md:shrink-0 md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
        <div className="flex flex-col h-full">
            <div className="p-2 mb-2">
                <div className="flex flex-col space-y-2">
                    <SidebarMenuItem icon={PenIcon} label="New chat" onClick={onNewChat} />
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-gray-500 pointer-events-none" />
                        <input 
                            type="text"
                            placeholder="Search chats"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-light-primary dark:bg-primary/50 border border-light-accent dark:border-accent rounded-md pl-9 pr-3 py-1.5 text-sm text-light-text-main dark:text-text-main placeholder-light-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-highlight"
                        />
                    </div>
                </div>
            </div>

            <div className="px-2 mb-4 overflow-y-auto">
                <h3 className="px-2 text-xs font-semibold text-light-text-muted dark:text-gray-500 uppercase tracking-wider mb-2">AI Avatars</h3>
                <div className="grid grid-cols-4 gap-x-2 gap-y-4 justify-items-center px-2">
                    <button 
                        onClick={onOpenCreateAvatar}
                        className="flex flex-col items-center gap-1 text-center group"
                        title="Add Custom Avatar"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-light-accent dark:border-accent group-hover:border-highlight flex items-center justify-center bg-light-primary dark:bg-primary transition-colors">
                            <PlusIcon className="w-6 h-6 text-light-text-muted dark:text-gray-400 group-hover:text-highlight" />
                        </div>
                        <p className="text-[10px] w-full text-light-text-muted dark:text-gray-400 group-hover:text-highlight truncate font-bold">ADD</p>
                    </button>

                    {avatars.map(avatar => {
                        const isCustom = avatar.id.startsWith('custom');
                        return (
                            <div key={avatar.id} className="relative group">
                                <button 
                                    onClick={() => onNewAvatarChat(avatar)}
                                    className="flex flex-col items-center gap-1 text-center group animate-fade-in"
                                    title={`Chat with ${avatar.name}`}
                                >
                                    <img src={avatar.imageUrl} alt={avatar.name} className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-highlight object-cover shadow-sm transition-all"/>
                                    <p className="text-[10px] w-full text-light-text-muted dark:text-gray-400 group-hover:text-light-text-main dark:group-hover:text-text-main truncate font-medium">{avatar.name.split(' ')[0]}</p>
                                </button>
                                {isCustom && onEditAvatar && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditAvatar(avatar);
                                        }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-highlight text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        title="Edit Persona"
                                    >
                                        <PenIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                 <h3 className="px-4 text-xs font-semibold text-light-text-muted dark:text-gray-500 uppercase tracking-wider mb-2">Recent</h3>
                <nav className="flex flex-col space-y-1">
                {filteredChats.map((chat) => (
                    <div key={chat.id} className="group relative flex items-center">
                        <button
                            onClick={() => onSelectChat(chat.id)}
                            className={`flex items-center p-2 rounded-md text-sm truncate transition-colors duration-200 w-full text-left ${
                                activeChatId === chat.id ? 'bg-accent text-white' : 'text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50'
                            }`}
                        >
                            <MessageSquareIcon className="w-4 h-4 mr-3 shrink-0" />
                            <span className="truncate">{chat.title}</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-light-text-muted dark:text-gray-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                </nav>
            </div>

            <div className="p-2 mt-2 border-t border-light-accent dark:border-accent relative">
                {user && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 overflow-hidden flex-1 text-left p-2 rounded-lg hover:bg-light-accent dark:hover:bg-accent/50">
                            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
                            <span className="font-semibold truncate text-light-text-main dark:text-text-main flex-1">{user.name}</span>
                        </div>
                        <button 
                            onClick={() => onOpenSettings('General')} 
                            className="p-2 rounded-full text-light-text-muted dark:text-gray-400 hover:bg-light-accent dark:hover:bg-accent/80 hover:text-light-text-main dark:hover:text-text-main transition-colors shrink-0"
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        <style>{`
            @keyframes fade-in { from { opacity: 0; scale: 0.9; } to { opacity: 1; scale: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out; }
        `}</style>
    </aside>
  );
};
