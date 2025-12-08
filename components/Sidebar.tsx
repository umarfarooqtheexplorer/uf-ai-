import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, User, Project, TabId, Avatar } from '../types';
import { 
    PenIcon, SearchIcon, LibraryIcon, ProjectsIcon, SettingsIcon, 
    MessageSquareIcon, UserPlusIcon, LogoutIcon, TrashIcon
} from './icons';

interface SidebarProps {
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onNewAvatarChat: (avatar: Avatar) => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  user: User | null;
  onOpenSettings: (tab: TabId, editMode?: boolean) => void;
  onOpenProjectModal: () => void;
  projects: Project[];
  onLogout: () => void;
  avatars: Avatar[];
}

const SidebarMenuItem: React.FC<{ icon: React.FC<{className?:string}>, label: string, onClick?: () => void }> = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-2 rounded-md text-sm text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main transition-colors duration-200">
        <Icon className="w-5 h-5 mr-3 shrink-0" />
        <span className="truncate font-medium">{label}</span>
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ chatHistory, activeChatId, onSelectChat, onNewChat, onNewAvatarChat, onDeleteChat, isOpen, user, onOpenSettings, onOpenProjectModal, projects, onLogout, avatars }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const handleMenuAction = (action: () => void) => {
    setIsUserMenuOpen(false);
    action();
  }

  return (
    <aside className={`w-72 bg-light-secondary dark:bg-secondary flex flex-col p-2 border-r border-light-accent dark:border-accent 
      fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
      md:static md:flex md:shrink-0 md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
        <div className="flex flex-col h-full">
            {/* Top section */}
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
                    <SidebarMenuItem icon={LibraryIcon} label="Library" />
                    <SidebarMenuItem icon={ProjectsIcon} label="Projects" onClick={onOpenProjectModal}/>
                </div>
            </div>

            {/* AI Avatars */}
            <div className="px-2 mb-4">
                <h3 className="px-2 text-xs font-semibold text-light-text-muted dark:text-gray-500 uppercase tracking-wider mb-2">AI Avatars</h3>
                <div className="grid grid-cols-4 gap-x-2 gap-y-4 justify-items-center px-2">
                    {avatars.map(avatar => (
                        <button 
                            key={avatar.id}
                            onClick={() => onNewAvatarChat(avatar)}
                            className="flex flex-col items-center gap-1 text-center group"
                            title={`Chat with ${avatar.name}`}
                        >
                            <img src={avatar.imageUrl} alt={avatar.name} className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-highlight"/>
                            <p className="text-xs w-full text-light-text-muted dark:text-gray-400 group-hover:text-light-text-main dark:group-hover:text-text-main truncate">{avatar.name.split(' ')[0]}</p>
                        </button>
                    ))}
                </div>
            </div>


            {/* Projects list */}
            {projects.length > 0 && (
                 <div className="px-2 mb-2">
                    <h3 className="px-2 text-xs font-semibold text-light-text-muted dark:text-gray-500 uppercase tracking-wider mb-2">Projects</h3>
                    <div className="relative mb-2">
                        <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-gray-500 pointer-events-none" />
                        <input 
                            type="text"
                            placeholder="Search projects"
                            value={projectSearchTerm}
                            onChange={(e) => setProjectSearchTerm(e.target.value)}
                            className="w-full bg-light-primary dark:bg-primary/50 border border-light-accent dark:border-accent rounded-md pl-8 pr-3 py-1 text-sm text-light-text-main dark:text-text-main placeholder-light-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-highlight"
                        />
                    </div>
                    <nav className="flex flex-col space-y-1">
                        {filteredProjects.map(project => {
                            const Icon = project.category.icon;
                            return (
                                <a key={project.id} href="#" 
                                    onClick={(e) => e.preventDefault()}
                                    className="flex items-center p-2 rounded-md text-sm text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50"
                                >
                                    <Icon className="w-4 h-4 mr-3 shrink-0" />
                                    <span className="truncate">{project.name}</span>
                                </a>
                            )
                        })}
                    </nav>
                 </div>
            )}


            {/* Chat history */}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-light-text-muted dark:text-gray-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete chat"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="p-2 mt-2 border-t border-light-accent dark:border-accent relative" ref={menuRef}>
                {isUserMenuOpen && user && (
                    <div className="absolute bottom-full left-2 right-2 mb-2 p-2 bg-light-primary dark:bg-primary rounded-lg shadow-2xl border border-light-accent/50 dark:border-accent/50 z-10 animate-fade-in-up-sm">
                        <div className="flex items-center gap-3 p-2 border-b border-light-accent dark:border-accent mb-2">
                            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate text-light-text-main dark:text-text-main text-sm">{user.name}</p>
                                <p className="text-xs text-light-text-muted dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-3 p-2 rounded-md text-sm text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main transition-colors">
                            <UserPlusIcon className="w-5 h-5 shrink-0" />
                            <span>Add another account</span>
                        </button>
                        <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-3 p-2 rounded-md text-sm text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main transition-colors">
                            <LogoutIcon className="w-5 h-5 shrink-0" />
                            <span>Log out</span>
                        </button>
                    </div>
                )}
                {user && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 overflow-hidden flex-1 text-left p-2 rounded-lg hover:bg-light-accent dark:hover:bg-accent/50">
                            <div className="relative shrink-0 group">
                                <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
                                <button
                                    onClick={() => onOpenSettings('Account', true)}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    aria-label="Edit Profile"
                                >
                                    <PenIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex-1 text-left overflow-hidden">
                                <span className="font-semibold truncate text-light-text-main dark:text-text-main">{user.name}</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => onOpenSettings('General')} 
                            className="p-2 rounded-full text-light-text-muted dark:text-gray-400 hover:bg-light-accent dark:hover:bg-accent/80 hover:text-light-text-main dark:hover:text-text-main transition-colors shrink-0"
                            aria-label="Open settings"
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        <style>{`
            @keyframes fade-in-up-sm {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up-sm { animation: fade-in-up-sm 0.2s ease-out forwards; }
        `}</style>
    </aside>
  );
};