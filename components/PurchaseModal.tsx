import React from 'react';
import { XIcon, CheckIcon, SparklesIcon } from './icons';
import { SUBSCRIPTION_URL } from '../constants';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProPlanFeatures = [
    "Unlimited messages",
    "Access to advanced AI models (Grok 3 & ChatGPT Plus-level)",
    "Faster responses and priority processing",
    "Memory mode for smarter follow-ups",
    "Enhanced image generation",
    "Voice chat and document uploads",
    "AI Tools Pack for coding, writing, SEO, and more",
    "Custom AI personalities and early access to new features",
    "Priority support",
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }
    
    const handleSubscribeClick = () => {
        window.open(SUBSCRIPTION_URL, '_blank');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="purchase-modal-title"
        >
            <div className="bg-light-secondary dark:bg-secondary rounded-2xl shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-md m-4 transform transition-all animate-fade-in-up">
                <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-accent">
                    <h2 id="purchase-modal-title" className="text-lg font-semibold text-light-text-main dark:text-text-main">Upgrade to UF AI Pro</h2>
                    <button onClick={onClose} className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-8 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <SparklesIcon className="w-12 h-12 text-highlight" />
                    </div>
                    <h3 className="text-2xl font-bold text-light-text-main dark:text-white">Unlock Pro Features</h3>
                    <p className="text-light-text-muted dark:text-gray-400 mt-2">You've reached your free message limit. Upgrade to unlock unlimited messages and pro features.</p>

                    <div className="my-8 p-6 bg-light-primary/50 dark:bg-primary/50 rounded-lg border border-light-accent dark:border-accent text-left">
                        <ul className="space-y-3">
                            {ProPlanFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                    <span className="text-light-text-main dark:text-text-main">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-4xl font-bold text-light-text-main dark:text-white">
                        $5<span className="text-lg font-medium text-light-text-muted dark:text-gray-400">/month</span>
                    </p>
                    
                    <button 
                        onClick={handleSubscribeClick}
                        className="w-full mt-8 bg-highlight text-white font-semibold py-3 px-6 rounded-lg hover:bg-highlight/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        Subscribe Now
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                        You can cancel your subscription at any time. By subscribing, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};