
import { User } from '../types';

export const signInWithName = async (name: string): Promise<User> => {
    console.log(`[MOCK] Signing in with name: ${name}.`);

    if (!name.trim()) {
        throw new Error("Name cannot be empty.");
    }
    
    return {
        uid: `mock-uid-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@ufai.local`,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=dcdcdc&bold=true`,
        knowledgeBase: '',
        webAccessEnabled: true,
        useChatMemory: true,
        chatStyle: 'Friendly',
        plan: 'Free',
        theme: 'light',
        selectedModelId: 'gemini-2.5-flash',
        messageCount: 0,
        // Default Settings
        language: 'English',
        spokenLanguage: 'Auto-detect',
        voice: 'Juniper',
        accentColor: 'Default',
        notifications: {
            responses: 'Push',
            tasks: 'Push, Email',
            recommendations: 'Push, Email'
        },
        smartSuggestions: true,
        autoSummarize: false,
        mfaEnabled: false,
        connectedApps: []
    };
};

export const checkSession = (onLoginSuccess: (user: User) => void) => {};
export const signOut = (onLogoutSuccess: () => void) => { onLogoutSuccess(); };
export const updateUserProfile = async (updatedFields: Partial<User>): Promise<User> => {
    return { ...updatedFields } as User;
};
