import React from 'react';
import { 
    XIcon, SparklesIcon, ProjectsIcon, LibraryIcon, RocketLaunchIcon, ScaleIcon, BrainIcon 
} from './icons';
import { SUBSCRIPTION_URL } from '../constants';

interface SubscriptionPromptProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const ProPlanFeatures = [
    { text: "Master advanced tasks and topics", icon: SparklesIcon },
    { text: "Tackle big projects with unlimited messages", icon: ProjectsIcon },
    { text: "Create high-quality images at any scale", icon: LibraryIcon },
    { text: "Keep full context with maximum memory", icon: BrainIcon },
    { text: "Run research and plan tasks with agents", icon: RocketLaunchIcon },
    { text: "Scale your projects and automate", icon: ScaleIcon },
];

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ onClose, onSubscribe }) => {
    
    const handleSubscribeClick = () => {
        window.open(SUBSCRIPTION_URL, '_blank');
        onSubscribe();
    };
    
    return (
        <div 
            className="absolute inset-0 bg-light-primary/80 dark:bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="subscription-prompt-title"
        >
            <div className="bg-light-secondary dark:bg-[#1C1C1E] text-light-text-main dark:text-white rounded-2xl shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-sm m-4 transform transition-all animate-fade-in-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors z-10">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <h2 id="subscription-prompt-title" className="text-4xl font-bold">Pro</h2>
                    
                    <div className="my-6">
                        <span className="text-5xl font-bold align-middle">$5</span>
                        <span className="text-lg text-light-text-muted dark:text-gray-400 align-baseline ml-2">/ month</span>
                    </div>

                    <p className="text-lg text-light-text-muted dark:text-gray-300 mb-6">Maximize your productivity</p>

                    <button 
                        onClick={handleSubscribeClick}
                        className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                        Get Pro
                    </button>

                    <ul className="mt-8 space-y-4 text-left">
                        {ProPlanFeatures.map((feature, index) => {
                             const Icon = feature.icon;
                             return (
                                <li key={index} className="flex items-center gap-4">
                                    <Icon className="w-6 h-6 text-light-text-muted dark:text-gray-400 shrink-0" />
                                    <span className="text-light-text-main dark:text-text-main">{feature.text}</span>
                                </li>
                            );
                        })}
                    </ul>
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