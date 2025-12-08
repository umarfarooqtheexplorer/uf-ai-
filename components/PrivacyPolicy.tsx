import React from 'react';
import { XIcon } from './icons';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-light-secondary dark:bg-secondary rounded-lg shadow-2xl border border-light-accent/50 dark:border-accent/50 w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-accent shrink-0">
          <h2 className="text-xl font-bold text-light-text-main dark:text-text-main">Privacy Policy</h2>
          <button onClick={onClose} className="text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto text-light-text-muted dark:text-gray-300">
          <p className="mb-4"><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">1. Introduction</h3>
          <p>Welcome to UF AI ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using UF AI, you agree to the collection and use of information in accordance with this policy.</p>

          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">2. Information We Collect</h3>
          <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li><strong>Personal Data:</strong> When you register using Google or Email, we collect personal information you voluntarily provide to us, such as your name, email address, and profile picture.</li>
            <li><strong>Usage Data:</strong> We automatically collect information about your interactions with the app, such as your chat history (prompts and responses), selected AI models, and feature usage. This data is stored locally on your device using browser storage and is not transmitted to our servers unless required for specific features.</li>
            <li><strong>AI Model Interaction Data:</strong> Your conversations with the AI models are processed by third-party providers (e.g., Google for Gemini, OpenAI for ChatGPT). We do not control how these providers use your data. Please review their respective privacy policies. We do not store your API keys.</li>
          </ul>

          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">3. How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li>Create and manage your account.</li>
            <li>Provide, operate, and maintain our application.</li>
            <li>Improve, personalize, and expand our application.</li>
            <li>Understand and analyze how you use our application.</li>
            <li>Enable features like chat history persistence and user settings.</li>
            <li>Respond to your comments and questions and provide customer service.</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">4. Data Storage and Security</h3>
          <p>Your chat history and project data are stored in your browser's local storage. This means your data remains on your device and is not uploaded to a central server owned by us. We implement reasonable security measures to maintain the safety of your personal information. However, no electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          
          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">5. Third-Party Services</h3>
          <p>Our application uses third-party AI APIs (e.g., Google Gemini API, OpenAI API). When you interact with these models, your prompts are sent to these services. Their use of your information is governed by their privacy policies.</p>

          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">6. Your Data Rights</h3>
          <p>You have control over your data stored in the app:</p>
           <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li>You can view and delete your chat history at any time through the app's settings.</li>
            <li>Logging out or clearing your browser's cache will remove all stored data from your device.</li>
            <li>You can update your account information in the settings panel.</li>
          </ul>

          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">7. Changes to This Privacy Policy</h3>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
          
          <h3 className="text-lg font-semibold text-light-text-main dark:text-text-main mt-6 mb-2">8. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at support@ufai-app.com.</p>
        </main>
      </div>
    </div>
  );
};