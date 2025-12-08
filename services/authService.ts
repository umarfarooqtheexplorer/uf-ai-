import { User } from '../types';

/**
 * --- SECURITY REFACTOR ---
 * This service has been refactored to align with security best practices.
 * All functions are now designed to communicate with a secure backend API.
 * This architecture prevents exposing API keys, securely manages sessions
 * using HttpOnly cookies (handled by a backend), and centralizes user data management.
 * 
 * NOTE: Because a backend is not implemented, these functions contain mock
 * logic to keep the application partially functional for demonstration. 
 * A page refresh will reset the application state.
 */

export const signInWithName = async (name: string): Promise<User> => {
    /**
     * REAL IMPLEMENTATION:
     * This would make a POST request to your backend with the name.
     * The backend would find or create a user, create a session, and respond
     * with a secure, HttpOnly cookie and user data.
     * 
     * const response = await fetch('/api/auth/login', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ name }),
     * });
     * if (!response.ok) { //...error handling }
     * return response.json();
     */
    
    // MOCK IMPLEMENTATION for demonstration:
    console.log(`[MOCK] Signing in with name: ${name}. In a real app, a secure HttpOnly cookie would be set by the server.`);

    if (!name.trim()) {
        throw new Error("Name cannot be empty.");
    }
    
    // Create a mock user object. In a real backend, this would come from a database.
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
    };
};

export const checkSession = (onLoginSuccess: (user: User) => void) => {
    /**
     * REAL IMPLEMENTATION:
     * This function would ping a session endpoint. The browser automatically sends
     * the session cookie. If the cookie is valid, the backend responds with
     * the user data. If not, it responds with a 401 Unauthorized error.
     * 
     * fetch('/api/auth/session')
     *   .then(response => {
     *     if (response.ok) return response.json();
     *     throw new Error('No session');
     *   })
     *   .then(user => onLoginSuccess(user))
     *   .catch(() => console.log('No active session found.'));
     */
    
    // MOCK IMPLEMENTATION: No session is persisted on the client.
    console.log("[MOCK] No client-side session. A backend is required for session persistence across page loads.");
};

export const signOut = (onLogoutSuccess: () => void) => {
    /**
     * REAL IMPLEMENTATION:
     * This sends a request to the backend to invalidate the session token
     * and clear the HttpOnly cookie.
     * 
     * fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
     *     onLogoutSuccess();
     * });
     */
    
    // MOCK IMPLEMENTATION:
    console.log("[MOCK] Signing out. In a real app, this would clear the server session and HttpOnly cookie.");
    onLogoutSuccess();
};

export const updateUserProfile = async (updatedFields: Partial<User>): Promise<User> => {
    /**
     * REAL IMPLEMENTATION:
     * Sends the updated fields to the backend. The server uses the session cookie
     * to identify the user, validates the data, updates the database, and
     * returns the complete, updated user object.
     * 
     * const response = await fetch('/api/users/me', {
     *     method: 'PUT',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(updatedFields),
     * });
     * if (!response.ok) {
     *     const err = await response.json();
     *     throw new Error(err.message || 'Update failed');
     * }
     * return response.json();
     */

    // MOCK IMPLEMENTATION:
    console.log("[MOCK] Updating user profile. In a real app, this would be persisted to a database.");
    if (!updatedFields.name) throw new Error("Name is required.");

    // The component state will be the source of truth for the full user object in this mock setup.
    // This mock just simulates getting an updated object back.
    return {
        uid: 'mock-uid-static',
        name: 'Updated Name',
        email: 'updated.name@ufai.local',
        avatarUrl: `https://ui-avatars.com/api/?name=Updated&background=1a1a2e&color=dcdcdc&bold=true`,
        knowledgeBase: '',
        webAccessEnabled: true,
        useChatMemory: true,
        chatStyle: 'Friendly',
        plan: 'Free',
        theme: 'dark',
        selectedModelId: 'gemini-2.5-flash',
        messageCount: 0,
        ...updatedFields,
    } as User;
};