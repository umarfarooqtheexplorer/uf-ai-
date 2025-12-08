import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, XCircleIcon, MicrophoneIcon, SparklesIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (message: string, file?: File) => void;
  onGenerateImage: (prompt: string) => void;
  isLoading: boolean;
}

// Add a minimal interface for SpeechRecognition to fix type errors,
// as the Web Speech API is not part of the standard TypeScript DOM library.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// Cast window to `any` to access non-standard properties and rename the variable 
// to avoid shadowing the global SpeechRecognition type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onGenerateImage, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use the defined SpeechRecognition interface as the type for the ref.
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(resizeTextarea, [text]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    // Use the renamed constant to check for browser support.
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }
    
    // Use the renamed constant to create a new SpeechRecognition instance.
    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => (prev ? prev + ' ' : '') + transcript.trim());
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
       if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to use voice input.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text, file as File);
      setText('');
      setFile(null);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
        alert('Voice input is not supported on this browser.');
        return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch(e) {
        console.error("Error starting recognition", e);
        setIsListening(false);
      }
    }
  };
  
  const handleImagine = () => {
    if (!isLoading) {
      onGenerateImage(text);
      setText('');
    }
  };


  return (
    <div className="flex flex-col">
        {previewUrl && (
            <div className="relative w-24 h-24 mb-2 p-1 bg-light-secondary dark:bg-secondary rounded-lg self-start">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded" />
            <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                aria-label="Remove image"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3 bg-light-secondary dark:bg-secondary p-2 rounded-xl border border-light-accent dark:border-accent">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-text-main rounded-full transition-colors duration-200 disabled:opacity-50 shrink-0"
                aria-label="Attach file"
            >
                <PaperclipIcon className="w-6 h-6" />
            </button>
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here, or use the microphone..."
                className="flex-1 bg-transparent p-2 text-light-text-main dark:text-text-main placeholder-light-text-muted dark:placeholder-gray-500 focus:outline-none resize-none max-h-40"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={handleImagine}
                disabled={isLoading || !text.trim()}
                className="w-10 h-10 flex items-center justify-center text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-text-main rounded-full transition-colors duration-200 disabled:opacity-50 shrink-0"
                aria-label="Generate image from prompt"
            >
                <SparklesIcon className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={handleListen}
                disabled={isLoading}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-50 shrink-0 ${
                    isListening
                    ? 'text-highlight bg-highlight/20 animate-pulse'
                    : 'text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-text-main'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
                <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button
                type="submit"
                disabled={isLoading || (!text.trim() && !file)}
                className="w-10 h-10 flex items-center justify-center bg-highlight rounded-full text-white transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-highlight/90 shrink-0"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
    </div>
  );
};