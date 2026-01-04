import React, { useState, useEffect } from 'react';
import { XIcon, SparklesIcon, SpinnerIcon, PenIcon, RefreshIcon, CheckIcon } from './icons';
import { Avatar } from '../types';

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  onUpdate?: (updatedAvatar: Avatar) => void;
  isLoading: boolean;
  editingAvatar?: Avatar | null;
}

const LOADING_MESSAGES = [
  "Connecting to global data networks...",
  "Searching biographical databases...",
  "Analyzing psychological profiles...",
  "Synthesizing unique speech patterns...",
  "Drafting custom system instructions...",
  "Initiating high-fidelity portrait rendering...",
  "Finalizing neural persona connection..."
];

export const CreateAvatarModal: React.FC<CreateAvatarModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  onUpdate,
  isLoading, 
  editingAvatar 
}) => {
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [greeting, setGreeting] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);

  // Initialize fields if editing
  useEffect(() => {
    if (editingAvatar) {
      setName(editingAvatar.name);
      setSystemPrompt(editingAvatar.systemPrompt || '');
      setGreeting(editingAvatar.greeting || '');
      setImageUrl(editingAvatar.imageUrl || '');
      setIsAdvancedVisible(true);
    } else {
      setName('');
      setSystemPrompt('');
      setGreeting('');
      setImageUrl('');
      setIsAdvancedVisible(false);
    }
  }, [editingAvatar, isOpen]);

  useEffect(() => {
    let messageInterval: number;
    let progressInterval: number;

    if (isLoading) {
      setMessageIndex(0);
      setProgress(5);
      
      messageInterval = window.setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);

      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + (Math.random() * 5);
        });
      }, 1000);
    } else {
      setProgress(0);
      setMessageIndex(0);
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    if (editingAvatar && onUpdate) {
      onUpdate({
        ...editingAvatar,
        name: name.trim(),
        systemPrompt: systemPrompt.trim(),
        greeting: greeting.trim(),
        imageUrl: imageUrl
      });
      onClose();
    } else {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-light-secondary dark:bg-secondary rounded-2xl shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-lg overflow-hidden transform transition-all animate-scale-up">
        <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-accent">
          <h2 className="text-lg font-bold text-light-text-main dark:text-text-main">
            {editingAvatar ? `Edit ${editingAvatar.name}` : 'Create Custom AI Avatar'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors disabled:opacity-30"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!isLoading && (
            <div className="flex justify-center mb-6 relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-highlight/20 shadow-xl relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-light-accent dark:bg-accent/50 flex items-center justify-center text-highlight">
                    <SparklesIcon className="w-10 h-10" />
                  </div>
                )}
                {editingAvatar && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-[10px] text-white font-bold uppercase tracking-tighter">AI Managed</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="flex justify-center items-center mb-6 relative">
                <div className="p-4 rounded-full bg-highlight/10 text-highlight transition-all duration-500 scale-110 shadow-lg shadow-highlight/20">
                   <SparklesIcon className="w-12 h-12 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-highlight/30 border-t-highlight rounded-full animate-spin"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-light-text-main dark:text-white mb-2">Searching the Multiverse...</h3>
              <div className="mt-8 space-y-4 animate-fade-in">
                <div className="w-full bg-light-accent dark:bg-accent/30 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div 
                    className="h-full bg-highlight transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-highlight font-mono uppercase tracking-widest animate-pulse h-4">
                  {LOADING_MESSAGES[messageIndex]}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-light-text-muted dark:text-gray-500 uppercase mb-1 ml-1">Identity Name</label>
                <input
                  type="text"
                  autoFocus
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nikola Tesla, or Batman"
                  className="w-full bg-light-primary dark:bg-primary/50 border-2 border-light-accent dark:border-accent rounded-lg px-4 py-2.5 text-light-text-main dark:text-text-main focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                />
              </div>

              {isAdvancedVisible && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-light-text-muted dark:text-gray-500 uppercase mb-1 ml-1">Iconic Greeting</label>
                    <textarea
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      rows={2}
                      className="w-full bg-light-primary dark:bg-primary/50 border-2 border-light-accent dark:border-accent rounded-lg px-4 py-2.5 text-sm text-light-text-main dark:text-text-main focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-light-text-muted dark:text-gray-500 uppercase mb-1 ml-1">Neural Persona (System Prompt)</label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={6}
                      className="w-full bg-light-primary dark:bg-primary/50 border-2 border-light-accent dark:border-accent rounded-lg px-4 py-2.5 text-xs font-mono text-light-text-main dark:text-text-main focus:outline-none focus:ring-2 focus:ring-highlight/50 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!name.trim() || isLoading}
                  className="w-full bg-highlight text-white font-bold py-3 px-6 rounded-lg hover:bg-highlight/90 transition-all flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg shadow-highlight/20"
                >
                  {editingAvatar ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Bring to Life</span>
                    </>
                  )}
                </button>
                
                {!editingAvatar && (
                   <p className="text-[10px] text-center text-light-text-muted dark:text-gray-500 italic">
                      AI will automatically research biography and generate a portrait.
                   </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};