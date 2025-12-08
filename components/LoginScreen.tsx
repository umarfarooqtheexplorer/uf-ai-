import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { User } from '../types';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
import { signInWithName } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        setError('Please enter your name to continue.');
        return;
    }
    try {
        setError('');
        const user = await signInWithName(name);
        onLogin(user);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown login error occurred.";
        console.error("Sign-in error:", err);
        setError(errorMessage);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen w-screen bg-light-primary dark:bg-gradient-to-br dark:from-primary dark:via-secondary dark:to-accent">
        <div className="p-8 bg-light-secondary/80 dark:bg-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-light-accent/50 dark:border-accent/50 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center items-center mb-6">
            <SparklesIcon className="w-16 h-16 text-highlight" />
            <h1 className="text-5xl font-bold ml-4 text-light-text-main dark:text-white">UF AI</h1>
          </div>
          
          <p className="text-light-text-main dark:text-text-main mb-2 text-lg">Welcome to UF AI</p>
          <p className="text-light-text-muted dark:text-gray-400 mb-8">Enter your name to start chatting.</p>

          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-light-primary dark:bg-primary/50 border-2 border-light-accent dark:border-accent rounded-lg px-4 py-3 text-light-text-main dark:text-text-main placeholder-light-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-highlight/80 focus:border-highlight/50"
                    placeholder="Enter your name"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-highlight text-white font-semibold py-3 px-6 rounded-lg hover:bg-highlight/90 transition-colors duration-200 flex items-center justify-center"
            >
                Continue
            </button>
          </form>
          
          <p className="text-xs text-gray-500 mt-6 text-center">
            By continuing, you agree to our{' '}
            <button onClick={() => setIsTermsOpen(true)} className="underline hover:text-highlight transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button onClick={() => setIsPrivacyOpen(true)} className="underline hover:text-highlight transition-colors">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
      {isTermsOpen && <TermsOfService onClose={() => setIsTermsOpen(false)} />}
      {isPrivacyOpen && <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />}
    </>
  );
};