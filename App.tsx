import React, { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { PurchaseModal } from './components/PurchaseModal';
import { SubscriptionPrompt } from './components/SubscriptionPrompt';
import { generateResponseStream, generateChatTitle, updateKnowledgeBase, generateImageFromContext } from './services/geminiService';
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

const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'investing', name: 'Investing', icon: InvestingIcon },
  { id: 'homework', name: 'Homework', icon: HomeworkIcon },
  { id: 'writing', name: 'Writing', icon: WritingIcon },
  { id: 'health', name: 'Health', icon: HealthIcon },
  { id: 'travel', name: 'Travel', icon: TravelIcon },
];

const MESSAGES_PER_PAGE = 20;
const FREE_MESSAGE_LIMIT = 6;
type Theme = 'light' | 'dark';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settingsState, setSettingsState] = useState({
    isOpen: false,
    initialTab: 'General' as TabId,
    startInEditMode: false,
  });
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);


  const openSettings = (tab: TabId = 'General', editMode: boolean = false) => {
    setSettingsState({
        isOpen: true,
        initialTab: tab,
        startInEditMode: editMode,
    });
  };

  const closeSettings = () => {
    setSettingsState(prev => ({ ...prev, isOpen: false }));
  };

  const selectChat = useCallback((chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chat.id);
      setSelectedModel(chat.model);
      
      const totalMessages = chat.messages.length;
      const initialMessages = chat.messages.slice(Math.max(0, totalMessages - MESSAGES_PER_PAGE));
      setMessages(initialMessages);
      setHasMoreMessages(totalMessages > MESSAGES_PER_PAGE);
      setIsLoadingMore(false);
      setIsSidebarOpen(false);
    }
  }, [chatHistory]);

  const createNewChat = useCallback((avatar?: Avatar) => {
    const newChatId = `chat-${Date.now()}`;
    
    const introMessage = avatar ? (AVATAR_CHAT_HISTORY[avatar.id]?.[0]?.text) : undefined;
      
    const newChatSession: ChatSession = {
      id: newChatId,
      title: avatar ? `Chat with ${avatar.name}` : 'New Chat',
      messages: [],
      model: selectedModel,
      timestamp: Date.now(),
      avatarId: avatar?.id,
      introMessage: introMessage,
    };

    setChatHistory(prev => [newChatSession, ...prev]);
    setActiveChatId(newChatId);
    setMessages(newChatSession.messages);
    setHasMoreMessages(false);
    setIsSidebarOpen(false);
  }, [selectedModel]);

  useEffect(() => {
    if (user?.theme) {
        const root = window.document.documentElement;
        root.classList.remove(user.theme === 'dark' ? 'light' : 'dark');
        root.classList.add(user.theme);
    }
  }, [user?.theme]);

  const handleThemeChange = () => {
    if (user) {
        const newTheme = user.theme === 'dark' ? 'light' : 'dark';
        handleUpdateUser({ theme: newTheme });
    }
  };
  
  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    handleUpdateUser({ selectedModelId: model.id });
  };
  
  useEffect(() => {
    if (user?.selectedModelId) {
        const model = AI_MODELS.find(m => m.id === user.selectedModelId) || AI_MODELS[0];
        setSelectedModel(model);
    }
  }, [user?.selectedModelId]);

  const handleLogin = useCallback((loggedInUser: User) => {
    if (loggedInUser) {
        setUser(loggedInUser);
        setIsLoggedIn(true);
        // On successful login, start a new chat session.
        // In a real app, you would fetch existing chats from the server here.
        createNewChat();
    }
  }, [createNewChat]);

  useEffect(() => {
    // This function now attempts to validate a session cookie with the backend.
    // In our mock setup, it does nothing, requiring a login on each visit.
    checkSession(handleLogin);
  }, [handleLogin]);

  const handleLogout = () => {
    signOut(() => {
        setUser(null);
        setIsLoggedIn(false);
        // Clear all state on logout
        setChatHistory([]);
        setProjects([]);
        setActiveChatId(null);
        setMessages([]);
        closeSettings();
    });
  };

  const handleDeleteChat = (chatId: string) => {
    // This action is now client-side only. A backend call would be needed for persistence.
    if (!window.confirm('Are you sure you want to delete this chat conversation?')) {
        return;
    }
    const chatToDeleteIndex = chatHistory.findIndex(c => c.id === chatId);
    if (chatToDeleteIndex === -1) return;

    const updatedChatHistory = chatHistory.filter(c => c.id !== chatId);

    if (activeChatId === chatId) {
        if (updatedChatHistory.length > 0) {
            const newIndex = Math.max(0, chatToDeleteIndex - 1);
            selectChat(updatedChatHistory[newIndex].id);
        } else {
            createNewChat();
        }
    }

    setChatHistory(updatedChatHistory);
  };

  const handleDeleteAllChats = () => {
    // This action is now client-side only. A backend call would be needed for persistence.
    if (!window.confirm('Are you sure you want to delete all chat history?')) {
        return;
    }
    createNewChat();
  };

  const handleCreateProject = (name: string, category: ProjectCategory) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      category,
      chatIds: [],
    };
    setProjects(prev => [newProject, ...prev]);
    setIsProjectModalOpen(false);
  };
  
  const handleUpdateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    // In a real app, we would call the service and set the user from the response:
    // updateUserProfile(updatedFields).then(setUser).catch(err => console.error(err));
    
    // For the mock, we update the state directly.
    const updatedUser = { ...user, ...updatedFields };
    if(updatedFields.name && updatedFields.name !== user.name) {
        updatedUser.email = `${updatedFields.name.toLowerCase().replace(/\s+/g, '.')}@ufai.local`;
    }
    setUser(updatedUser);
  };

  const handleClearMemory = () => {
    if (user) {
      handleUpdateUser({ knowledgeBase: '' });
      closeSettings();
    }
  };

  const handleSendMessage = async (text: string, file?: File) => {
    const imageGenKeywords = ['generate an image', 'create an image', 'draw a picture', 'create a picture', 'generate a picture', 'make an image', 'make a picture'];
    const isImageGenRequest = imageGenKeywords.some(kw => text.toLowerCase().trim().startsWith(kw));

    if (isImageGenRequest && !file) {
      handleGenerateImage(text);
      return;
    }
    if (loadingState || (!text.trim() && !file) || !user) return;

    if (user.plan === 'Free' && user.messageCount >= FREE_MESSAGE_LIMIT) {
        setShowSubscriptionPrompt(true);
        return;
    }

    setLoadingState(file ? 'analyzing' : 'generating');
    
    let imageUrl: string | undefined = undefined;
    let imagePayload: { data: string; mimeType: string } | undefined = undefined;

    if (file) {
      try {
        const base64Data = await fileToBase64(file);
        imageUrl = base64Data;
        imagePayload = {
          data: base64Data,
          mimeType: file.type
        };
      } catch (error) {
          console.error('Error processing file:', error);
          const errorMessage: ChatMessage = {
              id: `msg-${Date.now()}`,
              sender: 'ai',
              text: 'Sorry, I was unable to read the uploaded file. Please try again.',
              model: selectedModel,
              isError: true,
          };
          setMessages(prev => [...prev.filter(m => m.id !== 'ai-placeholder'), errorMessage]);
          setLoadingState(null);
          return;
      }
    }

    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text, imageUrl };
    if (user.plan === 'Free') {
        handleUpdateUser({ messageCount: user.messageCount + 1 });
    }

    const aiMessageId = `msg-${Date.now() + 1}`;
    const aiMessagePlaceholder: ChatMessage = {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        model: selectedModel,
        liked: null,
    };
    
    setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
    
    const currentChat = chatHistory.find(c => c.id === activeChatId);
    const conversationHistory = currentChat?.messages || [];

    try {
        const stream = generateResponseStream(text, selectedModel, {
            image: imagePayload,
            userSettings: {
                knowledgeBase: user.knowledgeBase,
                webAccessEnabled: user.webAccessEnabled,
                useChatMemory: user.useChatMemory,
                chatStyle: user.chatStyle
            },
            avatarId: currentChat?.avatarId,
            conversationHistory: conversationHistory,
        });

        let finalAiMessage: ChatMessage | null = null;
        
        for await (const chunk of stream) {
            setMessages(prev => {
                return prev.map(msg => {
                    if (msg.id === aiMessageId) {
                        const updatedMsg = {
                            ...msg,
                            text: msg.text + (chunk.text || ''),
                            sources: chunk.sources ? [...(msg.sources || []), ...chunk.sources] : msg.sources
                        };
                        finalAiMessage = updatedMsg; // Keep track of the final version
                        return updatedMsg;
                    }
                    return msg;
                });
            });
        }
        
        if (finalAiMessage) {
            const updatedMessages = [...(currentChat?.messages || []), userMessage, finalAiMessage];
            
            const isFirstMessage = currentChat ? currentChat.messages.length === 0 : true;
            let finalTitle = currentChat?.title || 'New Chat';
            if (isFirstMessage && !currentChat?.avatarId) {
              if (text.trim()) finalTitle = text.substring(0, 30) + (text.length > 30 ? '...' : '');
              else if (imageUrl) finalTitle = 'Chat with Image';
            }

            setChatHistory(prev => prev.map(chat => chat.id === activeChatId ? {
                ...chat,
                messages: updatedMessages,
                title: finalTitle,
            } : chat));

            if (user.useChatMemory) {
                // This runs in the background and updates the user state when complete.
                updateKnowledgeBase(user.knowledgeBase || '', updatedMessages).then(newKnowledgeBase => {
                    // Only update state if the knowledge has actually changed.
                    if (newKnowledgeBase && newKnowledgeBase !== user.knowledgeBase) {
                        handleUpdateUser({ knowledgeBase: newKnowledgeBase });
                    }
                }).catch(error => {
                    console.error("Background knowledge base update failed:", error);
                });
            }

            if (updatedMessages.length === 2 && !currentChat?.avatarId) { // After 1 user message and 1 AI response
                generateChatTitle(updatedMessages).then(aiGeneratedTitle => {
                    if (aiGeneratedTitle) {
                        setChatHistory(prev => prev.map(chat =>
                            chat.id === activeChatId ? { ...chat, title: aiGeneratedTitle } : chat
                        ));
                    }
                }).catch(err => console.error("Failed to generate chat title:", err));
            }
        }

    } catch (error) {
        console.error('Error fetching AI response:', error);
        const errorMessageText = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.';
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: errorMessageText, isError: true } : msg));
        
        const errorMsg: ChatMessage = { id: aiMessageId, sender: 'ai', text: errorMessageText, isError: true, model: selectedModel };
        setChatHistory(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, messages: [...(currentChat?.messages || []), userMessage, errorMsg] } : chat));
    } finally {
      setLoadingState(null);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (loadingState || !user) return;

    setLoadingState('imagining');
    
    const currentChat = chatHistory.find(c => c.id === activeChatId);
    const conversationHistory = currentChat?.messages || [];

    try {
      const { imageUrl, error, finalPrompt } = await generateImageFromContext(prompt, conversationHistory);

      if (error) {
        throw new Error(error);
      }

      if (imageUrl) {
         const aiMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'ai',
            text: finalPrompt ? `Here is an image based on the prompt: "${finalPrompt}"` : 'Here is the image you requested:',
            imageUrl: imageUrl,
            model: selectedModel,
            liked: null,
        };
        setMessages(prev => [...prev, aiMessage]);
        
        const updatedMessages = [...(currentChat?.messages || []), aiMessage];
        setChatHistory(prev => prev.map(chat => chat.id === activeChatId ? {
            ...chat,
            messages: updatedMessages,
        } : chat));
      }

    } catch (error) {
        console.error('Error generating image from context:', error);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'ai',
            text: error instanceof Error ? error.message : 'Sorry, I encountered an error while generating the image.',
            model: selectedModel,
            isError: true,
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoadingState(null);
    }
  };
  
  const handleLoadMoreMessages = useCallback(() => {
    if (isLoadingMore || !hasMoreMessages) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const chat = chatHistory.find(c => c.id === activeChatId);
      if (chat) {
        const totalMessages = chat.messages.length;
        const currentMessageCount = messages.length;
        const nextMessages = chat.messages.slice(
          Math.max(0, totalMessages - currentMessageCount - MESSAGES_PER_PAGE),
          totalMessages - currentMessageCount
        );
        setMessages(prev => [...nextMessages, ...prev]);
        setHasMoreMessages(currentMessageCount + nextMessages.length < totalMessages);
      }
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreMessages, activeChatId, chatHistory, messages.length]);

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
      const updateMessage = (msg: ChatMessage) => {
          if (msg.id === messageId) {
              const currentFeedback = msg.liked;
              if (feedback === 'like') {
                  return { ...msg, liked: currentFeedback === true ? null : true };
              } else {
                  return { ...msg, liked: currentFeedback === false ? null : false };
              }
          }
          return msg;
      };
      setMessages(prev => prev.map(updateMessage));
      setChatHistory(prev => prev.map(chat =>
          chat.id === activeChatId
              ? { ...chat, messages: chat.messages.map(updateMessage) }
              : chat
      ));
  };

  const handleRegenerate = () => {
    if (loadingState) return;
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMessage) return;
    let newMessages = [...messages];
    const lastMessage = newMessages[newMessages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai') {
       newMessages.pop();
    }
    setMessages(newMessages);
    handleSendMessage(lastUserMessage.text);
  };
  
  if (!isLoggedIn || !user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const activeChatSession = chatHistory.find(c => c.id === activeChatId);

  return (
    <div className="flex h-screen w-full bg-light-primary dark:bg-primary overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={() => createNewChat()}
        onNewAvatarChat={(avatar) => createNewChat(avatar)}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        user={user}
        onOpenSettings={openSettings}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        projects={projects}
        onLogout={handleLogout}
        avatars={AVATARS}
      />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          webAccessEnabled={user.webAccessEnabled}
          onToggleWebAccess={() => handleUpdateUser({ webAccessEnabled: !user.webAccessEnabled })}
          user={user}
        />
        <main className="flex-1 overflow-y-auto">
          <ChatWindow
            messages={messages}
            loadingState={loadingState}
            onLoadMore={handleLoadMoreMessages}
            hasMore={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            onFeedback={handleFeedback}
            onRegenerate={handleRegenerate}
            activeChatSession={activeChatSession}
          />
        </main>
        {showSubscriptionPrompt && (
          <SubscriptionPrompt
            onClose={() => setShowSubscriptionPrompt(false)}
            onSubscribe={() => {
              window.open(SUBSCRIPTION_URL, '_blank');
              setShowSubscriptionPrompt(false);
            }}
          />
        )}
        <div className="p-4 bg-light-primary dark:bg-primary border-t border-light-accent dark:border-secondary">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onGenerateImage={handleGenerateImage}
            isLoading={!!loadingState || showSubscriptionPrompt} 
          />
        </div>
      </div>
       <SettingsModal 
        isOpen={settingsState.isOpen}
        onClose={closeSettings}
        onLogout={handleLogout}
        onDeleteAllChats={handleDeleteAllChats}
        onClearMemory={handleClearMemory}
        user={user}
        onUpdateUser={handleUpdateUser}
        theme={user.theme}
        onThemeChange={handleThemeChange}
        initialTab={settingsState.initialTab}
        startInEditMode={settingsState.startInEditMode}
        onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        categories={PROJECT_CATEGORIES}
      />
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default App;