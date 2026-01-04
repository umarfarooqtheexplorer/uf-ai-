
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { PurchaseModal } from './components/PurchaseModal';
import { SubscriptionPrompt } from './components/SubscriptionPrompt';
import { CreateAvatarModal } from './components/CreateAvatarModal';
import { generateResponseStream, generateChatTitle, updateKnowledgeBase, generateImageFromContext, createCustomAvatar } from './services/geminiService';
import { checkSession, signOut, updateUserProfile } from './services/authService';
import { AIModel, ChatMessage, ChatSession, User, Project, ProjectCategory, TabId, Avatar, LoadingState, Source } from './types';
import { AVATARS, AVATAR_CHAT_HISTORY, SUBSCRIPTION_URL } from './constants';
import { 
    GeminiIcon, ChatGPTIcon, DeepSeekIcon, GrokIcon, MetaIcon,
    InvestingIcon, HomeworkIcon, WritingIcon, HealthIcon, TravelIcon
} from './components/icons';

const AI_MODELS: AIModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini', provider: 'Google', icon: GeminiIcon },
  { id: 'gpt-4o', name: 'ChatGPT', provider: 'OpenAI', icon: ChatGPTIcon },
  { id: 'gpt-plus-pro', name: 'ChatGPT Plus Pro', provider: 'OpenAI', icon: ChatGPTIcon },
  { id: 'deepseek-coder', name: 'DeepSeek', provider: 'DeepSeek', icon: DeepSeekIcon },
  { id: 'grok-1', name: 'Grok', provider: 'xAI', icon: GrokIcon },
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', icon: GrokIcon },
  { id: 'meta-llama-3', name: 'Meta AI', provider: 'Meta', icon: MetaIcon },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [customAvatars, setCustomAvatars] = useState<Avatar[]>([]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settingsState, setSettingsState] = useState({
    isOpen: false,
    initialTab: 'General' as TabId,
    startInEditMode: false,
  });
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  const handleUpdateUser = useCallback((updatedFields: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  }, []);

  const handleDeleteAllChats = () => {
    if (confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      setChatHistory([]);
      setMessages([]);
      setActiveChatId(null);
      setSettingsState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleArchiveAllChats = () => {
    if (confirm('Move all chats to archive? They will be hidden from the sidebar.')) {
      setChatHistory([]); // In a real app, this would update an 'isArchived' flag
      setMessages([]);
      setActiveChatId(null);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const data = {
      profile: user,
      chats: chatHistory,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uf-ai-data-${user.name.toLowerCase().replace(/\s/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearMemory = () => {
    handleUpdateUser({ knowledgeBase: '' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setChatHistory([]);
    setMessages([]);
    setActiveChatId(null);
    setSettingsState(prev => ({ ...prev, isOpen: false }));
  };

  const selectChat = useCallback((chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chat.id);
      setSelectedModel(chat.model);
      setMessages(chat.messages);
      setIsSidebarOpen(false);
    }
  }, [chatHistory]);

  const createNewChat = useCallback((avatar?: Avatar) => {
    const newChatId = `chat-${Date.now()}`;
    const introMessage = avatar?.greeting || (avatar ? AVATAR_CHAT_HISTORY[avatar.id]?.[0]?.text : undefined);
      
    const newChatSession: ChatSession = {
      id: newChatId,
      title: avatar ? `Chat with ${avatar.name}` : 'New Chat',
      messages: [],
      model: selectedModel,
      timestamp: Date.now(),
      avatarId: avatar?.id,
      introMessage: introMessage,
      customAvatar: avatar?.id.startsWith('custom') ? avatar : undefined
    };

    setChatHistory(prev => [newChatSession, ...prev]);
    setActiveChatId(newChatId);
    setMessages([]);
    setIsSidebarOpen(false);
  }, [selectedModel]);

  const handleAddCustomAvatar = async (name: string) => {
    setLoadingState('researching');
    try {
        const avatar = await createCustomAvatar(name);
        setCustomAvatars(prev => [...prev, avatar]);
        createNewChat(avatar);
    } catch (e) {
        console.error("Custom avatar creation failed", e);
    } finally {
        setLoadingState(null);
        setIsAvatarModalOpen(false);
    }
  };

  const handleUpdateCustomAvatar = (updatedAvatar: Avatar) => {
    setCustomAvatars(prev => prev.map(a => a.id === updatedAvatar.id ? updatedAvatar : a));
    setEditingAvatar(null);
  };

  const handleSendMessage = async (text: string, file?: File, existingImageUrl?: string) => {
    if (loadingState || (!text.trim() && !file && !existingImageUrl) || !user) return;
    setLoadingState('generating');
    
    let imageUrl = existingImageUrl;
    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text, imageUrl };
    setMessages(prev => [...prev, userMessage]);

    const aiMessageId = `msg-${Date.now() + 1}`;
    const aiMessagePlaceholder: ChatMessage = { id: aiMessageId, sender: 'ai', text: '', model: selectedModel };
    setMessages(prev => [...prev, aiMessagePlaceholder]);
    
    try {
        const stream = generateResponseStream(text, selectedModel, {
            userSettings: user,
            avatarId: chatHistory.find(c => c.id === activeChatId)?.avatarId,
            conversationHistory: messages,
        });

        let currentResponseText = '';
        for await (const chunk of stream) {
            currentResponseText += (chunk.text || '');
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: currentResponseText } : msg));
        }
        
        const finalAiMessage = { ...aiMessagePlaceholder, text: currentResponseText };
        setChatHistory(prev => prev.map(chat => chat.id === activeChatId ? {
            ...chat,
            messages: [...chat.messages, userMessage, finalAiMessage],
        } : chat));

    } catch (error) {
        console.error('Error:', error);
    } finally {
      setLoadingState(null);
    }
  };

  if (!isLoggedIn || !user) {
    return <LoginScreen onLogin={(u) => { setUser(u); setIsLoggedIn(true); createNewChat(); }} />;
  }

  return (
    <div className="flex h-screen w-full bg-light-primary dark:bg-primary overflow-hidden">
      <Sidebar 
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={() => createNewChat()}
        onNewAvatarChat={(avatar) => createNewChat(avatar)}
        onEditAvatar={(avatar) => { setEditingAvatar(avatar); setIsAvatarModalOpen(true); }}
        onDeleteChat={(id) => setChatHistory(prev => prev.filter(c => c.id !== id))}
        isOpen={isSidebarOpen}
        user={user}
        onOpenSettings={(tab) => setSettingsState({ isOpen: true, initialTab: tab, startInEditMode: false })}
        onOpenProjectModal={() => {}}
        projects={[]}
        onLogout={handleLogout}
        avatars={[...AVATARS, ...customAvatars]}
        onOpenCreateAvatar={() => { setEditingAvatar(null); setIsAvatarModalOpen(true); }}
      />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          webAccessEnabled={user.webAccessEnabled}
          onToggleWebAccess={() => handleUpdateUser({ webAccessEnabled: !user.webAccessEnabled })}
          user={user}
        />
        <main className="flex-1 overflow-y-auto relative">
          <ChatWindow
            messages={messages}
            loadingState={loadingState}
            onLoadMore={() => {}}
            hasMore={false}
            isLoadingMore={false}
            onFeedback={() => {}}
            onRegenerate={() => {}}
            activeChatSession={chatHistory.find(c => c.id === activeChatId)}
          />
        </main>
        <div className="p-4 bg-light-primary dark:bg-primary border-t border-light-accent dark:border-secondary">
          <MessageInput onSendMessage={handleSendMessage} onGenerateImage={() => {}} isLoading={!!loadingState} />
        </div>
      </div>
      <SettingsModal 
        isOpen={settingsState.isOpen}
        onClose={() => setSettingsState(prev => ({ ...prev, isOpen: false }))}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onDeleteAllChats={handleDeleteAllChats}
        onArchiveAllChats={handleArchiveAllChats}
        onExportData={handleExportData}
        onClearMemory={handleClearMemory}
        theme={user.theme}
        onThemeChange={() => handleUpdateUser({ theme: user.theme === 'light' ? 'dark' : 'light' })}
        initialTab={settingsState.initialTab}
        startInEditMode={settingsState.startInEditMode}
        onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
      />
      <CreateAvatarModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => { setIsAvatarModalOpen(false); setEditingAvatar(null); }} 
        onCreate={handleAddCustomAvatar}
        onUpdate={handleUpdateCustomAvatar}
        isLoading={loadingState === 'researching'}
        editingAvatar={editingAvatar}
      />
      <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
    </div>
  );
};

export default App;
