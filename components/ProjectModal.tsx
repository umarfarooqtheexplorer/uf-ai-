import React, { useState } from 'react';
import { XIcon, SettingsIcon, LightbulbIcon, HappyPlusIcon } from './icons';
import { ProjectCategory } from '../types';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject: (name: string, category: ProjectCategory) => void;
    categories: ProjectCategory[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onCreateProject, categories }) => {
    const [projectName, setProjectName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>(categories[4]);

    const handleCreate = () => {
        if (projectName.trim()) {
            onCreateProject(projectName.trim(), selectedCategory);
            setProjectName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300" style={{ opacity: isOpen ? 1 : 0 }}>
            <div className="bg-light-secondary dark:bg-secondary rounded-2xl shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-lg m-4 transform transition-all animate-fade-in-up">
                <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-accent">
                    <h2 className="text-lg font-semibold text-light-text-main dark:text-text-main">Project name</h2>
                    <div className="flex items-center gap-2">
                        <button className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors">
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                <div className="p-6">
                    <div className="relative mb-6">
                        <HappyPlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-light-text-muted dark:text-gray-500" />
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Copenhagen Trip"
                            className="w-full bg-light-primary dark:bg-primary border-2 border-light-accent dark:border-accent rounded-lg pl-11 pr-4 py-3 text-light-text-main dark:text-text-main placeholder-light-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-highlight/80 focus:border-highlight/50"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {categories.map(category => {
                            const Icon = category.icon;
                            const isSelected = selectedCategory.id === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-accent/80 border-highlight text-white' 
                                        : 'bg-light-primary dark:bg-primary border-light-accent dark:border-accent text-light-text-muted dark:text-gray-300 hover:bg-light-accent dark:hover:bg-accent/50 hover:border-gray-500'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{category.name}</span>
                                </button>
                            )
                        })}
                    </div>
                    <div className="bg-light-primary/50 dark:bg-primary/50 rounded-lg p-4 flex items-start gap-3 mb-6">
                        <LightbulbIcon className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                        <p className="text-light-text-muted dark:text-gray-400 text-sm">
                            Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleCreate}
                            disabled={!projectName.trim()}
                            className="px-6 py-2.5 bg-gray-700 dark:bg-gray-300 text-gray-200 dark:text-primary font-semibold rounded-lg hover:bg-black dark:hover:bg-white transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            Create project
                        </button>
                    </div>
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