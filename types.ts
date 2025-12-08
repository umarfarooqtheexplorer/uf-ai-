import React from 'react';

export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  knowledgeBase?: string;
  webAccessEnabled: boolean;
  useChatMemory: boolean;
  chatStyle: 'Friendly' | 'Professional' | 'Creative';
  plan: 'Free' | 'Pro';
  theme: 'light' | 'dark';
  selectedModelId: string;
  messageCount: number;
}

export interface AIModel {
  id: string;
  name:string;
  provider: string;
  icon: React.FC<{ className?: string }>;
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp?: number;
  model?: AIModel;
  isError?: boolean;
  liked?: boolean | null; // true for like, false for dislike, null for neutral
  sources?: Source[];
}

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: AIModel;
  timestamp: number;
  projectId?: string | null;
  avatarId?: string;
  introMessage?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  chatIds: string[];
}

export type TabId = 'General' | 'Notifications' | 'Personalization' | 'Apps & Connectors' | 'Data controls' | 'Security' | 'Parental controls' | 'Account' | 'About';

export type LoadingState = 'generating' | 'analyzing' | 'imagining';