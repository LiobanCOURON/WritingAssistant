export type Language = 'fr' | 'es' | 'zh' | 'de' | 'ja';
export type Theme = 'light' | 'dark' | 'auto';

export interface Project {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
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
  documentId: string;
  documentTitle: string;
  content: string;
  embedding?: number[];
}

export interface InlineSuggestion {
  text: string;
  position: number;
}
