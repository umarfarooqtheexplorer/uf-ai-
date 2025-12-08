import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { ChatMessage, LoadingState, ChatSession } from '../types';
import { 
    UserIcon, CopyIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, 
    RegenerateIcon, EllipsisHorizontalIcon, LinkIcon, SparklesIcon,
    DownloadIcon
} from './icons';
import { AVATARS, SUBSCRIPTION_URL } from '../constants';
import { CodeBlock } from './CodeBlock';


interface ChatBubbleProps {
  message: ChatMessage;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onRegenerate: () => void;
  isLastAiMessage: boolean;
  avatarId?: string;
}

const TypingIndicator = () => (
    <>
        <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-light-text-muted/70 dark:bg-gray-400/70 rounded-full animate-wave-typing"></div>
            <div className="w-2 h-2 bg-light-text-muted/80 dark:bg-gray-400/80 rounded-full animate-wave-typing" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-light-text-muted dark:bg-gray-400 rounded-full animate-wave-typing" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <style>{`
            @keyframes wave-typing {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            .animate-wave-typing { animation: wave-typing 1.2s infinite ease-in-out; }
        `}</style>
    </>
);


const ActionButton: React.FC<{ icon: React.ElementType, onClick?: () => void, isActive?: boolean, children?: React.ReactNode, disabled?: boolean }> = ({ icon: Icon, onClick, isActive, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded-full transition-colors duration-200 ${isActive ? 'text-highlight bg-highlight/20' : 'text-light-text-muted dark:text-gray-400 hover:bg-light-accent dark:hover:bg-accent/80 hover:text-light-text-main dark:hover:text-text-main'} disabled:opacity-50 disabled:cursor-not-allowed`}>
        <Icon className="w-5 h-5" />
        {children}
    </button>
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onFeedback, onRegenerate, isLastAiMessage, avatarId }) => {
  const isUser = message.sender === 'user';
  const ModelIcon = message.model?.icon;
  const [copied, setCopied] = useState(false);
  const avatar = avatarId ? AVATARS.find(a => a.id === avatarId) : undefined;

  const handleCopy = () => {
      navigator.clipboard.writeText(message.text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };
  
  const handleDownload = () => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `uf-ai-image-${message.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = (text: string) => {
    if (text.includes(SUBSCRIPTION_URL)) {
      const introLines: string[] = [];
      const featureLines: string[] = [];
      let isFeatureSection = false;

      const lines = text.split('\n').filter(line => line.trim() !== '' && !line.includes(SUBSCRIPTION_URL));

      for (const line of lines) {
        if (line.trim().startsWith('*')) {
          isFeatureSection = true;
          featureLines.push(line.trim().substring(1).trim());
        } else if (!isFeatureSection) {
          introLines.push(line);
        }
      }
      
      return (
        <div>
          {introLines.map((line, index) => <p key={`intro-${index}`} className="mb-2">{line}</p>)}
          <ul className="list-disc list-inside my-4 space-y-2">
            {featureLines.map((feature, index) => (
              <li key={`feature-${index}`}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={() => window.open(SUBSCRIPTION_URL, '_blank')}
            className="w-full mt-4 bg-highlight text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-highlight/90 transition-colors duration-200 flex items-center justify-center"
          >
            Subscribe Now
          </button>
        </div>
      );
    }
    
    // Split text by code blocks, keeping the delimiters
    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

    return (
        <div className="text-left">
            {parts.map((part, index) => {
                const codeBlockRegex = /^\`\`\`(\w+)?\n([\s\S]+?)\n\`\`\`$/;
                const match = part.match(codeBlockRegex);

                if (match) {
                    const language = match[1] || '';
                    const code = match[2].trim();
                    return <CodeBlock key={index} language={language} code={code} />;
                } else if (part.trim()) {
                    return <p key={index} className="whitespace-pre-wrap">{part}</p>;
                }
                return null;
            })}
        </div>
    );
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-accent flex items-center justify-center shrink-0">
            {avatar ? (
                <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full rounded-full object-cover" />
            ) : (
                ModelIcon ? <ModelIcon className="w-5 h-5 text-light-text-main dark:text-text-main" /> : null
            )}
        </div>
      )}
      <div className={`max-w-xl`}>
        <div className={`p-4 rounded-2xl ${
            isUser
              ? 'bg-highlight text-white rounded-br-none'
              : `bg-light-secondary dark:bg-secondary text-light-text-main dark:text-text-main rounded-bl-none ${message.isError ? 'border border-red-500' : 'border border-transparent'}`
          }`}>
          {message.imageUrl && (
              <div className="relative group mb-2">
                  <img 
                      src={message.imageUrl} 
                      alt="Generated image" 
                      className="rounded-lg max-w-xs max-h-64 object-contain"
                  />
                   {message.sender === 'ai' && (
                     <button
                        onClick={handleDownload}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Download image"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                   )}
              </div>
          )}
          
          {isLastAiMessage && message.text.length === 0 && !message.imageUrl && <TypingIndicator />}
          
          {renderContent(message.text)}
          
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-light-accent/50 dark:border-accent/50">
                <h4 className="text-xs font-semibold uppercase text-light-text-muted dark:text-gray-400 mb-2">Sources</h4>
                <div className="flex flex-col gap-2">
                    {message.sources.map((source, index) => (
                        <a 
                            key={index}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-highlight/90 hover:text-highlight hover:underline truncate flex items-center gap-2"
                        >
                            <LinkIcon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                        </a>
                    ))}
                </div>
            </div>
          )}
        </div>

        {!isUser && (
           <div className="mt-2 px-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <ActionButton icon={CopyIcon} onClick={handleCopy} />
                    <ActionButton icon={ThumbsUpIcon} onClick={() => onFeedback(message.id, 'like')} isActive={message.liked === true} />
                    <ActionButton icon={ThumbsDownIcon} onClick={() => onFeedback(message.id, 'dislike')} isActive={message.liked === false}/>
                    <ActionButton icon={ShareIcon} />
                    {isLastAiMessage && <ActionButton icon={RegenerateIcon} onClick={onRegenerate} />}
                    <ActionButton icon={EllipsisHorizontalIcon} />
                </div>
            </div>
           </div>
        )}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center shrink-0">
            <UserIcon className="w-5 h-5 text-white dark:text-text-main" />
        </div>
      )}
    </div>
  );
};

const LoadingIndicator: React.FC<{ loadingState: LoadingState | null }> = ({ loadingState }) => {
    let text = 'Thinking...';
    if (loadingState === 'imagining') {
        text = 'Creating image...';
    } else if (loadingState === 'analyzing') {
        text = 'Analyzing...';
    }
    
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-accent flex items-center justify-center shrink-0">
                <SparklesIcon className="w-5 h-5 text-highlight animate-pulse" />
            </div>
            <div className="max-w-xl px-4 py-3 rounded-2xl bg-light-secondary dark:bg-secondary rounded-bl-none">
                <div className="flex items-center gap-2">
                    <div className="flex items-end justify-center space-x-1.5 h-6">
                        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-wave" style={{ animationDelay: '-0.3s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '-0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-wave" style={{ animationDelay: '0s' }}></div>
                    </div>
                    <span className="text-sm text-light-text-muted dark:text-gray-400 italic">{text}</span>
                </div>
            </div>
             <style>{`
                @keyframes wave {
                  0%, 60%, 100% {
                    transform: translateY(0);
                  }
                  30% {
                    transform: translateY(-10px);
                  }
                }
                .animate-wave {
                  animation: wave 1.2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};


interface ChatWindowProps {
  messages: ChatMessage[];
  loadingState: LoadingState | null;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onRegenerate: () => void;
  activeChatSession?: ChatSession | null;
}

const IntroBubble: React.FC<{ text: string; avatarId: string }> = ({ text, avatarId }) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-accent flex items-center justify-center shrink-0">
                {avatar && <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full rounded-full object-cover" />}
            </div>
            <div className={`max-w-xl`}>
                <div className={`p-4 rounded-2xl bg-light-secondary dark:bg-secondary text-light-text-main dark:text-text-main rounded-bl-none`}>
                    <p className="whitespace-pre-wrap">{text}</p>
                </div>
            </div>
        </div>
    );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, loadingState, onLoadMore, hasMore, isLoadingMore, onFeedback, onRegenerate, activeChatSession }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  const showIntro = !!(activeChatSession?.avatarId && activeChatSession.introMessage && messages.length === 0 && !loadingState);

  useLayoutEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) return;

    if (isLoadingMore) {
      // About to load more messages, save the current scroll height.
      prevScrollHeightRef.current = scrollNode.scrollHeight;
    } else if (prevScrollHeightRef.current !== null) {
      // More messages have been prepended, restore scroll position.
      scrollNode.scrollTop = scrollNode.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null; // Reset for next load
    } else {
      // Default behavior for new messages added to the end.
      scrollNode.scrollTop = scrollNode.scrollHeight;
    }
  }, [messages, isLoadingMore]);

  useEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) return;

    const handleScroll = () => {
      if (scrollNode.scrollTop === 0 && hasMore && !isLoadingMore) {
        onLoadMore();
      }
    };

    scrollNode.addEventListener('scroll', handleScroll);
    return () => scrollNode.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);
  
  let lastAiMessageIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'ai') {
        lastAiMessageIndex = i;
        break;
    }
  }


  return (
    <div className="p-6 h-full overflow-y-auto" ref={scrollRef}>
      <div className="flex flex-col space-y-6">
        {isLoadingMore && <div className="text-center text-light-text-muted dark:text-gray-400 py-4">Loading history...</div>}
        {showIntro && <IntroBubble text={activeChatSession.introMessage!} avatarId={activeChatSession.avatarId!} />}
        {messages.map((msg, index) => (
          <ChatBubble 
            key={msg.id} 
            message={msg}
            onFeedback={onFeedback}
            onRegenerate={onRegenerate}
            isLastAiMessage={msg.sender === 'ai' && index === lastAiMessageIndex}
            avatarId={activeChatSession?.avatarId}
          />
        ))}
        {loadingState && loadingState !== 'generating' && <LoadingIndicator loadingState={loadingState} />}
      </div>
    </div>
  );
};