export type Language = 'fr' | 'es' | 'zh' | 'de' | 'ja';
export type Theme = 'light' | 'dark' | 'auto';
export type AnimationLevel = 'none' | 'few' | 'most' | 'all' | 'custom';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  tags: string[]; // tag ids
  notes: ProjectNote[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  chapters: Chapter[];
  tags: string[];
  order: number;
  collapsed: boolean;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  chapterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  folders: Folder[];
  notes: ProjectNote[]; // project-level notes
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolResult?: string;
  timestamp: string;
}

export interface APIConfig {
  inlineEndpoint: string;
  inlineApiKey: string;
  inlineModel: string;
  agentEndpoint: string;
  agentApiKey: string;
  agentModel: string;
  availableModels: string[];
}

export interface RAGChunk {
  id: string;
  chapterId: string;
  chapterTitle: string;
  folderName: string;
  content: string;
}

export interface InlineSuggestion {
  text: string;
  words: string[];
  position: number;
}

export interface SlashCommand {
  name: string;
  description: string;
  icon: string;
  action: string;
}
