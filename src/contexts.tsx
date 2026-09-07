import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Theme, Project, Document, AgentMessage, APIConfig, RAGChunk } from './types';
import { chunkText, searchChunks, buildRAGContext } from './services';

interface AppState {
  language: Language;
  theme: Theme;
  projects: Project[];
  activeProject: Project | null;
  activeDocument: Document | null;
  agentMessages: AgentMessage[];
  apiConfig: APIConfig;
  ragChunks: RAGChunk[];
  sidebarOpen: boolean;
  agentOpen: boolean;
  settingsOpen: boolean;
}

interface AppContextType extends AppState {
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  createProject: (name: string, description: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (project: Project) => void;
  createDocument: (title: string) => void;
  deleteDocument: (id: string) => void;
  setActiveDocument: (doc: Document) => void;
  updateDocumentContent: (id: string, content: string) => void;
  addAgentMessage: (msg: AgentMessage) => void;
  clearAgentMessages: () => void;
  updateAPIConfig: (config: Partial<APIConfig>) => void;
  setSidebarOpen: (open: boolean) => void;
  setAgentOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  indexProjectRAG: () => void;
  getRAGContext: (query: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => loadFromStorage('plumeai_lang', 'fr'));
  const [theme, setThemeState] = useState<Theme>(() => loadFromStorage('plumeai_theme', 'auto'));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('plumeai_projects', []));
  const [activeProject, setActiveProjectState] = useState<Project | null>(() => loadFromStorage('plumeai_active_project', null));
  const [activeDocument, setActiveDocumentState] = useState<Document | null>(() => loadFromStorage('plumeai_active_doc', null));
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [apiConfig, setApiConfig] = useState<APIConfig>(() => loadFromStorage('plumeai_api', {
    inlineEndpoint: '',
    inlineApiKey: '',
    inlineModel: '',
    agentEndpoint: '',
    agentApiKey: '',
    agentModel: '',
    availableModels: [],
  }));
  const [ragChunks, setRagChunks] = useState<RAGChunk[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    const resolvedTheme = theme === 'auto' ? getSystemTheme() : theme;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(resolvedTheme);
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(resolvedTheme);
  }, [theme]);

  // Persist state
  useEffect(() => { saveToStorage('plumeai_lang', language); }, [language]);
  useEffect(() => { saveToStorage('plumeai_theme', theme); }, [theme]);
  useEffect(() => { saveToStorage('plumeai_projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('plumeai_active_project', activeProject); }, [activeProject]);
  useEffect(() => { saveToStorage('plumeai_active_doc', activeDocument); }, [activeDocument]);
  useEffect(() => { saveToStorage('plumeai_api', apiConfig); }, [apiConfig]);

  const setLanguage = useCallback((lang: Language) => setLanguageState(lang), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const createProject = useCallback((name: string, description: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectState(newProject);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProjectState(null);
      setActiveDocumentState(null);
    }
  }, [activeProject]);

  const setActiveProject = useCallback((project: Project) => {
    setActiveProjectState(project);
    setActiveDocumentState(project.documents[0] || null);
  }, []);

  const createDocument = useCallback((title: string) => {
    if (!activeProject) return;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title,
      content: '',
      projectId: activeProject.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedProject = {
      ...activeProject,
      documents: [...activeProject.documents, newDoc],
      updatedAt: new Date().toISOString(),
    };
    setActiveProjectState(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setActiveDocumentState(newDoc);
  }, [activeProject]);

  const deleteDocument = useCallback((id: string) => {
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      documents: activeProject.documents.filter(d => d.id !== id),
      updatedAt: new Date().toISOString(),
    };
    setActiveProjectState(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (activeDocument?.id === id) {
      setActiveDocumentState(updatedProject.documents[0] || null);
    }
  }, [activeProject, activeDocument]);

  const setActiveDocument = useCallback((doc: Document) => {
    setActiveDocumentState(doc);
  }, []);

  const updateDocumentContent = useCallback((id: string, content: string) => {
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      documents: activeProject.documents.map(d =>
        d.id === id ? { ...d, content, updatedAt: new Date().toISOString() } : d
      ),
      updatedAt: new Date().toISOString(),
    };
    setActiveProjectState(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (activeDocument?.id === id) {
      setActiveDocumentState({ ...activeDocument, content, updatedAt: new Date().toISOString() });
    }
  }, [activeProject, activeDocument]);

  const addAgentMessage = useCallback((msg: AgentMessage) => {
    setAgentMessages(prev => [...prev, msg]);
  }, []);

  const clearAgentMessages = useCallback(() => {
    setAgentMessages([]);
  }, []);

  const updateAPIConfig = useCallback((config: Partial<APIConfig>) => {
    setApiConfig(prev => ({ ...prev, ...config }));
  }, []);

  const indexProjectRAG = useCallback(() => {
    if (!activeProject) return;
    const chunks: RAGChunk[] = [];
    for (const doc of activeProject.documents) {
      const textChunks = chunkText(doc.content);
      textChunks.forEach((text, i) => {
        chunks.push({
          id: `${doc.id}-${i}`,
          documentId: doc.id,
          documentTitle: doc.title,
          content: text,
        });
      });
    }
    setRagChunks(chunks);
  }, [activeProject]);

  const getRAGContext = useCallback((query: string): string => {
    if (ragChunks.length === 0) return '';
    const relevant = searchChunks(query, ragChunks, 3);
    return buildRAGContext(relevant);
  }, [ragChunks]);

  // Auto-index when project changes
  useEffect(() => {
    if (activeProject && activeProject.documents.length > 0) {
      indexProjectRAG();
    }
  }, [activeProject?.id, activeProject?.documents.length]);

  return (
    <AppContext.Provider value={{
      language, theme, projects, activeProject, activeDocument,
      agentMessages, apiConfig, ragChunks, sidebarOpen, agentOpen, settingsOpen,
      setLanguage, setTheme, createProject, deleteProject, setActiveProject,
      createDocument, deleteDocument, setActiveDocument, updateDocumentContent,
      addAgentMessage, clearAgentMessages, updateAPIConfig,
      setSidebarOpen, setAgentOpen, setSettingsOpen,
      indexProjectRAG, getRAGContext,
    }}>
      {children}
    </AppContext.Provider>
  );
}
