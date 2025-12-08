import React, { useState, useRef, useEffect } from 'react';
import { 
    XIcon, SettingsIcon, BellIcon, PaintBrushIcon, PuzzlePieceIcon, 
    CircleStackIcon, ShieldCheckIcon, UsersIcon, UserCircleIcon, 
    ChevronDownIcon, ChevronRightIcon, PlayIcon, PlusIcon,
    GoogleDriveIcon, SlackIcon, PenIcon, InfoIcon, SparklesIcon
} from './icons';
import { User, TabId } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAllChats: () => void;
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const SettingsRow: React.FC<{ title: string; description?: React.ReactNode; children?: React.ReactNode; border?: boolean; }> = ({ title, description, children, border = true }) => (
    <div className={`flex justify-between items-center py-4 ${border ? 'border-b border-light-accent dark:border-accent' : ''}`}>
        <div className="pr-4">
            <h3 className="text-light-text-main dark:text-text-main font-medium">{title}</h3>
            {description && <p className="text-sm text-light-text-muted dark:text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="shrink-0">{children}</div>
    </div>
);

const CustomDropdown: React.FC<{ options: string[]; selected: string }> = ({ options, selected }) => (
    <div className="relative">
        <select defaultValue={selected} className="bg-light-secondary dark:bg-secondary border border-light-accent dark:border-accent rounded-md px-3 py-1.5 appearance-none text-light-text-main dark:text-text-main focus:outline-none focus:ring-2 focus:ring-highlight/50">
            {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-gray-400 pointer-events-none" />
    </div>
);

const CustomToggle: React.FC<{ enabled: boolean; onChange?: () => void }> = ({ enabled, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-highlight' : 'bg-gray-400 dark:bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const SettingsButton: React.FC<{ children: React.ReactNode; danger?: boolean; onClick?: () => void }> = ({ children, danger = false, onClick }) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${danger ? 'bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/40' : 'bg-light-accent dark:bg-accent/80 text-light-text-main dark:text-text-main border-gray-400/50 dark:border-gray-500/50 hover:bg-light-accent/80 dark:hover:bg-accent'}`}>
        {children}
    </button>
);


const GeneralPanel: React.FC<{ theme: 'light' | 'dark'; onThemeChange: () => void }> = ({ theme, onThemeChange }) => (
    <div>
        <SettingsRow title="Dark Mode">
            <CustomToggle enabled={theme === 'dark'} onChange={onThemeChange} />
        </SettingsRow>
        <SettingsRow title="Accent color">
            <CustomDropdown options={['Default']} selected="Default" />
        </SettingsRow>
        <SettingsRow title="Language">
            <CustomDropdown options={['Auto-detect']} selected="Auto-detect" />
        </SettingsRow>
        <SettingsRow title="Spoken language" description="For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.">
            <CustomDropdown options={['Auto-detect']} selected="Auto-detect" />
        </SettingsRow>
        <SettingsRow title="Voice" border={false}>
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-accent transition-colors"><PlayIcon className="w-5 h-5 text-light-text-main dark:text-text-main" /></button>
                <CustomDropdown options={['Juniper', 'Ember', 'Breeze']} selected="Juniper" />
            </div>
        </SettingsRow>
    </div>
);

const NotificationsPanel = () => (
    <div>
        <SettingsRow title="Responses" description="Get notified when UF AI responds to requests that take time, like research or image generation.">
            <CustomDropdown options={['Push', 'Email']} selected="Push" />
        </SettingsRow>
        <SettingsRow title="Tasks" description={<>Get notified when tasks you've created have updates. <a href="#" className="text-highlight/80 hover:underline">Manage tasks</a></>}>
            <CustomDropdown options={['Push, Email']} selected="Push, Email" />
        </SettingsRow>
        <SettingsRow title="Recommendations" description="Stay in the loop on new tools, tips, and features from UF AI." border={false}>
             <CustomDropdown options={['Push, Email']} selected="Push, Email" />
        </SettingsRow>
    </div>
);

const DataControlsPanel: React.FC<{ onDeleteAllChats: () => void; onClearMemory: () => void; user: User; onUpdateUser: (updatedUser: Partial<User>) => void; }> = ({ onDeleteAllChats, onClearMemory, user, onUpdateUser }) => (
    <div>
        <SettingsRow title="Improve the model for everyone">
            <button className="flex items-center gap-2 text-light-text-main dark:text-text-main">On <ChevronRightIcon className="w-5 h-5 text-light-text-muted dark:text-gray-400" /></button>
        </SettingsRow>
        <SettingsRow title="Chat Memory & Continuity" description="Allow UF AI to remember your conversations to provide a personalized experience.">
            <CustomToggle enabled={user.useChatMemory} onChange={() => onUpdateUser({ useChatMemory: !user.useChatMemory })} />
        </SettingsRow>
        <SettingsRow title="Clear Chat Memory" description="Clears what UF AI remembers about you from past conversations. This cannot be undone.">
            <SettingsButton danger onClick={onClearMemory}>Clear Memory</SettingsButton>
        </SettingsRow>
        <SettingsRow title="Shared links"><SettingsButton>Manage</SettingsButton></SettingsRow>
        <SettingsRow title="Archived chats"><SettingsButton>Manage</SettingsButton></SettingsRow>
        <SettingsRow title="Archive all chats"><SettingsButton>Archive all</SettingsButton></SettingsRow>
        <SettingsRow title="Delete all chats"><SettingsButton danger onClick={onDeleteAllChats}>Delete all</SettingsButton></SettingsRow>
        <SettingsRow title="Export data" border={false}><SettingsButton>Export</SettingsButton></SettingsRow>
    </div>
);

const SecurityPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <div>
        <SettingsRow title="Multi-factor authentication" description="Require an extra security challenge when logging in.">
            <CustomToggle enabled={false} />
        </SettingsRow>
        <SettingsRow title="Trusted Devices" description="When you sign in on another device, it will be added here and can automatically receive device prompts for signing in." border={false} >
             {/* No control for this one as per screenshot */}
        </SettingsRow>
        <SettingsRow title="Log out of this device"><SettingsButton onClick={onLogout}>Log out</SettingsButton></SettingsRow>
        <SettingsRow title="Log out of all devices" description="Log out of all active sessions across all devices, including your current session." border={false}>
            <SettingsButton danger onClick={onLogout}>Log out all</SettingsButton>
        </SettingsRow>
    </div>
);

const ParentalControlsPanel = () => (
    <div className="text-light-text-muted dark:text-gray-300">
        <p className="mb-6">Parents and teens can link accounts, giving parents tools to adjust certain features, set limits, and add safeguards that work for their family.</p>
        <SettingsButton><PlusIcon className="w-4 h-4 mr-2 inline-block" /> Add family member</SettingsButton>
    </div>
);

const CHAT_STYLES: User['chatStyle'][] = ['Friendly', 'Professional', 'Creative'];

const PersonalizationPanel: React.FC<{ user: User, onUpdateUser: (updatedUser: Partial<User>) => void }> = ({ user, onUpdateUser }) => (
    <div>
        <SettingsRow title="Chat History & Training" description="Allow UF AI to use your conversations to improve our models.">
            <CustomToggle enabled={true} />
        </SettingsRow>
        <SettingsRow title="AI Persona" description="Choose the AI's overall personality and response style.">
            <div className="flex flex-wrap gap-2">
                {CHAT_STYLES.map(style => (
                    <button
                        key={style}
                        onClick={() => onUpdateUser({ chatStyle: style })}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors border ${
                            user.chatStyle === style 
                            ? 'bg-highlight text-white border-highlight' 
                            : 'bg-light-secondary dark:bg-secondary text-light-text-main dark:text-text-main border-light-accent dark:border-accent hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </SettingsRow>
        <SettingsRow title="Smart Suggestions" description="Get AI-powered suggestions as you type.">
             <CustomToggle enabled={true} />
        </SettingsRow>
        <SettingsRow title="Auto-Summarize Long Chats" description="Automatically create a summary for conversations that go over 20 messages." border={false}>
            <CustomToggle enabled={false} />
        </SettingsRow>
    </div>
);

const AppItem: React.FC<{ icon: React.FC<{className?:string}>, name: string, description: string }> = ({ icon: Icon, name, description }) => (
    <div className="flex items-center py-4 border-b border-light-accent dark:border-accent">
        <div className="w-10 h-10 bg-light-secondary dark:bg-primary rounded-lg flex items-center justify-center mr-4 shrink-0">
            <Icon className="w-6 h-6 text-light-text-main dark:text-text-main" />
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-light-text-main dark:text-text-main">{name}</h4>
            <p className="text-sm text-light-text-muted dark:text-gray-400">{description}</p>
        </div>
        <SettingsButton>Connect</SettingsButton>
    </div>
)

const AppsConnectorsPanel = () => (
    <div>
        <p className="text-light-text-muted dark:text-gray-400 mb-4">Connect your favorite apps to extend the capabilities of UF AI.</p>
        <AppItem icon={GoogleDriveIcon} name="Google Drive" description="Access and manage your files directly in chat." />
        <AppItem icon={SlackIcon} name="Slack" description="Send messages and get notifications in your channels." />
    </div>
);

interface AccountPanelProps {
    user: User | null;
    onUpdateUser: (updatedUser: Partial<User>) => void;
    startInEditMode?: boolean;
    onOpenPurchaseModal: () => void;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ user, onUpdateUser, startInEditMode = false, onOpenPurchaseModal }) => {
    const [isEditing, setIsEditing] = useState(startInEditMode);
    const [error, setError] = useState('');
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setAvatarUrl(user.avatarUrl);
        }
    }, [user, isEditing]);

    useEffect(() => {
        setIsEditing(startInEditMode);
    }, [startInEditMode]);

    if (!user) {
        return <p className="text-light-text-muted dark:text-gray-400">User not found.</p>;
    }
    
    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    const handleSave = () => {
        setError('');
        if (!name.trim()) {
            setError('Name cannot be empty.');
            return;
        }

        // In a real app, the backend would handle name conflict errors.
        // We call the update function and let the parent component handle state.
        onUpdateUser({ name, avatarUrl });
        setIsEditing(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setAvatarUrl(base64);
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
    };
    
    return (
        <div>
            {isEditing ? (
                <>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-light-accent dark:border-accent">
                        <div className="relative group shrink-0">
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                            <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover"/>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Change avatar"
                            >
                                <PenIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-2">
                             <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-light-primary dark:bg-primary/50 border border-light-accent dark:border-accent rounded-md px-3 py-1.5 text-xl font-bold text-light-text-main dark:text-text-main focus:outline-none focus:ring-1 focus:ring-highlight"
                             />
                             <input 
                                type="email"
                                value={email}
                                disabled
                                className="w-full bg-light-primary dark:bg-primary/50 border border-light-accent dark:border-accent rounded-md px-3 py-1.5 text-light-text-muted dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-highlight disabled:opacity-50 disabled:cursor-not-allowed"
                             />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500 mb-4 text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <SettingsButton onClick={handleCancel}>Cancel</SettingsButton>
                        <button onClick={handleSave} className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors bg-highlight text-white hover:bg-highlight/90">
                            Save Changes
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-light-accent dark:border-accent">
                    <div className="flex items-center gap-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover"/>
                        <div>
                            <h3 className="text-xl font-bold text-light-text-main dark:text-text-main">{user.name}</h3>
                            <p className="text-light-text-muted dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <SettingsButton onClick={() => setIsEditing(true)}>Edit Profile</SettingsButton>
                </div>
            )}
            
            <div className="mt-6 border-t border-light-accent dark:border-accent pt-6">
                <SettingsRow title="Current Plan">
                  <span className={`font-semibold ${user.plan === 'Pro' ? 'text-green-400' : 'text-light-text-main dark:text-text-main'}`}>
                      {user.plan} Plan
                  </span>
                </SettingsRow>
                <SettingsRow title={user.plan === 'Pro' ? "Manage Subscription" : "Upgrade to Pro"}>
                    {user.plan === 'Pro' ? (
                        <SettingsButton>Manage</SettingsButton>
                    ) : (
                        <button onClick={onOpenPurchaseModal} className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors bg-highlight text-white hover:bg-highlight/90 flex items-center gap-2">
                           <SparklesIcon className="w-4 h-4" />
                           Upgrade
                        </button>
                    )}
                </SettingsRow>
                <SettingsRow title="Delete Account" description="Permanently delete your account and all your data." border={false}>
                    <SettingsButton danger>Delete</SettingsButton>
                </SettingsRow>
            </div>
        </div>
    );
};

const AboutPanel = () => {
    const aboutInfo = {
      "project_name": "UF AI",
      "founded_by": "a young developer from Pakistan",
      "goal": "to explore friendly, helpful, and creative artificial intelligence",
      "started_in": 2025,
      "focus_areas": ["natural conversation", "education", "fun interactive features"],
      "inspiration": "modern AI assistants and open-source learning projects"
    };

    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div className="mb-4">
            <p className="text-sm font-semibold text-light-text-muted dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="text-light-text-main dark:text-text-main mt-1">{value}</div>
        </div>
    );

    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <SparklesIcon className="w-12 h-12 text-highlight" />
                <h1 className="text-3xl font-bold ml-3 text-light-text-main dark:text-white">{aboutInfo.project_name}</h1>
            </div>
            <p className="text-lg text-light-text-muted dark:text-gray-300 mb-8 max-w-xl mx-auto">
                {aboutInfo.goal}
            </p>
            <div className="text-left bg-light-primary/50 dark:bg-primary/30 p-6 rounded-lg border border-light-accent dark:border-accent">
                <DetailItem label="Founded by" value={aboutInfo.founded_by} />
                <DetailItem label="Started in" value={aboutInfo.started_in} />
                <DetailItem label="Focus Areas" value={
                    <ul className="list-disc list-inside space-y-1">
                        {aboutInfo.focus_areas.map(area => <li key={area}>{area.charAt(0).toUpperCase() + area.slice(1)}</li>)}
                    </ul>
                } />
                <DetailItem label="Inspiration" value={aboutInfo.inspiration} />
            </div>
            <p className="text-xs text-gray-500 mt-8">Version 1.0.0</p>
        </div>
    );
};


export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onLogout, 
    onDeleteAllChats,
    onClearMemory,
    user, 
    onUpdateUser, 
    theme, 
    onThemeChange,
    initialTab = 'General',
    startInEditMode = false,
    onOpenPurchaseModal
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
      if (isOpen) {
          setActiveTab(initialTab);
      }
  }, [isOpen, initialTab]);

  if (!isOpen || !user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'General': return <GeneralPanel theme={theme} onThemeChange={onThemeChange} />;
      case 'Notifications': return <NotificationsPanel />;
      case 'Data controls': return <DataControlsPanel onDeleteAllChats={onDeleteAllChats} onClearMemory={onClearMemory} user={user} onUpdateUser={onUpdateUser} />;
      case 'Security': return <SecurityPanel onLogout={onLogout} />;
      case 'Parental controls': return <ParentalControlsPanel />;
      case 'Personalization': return <PersonalizationPanel user={user} onUpdateUser={onUpdateUser} />;
      case 'Apps & Connectors': return <AppsConnectorsPanel />;
      case 'Account': return <AccountPanel user={user} onUpdateUser={onUpdateUser} startInEditMode={startInEditMode} onOpenPurchaseModal={onOpenPurchaseModal} />;
      case 'About': return <AboutPanel />;
      default: return null;
    }
  };
  
  const activeTabLabel = TABS.find(t => t.id === activeTab)?.label || 'Settings';

  return (
    <div 
        className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
    >
      <div className="bg-light-secondary dark:bg-secondary rounded-lg shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-1/4 bg-light-primary/50 dark:bg-primary/30 p-4 border-r border-light-accent dark:border-accent overflow-y-auto">
            <button onClick={onClose} className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white mb-4 flex items-center gap-2">
                <XIcon className="w-5 h-5" />
                <span className="font-semibold">Settings</span>
            </button>
            <ul>
                {TABS.map(tab => (
                    <li key={tab.id}>
                        <button 
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-2 my-1 rounded-md text-sm text-left transition-colors ${activeTab === tab.id ? 'bg-accent text-white' : 'text-light-text-muted dark:text-gray-400 hover:bg-light-accent dark:hover:bg-accent/50 hover:text-light-text-main dark:hover:text-text-main'}`}
                        >
                            <tab.icon className="w-5 h-5 shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
        {/* Content */}
        <main className="w-3/4 p-8 overflow-y-auto">
            <h2 id="settings-title" className="text-2xl font-bold text-light-text-main dark:text-text-main mb-6">{activeTabLabel}</h2>
            {renderContent()}
        </main>
      </div>
    </div>
  );
};