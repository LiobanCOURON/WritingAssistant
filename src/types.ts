export type Language = 'fr' | 'es' | 'zh' | 'de' | 'ja';
export type Theme = 'light' | 'dark' | 'auto';
export type AnimationLevel = 'none' | 'few' | 'more' | 'all' | 'chaos' | 'custom';

export interface CustomAnimationPreferences {
  particles: boolean;
  hover: boolean;
  transitions: boolean;
  entrance: boolean;
  feedback: boolean;
  micro: boolean;
  iconsBounce: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  folders: Folder[];
  notes: ProjectNotes;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  chapters: Chapter[];
  tags: string[];
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  folderId: string;
  projectId: string;
  tags: string[];
  memory: string;
  createdAt: string;
  updatedAt: string;
}

// Notes system (Type.ai inspired)
export interface ProjectNotes {
  overview: OverviewNote;
  characters: CharacterNote[];
  places: PlaceNote[];
  moments: MomentNote[];
}

export interface OverviewNote {
  premise: string;
  genre: string;
  tone: string;
  themes: string[];
  setting: string;
  plotSummary: string;
  worldRules: string;
  audience: string;
  goals: string;
}

export interface CharacterNote {
  id: string;
  name: string;
  aliases: string[];
  age: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  fears: string;
  relationships: string;
  conflicts: string;
  development: string;
  importantFacts: string[];
  avatar?: string;
}

export interface PlaceNote {
  id: string;
  name: string;
  type: string;
  layout: string;
  landmarks: string[];
  atmosphere: string;
  history: string;
  inhabitants: string;
  importantObjects: string[];
  events: string;
  rules: string;
}

export interface MomentNote {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'decision' | 'revelation' | 'conversation' | 'confrontation' | 'turning_point' | 'flashback' | 'relationship_change';
  timing: {
    relation: 'before' | 'after' | 'during' | 'exact';
    referenceMomentId?: string;
    timeOffset?: string;
  };
  duration?: string;
  charactersInvolved: string[];
  placeId?: string;
  consequences: string;
  linkedMoments: string[];
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
  chapterId: string;
  folderId: string;
  projectId: string;
  content: string;
  embedding?: number[];
}

export interface InlineSuggestion {
  text: string;
  position: number;
}

export interface SlashCommand {
  name: string;
  description: string;
  icon: string;
  action: string;
}
