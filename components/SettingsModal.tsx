
import React, { useState, useRef, useEffect } from 'react';
import { 
    XIcon, SettingsIcon, BellIcon, PaintBrushIcon, PuzzlePieceIcon, 
    CircleStackIcon, ShieldCheckIcon, UsersIcon, UserCircleIcon, 
    ChevronDownIcon, ChevronRightIcon, PlayIcon, PlusIcon,
    GoogleDriveIcon, SlackIcon, PenIcon, InfoIcon, SparklesIcon,
    BrainIcon
} from './icons';
import { User, TabId } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAllChats: () => void;
  onArchiveAllChats: () => void;
  onExportData: () => void;
  onClearMemory: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
  initialTab?: TabId;
  startInEditMode?: boolean;
  onOpenPurchaseModal: () => void;
}

const TABS: { id: TabId; label: string; icon: React.FC<{className?: string}> }[] = [
    { id: 'General', label: 'General', icon: SettingsIcon },
    { id: 'Notifications', label: 'Notifications', icon: BellIcon },
    { id: 'Personalization', label: 'Personalization', icon: PaintBrushIcon },
    { id: 'Apps & Connectors', label: 'Apps & Connectors', icon: PuzzlePieceIcon },
    { id: 'Data controls', label: 'Data controls', icon: CircleStackIcon },
    { id: 'Security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'Parental controls', label: 'Parental controls', icon: UsersIcon },
    { id: 'Account', label: 'Account', icon: UserCircleIcon },
    { id: 'About', label: 'About', icon: InfoIcon },
];

const SettingsRow: React.FC<{ title: string; description?: React.ReactNode; children?: React.ReactNode; border?: boolean; vertical?: boolean }> = ({ title, description, children, border = true, vertical = false }) => (
    <div className={`flex ${vertical ? 'flex-col items-start' : 'justify-between items-center'} py-4 ${border ? 'border-b border-light-accent dark:border-accent' : ''}`}>
        <div className={`${vertical ? 'mb-4 w-full' : 'pr-4'}`}>
            <h3 className="text-light-text-main dark:text-text-main font-medium">{title}</h3>
            {description && <div className="text-sm text-light-text-muted dark:text-gray-400 mt-1">{description}</div>}
        </div>
        <div className="shrink-0 w-full md:w-auto">{children}</div>
    </div>
);

const CustomDropdown: React.FC<{ options: string[]; value: string; onChange: (val: string) => void }> = ({ options, value, onChange }) => (
    <div className="relative">
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-light-secondary dark:bg-secondary border border-light-accent dark:border-accent rounded-md px-3 py-1.5 appearance-none text-light-text-main dark:text-text-main focus:outline-none focus:ring-2 focus:ring-highlight/50 min-w-[140px]"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-gray-400 pointer-events-none" />
    </div>
);

const CustomToggle: React.FC<{ enabled: boolean; onChange?: () => void }> = ({ enabled, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-highlight' : 'bg-gray-400 dark:bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const SettingsButton: React.FC<{ children: React.ReactNode; danger?: boolean; onClick?: () => void; outline?: boolean }> = ({ children, danger = false, onClick, outline = false }) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
        danger 
            ? 'bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/40' 
            : outline
                ? 'border border-light-accent dark:border-accent text-light-text-main dark:text-text-main hover:bg-light-accent dark:hover:bg-accent/50'
                : 'bg-light-accent dark:bg-accent/80 text-light-text-main dark:text-text-main border-gray-400/50 dark:border-gray-500/50 hover:bg-light-accent/80 dark:hover:bg-accent'
    }`}>
        {children}
    </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, onLogout, onDeleteAllChats, onArchiveAllChats, onExportData, onClearMemory,
    user, onUpdateUser, theme, onThemeChange, initialTab = 'General', startInEditMode = false, onOpenPurchaseModal
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [memoryText, setMemoryText] = useState(user?.knowledgeBase || '');

  useEffect(() => { if (isOpen) setActiveTab(initialTab); }, [isOpen, initialTab]);
  useEffect(() => { setMemoryText(user?.knowledgeBase || ''); }, [user?.knowledgeBase]);

  if (!isOpen || !user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'General': 
        return (
            <div>
                <SettingsRow title="Dark Mode">
                    <CustomToggle enabled={theme === 'dark'} onChange={onThemeChange} />
                </SettingsRow>
                <SettingsRow title="Accent color">
                    <CustomDropdown options={['Default', 'Blue', 'Green', 'Purple']} value={user.accentColor} onChange={(val) => onUpdateUser({ accentColor: val })} />
                </SettingsRow>
                <SettingsRow title="Language">
                    <CustomDropdown options={['English', 'Spanish', 'French', 'German', 'Urdu']} value={user.language} onChange={(val) => onUpdateUser({ language: val })} />
                </SettingsRow>
                <SettingsRow title="Spoken language" description="Select the language you mainly speak for voice input.">
                    <CustomDropdown options={['Auto-detect', 'English', 'Spanish', 'Urdu']} value={user.spokenLanguage} onChange={(val) => onUpdateUser({ spokenLanguage: val })} />
                </SettingsRow>
                <SettingsRow title="Voice" border={false}>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-accent transition-colors"><PlayIcon className="w-5 h-5 text-light-text-main dark:text-text-main" /></button>
                        <CustomDropdown options={['Juniper', 'Ember', 'Breeze', 'Kore', 'Puck']} value={user.voice} onChange={(val) => onUpdateUser({ voice: val })} />
                    </div>
                </SettingsRow>
            </div>
        );
      case 'Notifications': 
        return (
            <div>
                <SettingsRow title="Responses" description="Get notified when UF AI responds to requests that take time.">
                    <CustomDropdown options={['Push', 'Email', 'Push, Email', 'None']} value={user.notifications.responses} onChange={(val) => onUpdateUser({ notifications: { ...user.notifications, responses: val } })} />
                </SettingsRow>
                <SettingsRow title="Tasks">
                    <CustomDropdown options={['Push', 'Email', 'Push, Email', 'None']} value={user.notifications.tasks} onChange={(val) => onUpdateUser({ notifications: { ...user.notifications, tasks: val } })} />
                </SettingsRow>
                <SettingsRow title="Recommendations" border={false}>
                    <CustomDropdown options={['Push', 'Email', 'Push, Email', 'None']} value={user.notifications.recommendations} onChange={(val) => onUpdateUser({ notifications: { ...user.notifications, recommendations: val } })} />
                </SettingsRow>
            </div>
        );
      case 'Personalization': 
        return (
            <div>
                <SettingsRow title="AI Persona" description="Choose the assistant's overall personality.">
                    <div className="flex flex-wrap gap-2">
                        {(['Friendly', 'Professional', 'Creative'] as const).map(style => (
                            <button key={style} onClick={() => onUpdateUser({ chatStyle: style })} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors border ${user.chatStyle === style ? 'bg-highlight text-white border-highlight' : 'bg-light-secondary dark:bg-secondary text-light-text-main dark:text-text-main border-light-accent dark:border-accent hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                {style}
                            </button>
                        ))}
                    </div>
                </SettingsRow>
                <SettingsRow title="Smart Suggestions">
                    <CustomToggle enabled={user.smartSuggestions} onChange={() => onUpdateUser({ smartSuggestions: !user.smartSuggestions })} />
                </SettingsRow>
                <SettingsRow title="Auto-Summarize Long Chats" border={false}>
                    <CustomToggle enabled={user.autoSummarize} onChange={() => onUpdateUser({ autoSummarize: !user.autoSummarize })} />
                </SettingsRow>
            </div>
        );
      case 'Apps & Connectors': 
        return (
            <div>
                <AppItem 
                    icon={GoogleDriveIcon} name="Google Drive" description="Access files directly in chat." 
                    isConnected={user.connectedApps.includes('google-drive')}
                    onToggle={() => onUpdateUser({ connectedApps: user.connectedApps.includes('google-drive') ? user.connectedApps.filter(a => a !== 'google-drive') : [...user.connectedApps, 'google-drive'] })}
                />
                <AppItem 
                    icon={SlackIcon} name="Slack" description="Send messages to your channels." 
                    isConnected={user.connectedApps.includes('slack')}
                    onToggle={() => onUpdateUser({ connectedApps: user.connectedApps.includes('slack') ? user.connectedApps.filter(a => a !== 'slack') : [...user.connectedApps, 'slack'] })}
                />
            </div>
        );
      case 'Data controls': 
        return (
            <div>
                <SettingsRow title="Chat Memory & Continuity">
                    <CustomToggle enabled={user.useChatMemory} onChange={() => onUpdateUser({ useChatMemory: !user.useChatMemory })} />
                </SettingsRow>
                <SettingsRow title="Personal Knowledge Base" vertical description={<div className="flex gap-2"><SettingsButton onClick={() => onUpdateUser({ knowledgeBase: memoryText })} outline>Save Changes</SettingsButton><SettingsButton danger onClick={onClearMemory}>Wipe</SettingsButton></div>}>
                    <textarea value={memoryText} onChange={(e) => setMemoryText(e.target.value)} placeholder="AI memory is empty..." className="w-full h-32 bg-light-primary dark:bg-primary border border-light-accent dark:border-accent rounded-lg p-3 text-sm text-light-text-main dark:text-text-main font-mono focus:outline-none focus:ring-1 focus:ring-highlight resize-none mt-2" />
                </SettingsRow>
                <SettingsRow title="Archive all chats"><SettingsButton onClick={onArchiveAllChats}>Archive all</SettingsButton></SettingsRow>
                <SettingsRow title="Delete all chats"><SettingsButton danger onClick={onDeleteAllChats}>Delete all</SettingsButton></SettingsRow>
                <SettingsRow title="Export data" border={false}><SettingsButton onClick={onExportData}>Export</SettingsButton></SettingsRow>
            </div>
        );
      case 'Security': 
        return (
            <div>
                <SettingsRow title="Multi-factor authentication">
                    <CustomToggle enabled={user.mfaEnabled} onChange={() => onUpdateUser({ mfaEnabled: !user.mfaEnabled })} />
                </SettingsRow>
                <SettingsRow title="Log out of this device"><SettingsButton onClick={onLogout}>Log out</SettingsButton></SettingsRow>
                <SettingsRow title="Log out of all devices" border={false}><SettingsButton danger onClick={onLogout}>Log out all</SettingsButton></SettingsRow>
            </div>
        );
      case 'Account': 
        return <AccountPanel user={user} onUpdateUser={onUpdateUser} onOpenPurchaseModal={onOpenPurchaseModal} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-light-secondary dark:bg-secondary rounded-lg shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-4xl h-[80vh] flex overflow-hidden">
        <nav className="w-1/4 bg-light-primary/50 dark:bg-primary/30 p-4 border-r border-light-accent dark:border-accent overflow-y-auto shrink-0">
            <button onClick={onClose} className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white mb-4 flex items-center gap-2">
                <XIcon className="w-5 h-5" />
                <span className="font-semibold">Settings</span>
            </button>
            <ul>
                {TABS.map(tab => (
                    <li key={tab.id}>
                        <button onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-2 my-1 rounded-md text-sm text-left transition-colors ${activeTab === tab.id ? 'bg-accent text-white' : 'text-light-text-muted dark:text-gray-400 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main'}`}>
                            <tab.icon className="w-5 h-5 shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
        <main className="w-3/4 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-light-text-main dark:text-text-main mb-6">{TABS.find(t => t.id === activeTab)?.label}</h2>
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AppItem: React.FC<{ icon: React.FC<{className?:string}>, name: string, description: string, isConnected: boolean, onToggle: () => void }> = ({ icon: Icon, name, description, isConnected, onToggle }) => (
    <div className="flex items-center py-4 border-b border-light-accent dark:border-accent">
        <div className="w-10 h-10 bg-light-secondary dark:bg-primary rounded-lg flex items-center justify-center mr-4 shrink-0">
            <Icon className="w-6 h-6 text-light-text-main dark:text-text-main" />
        </div>
        <div className="flex-1 pr-4">
            <h4 className="font-semibold text-light-text-main dark:text-text-main">{name}</h4>
            <p className="text-sm text-light-text-muted dark:text-gray-400">{description}</p>
        </div>
        <SettingsButton onClick={onToggle} danger={isConnected}>{isConnected ? 'Disconnect' : 'Connect'}</SettingsButton>
    </div>
);

const AccountPanel: React.FC<{ user: User, onUpdateUser: (u: Partial<User>) => void, onOpenPurchaseModal: () => void }> = ({ user, onUpdateUser, onOpenPurchaseModal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-light-accent dark:border-accent">
                <div className="flex items-center gap-4">
                    <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover"/>
                    {isEditing ? (
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-light-primary dark:bg-primary border border-light-accent dark:border-accent rounded p-1 font-bold text-xl text-light-text-main dark:text-white" />
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold text-light-text-main dark:text-white">{user.name}</h3>
                            <p className="text-light-text-muted dark:text-gray-400">{user.email}</p>
                        </div>
                    )}
                </div>
                <SettingsButton onClick={() => { if (isEditing) onUpdateUser({ name }); setIsEditing(!isEditing); }}>
                    {isEditing ? 'Save' : 'Edit Profile'}
                </SettingsButton>
            </div>
            <SettingsRow title="Current Plan">
                <span className={`font-bold ${user.plan === 'Pro' ? 'text-green-500' : 'text-light-text-main dark:text-text-main'}`}>{user.plan}</span>
            </SettingsRow>
            <SettingsRow title="Upgrade/Manage Subscription" border={false}>
                <button onClick={onOpenPurchaseModal} className="px-4 py-1.5 bg-highlight text-white rounded-md text-sm font-bold hover:bg-highlight/90">
                    Upgrade to Pro
                </button>
            </SettingsRow>
        </div>
    );
};
