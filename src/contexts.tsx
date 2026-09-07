import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Theme, Project, Folder, Chapter, ProjectNote, AgentMessage, APIConfig, RAGChunk, Tag, AnimationLevel } from './types';
import { chunkText, buildRAGContext } from './services';

interface AppState {
  language: Language;
  theme: Theme;
  animationLevel: AnimationLevel;
  projects: Project[];
  activeProjectId: string | null;
  activeFolderId: string | null;
  activeChapterId: string | null;
  agentMessages: AgentMessage[];
  apiConfig: APIConfig;
  ragChunks: RAGChunk[];
  sidebarOpen: boolean;
  agentOpen: boolean;
  settingsOpen: boolean;
  searchQuery: string;
  // Setters
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
  setAnimationLevel: (a: AnimationLevel) => void;
  setActiveProject: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  setActiveChapter: (id: string | null) => void;
  addAgentMessage: (msg: AgentMessage) => void;
  clearAgentMessages: () => void;
  setApiConfig: (config: Partial<APIConfig>) => void;
  setSidebarOpen: (open: boolean) => void;
  setAgentOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  // Project operations
  createProject: (name: string, description: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  // Folder operations
  createFolder: (projectId: string, name: string) => void;
  deleteFolder: (projectId: string, folderId: string) => void;
  toggleFolderCollapse: (projectId: string, folderId: string) => void;
  // Chapter operations
  createChapter: (projectId: string, folderId: string, title: string) => void;
  deleteChapter: (projectId: string, folderId: string, chapterId: string) => void;
  updateChapterContent: (projectId: string, folderId: string, chapterId: string, content: string) => void;
  updateChapterTitle: (projectId: string, folderId: string, chapterId: string, title: string) => void;
  updateChapterTags: (projectId: string, folderId: string, chapterId: string, tags: string[]) => void;
  // Tag operations
  createTag: (projectId: string, name: string, color: string) => void;
  deleteTag: (projectId: string, tagId: string) => void;
  // Notes operations
  addNote: (projectId: string, title: string, content: string, chapterId?: string) => void;
  updateNote: (projectId: string, noteId: string, updates: Partial<ProjectNote>) => void;
  deleteNote: (projectId: string, noteId: string) => void;
  // Computed
  activeProject: Project | null;
  activeFolder: Folder | null;
  activeChapter: Chapter | null;
  getRAGContext: (query: string) => string;
  indexProject: (project: Project) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const STORAGE_KEY = 'plumeai_data';

function loadState(): { projects: Project[]; apiConfig: APIConfig; language: Language; theme: Theme; animationLevel: AnimationLevel } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        projects: data.projects || [],
        apiConfig: data.apiConfig || { inlineEndpoint: '', inlineApiKey: '', inlineModel: '', agentEndpoint: '', agentApiKey: '', agentModel: '', availableModels: [] },
        language: data.language || 'fr',
        theme: data.theme || 'auto',
        animationLevel: data.animationLevel || 'most',
      };
    }
  } catch (e) { console.error(e); }
  return {
    projects: [],
    apiConfig: { inlineEndpoint: '', inlineApiKey: '', inlineModel: '', agentEndpoint: '', agentApiKey: '', agentModel: '', availableModels: [] },
    language: 'fr',
    theme: 'auto',
    animationLevel: 'most',
  };
}

function saveState(projects: Project[], apiConfig: APIConfig, language: Language, theme: Theme, animationLevel: AnimationLevel) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, apiConfig, language, theme, animationLevel }));
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = loadState();
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [apiConfig, setApiConfigState] = useState<APIConfig>(initial.apiConfig);
  const [language, setLanguageState] = useState<Language>(initial.language);
  const [theme, setThemeState] = useState<Theme>(initial.theme);
  const [animationLevel, setAnimationLevelState] = useState<AnimationLevel>(initial.animationLevel);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initial.projects[0]?.id || null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [ragChunks, setRagChunks] = useState<RAGChunk[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Apply theme
  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.className = resolved;
    document.body.className = resolved;
    localStorage.setItem('plumeai_theme', JSON.stringify(theme));
  }, [theme]);

  // Save state
  useEffect(() => {
    saveState(projects, apiConfig, language, theme, animationLevel);
  }, [projects, apiConfig, language, theme, animationLevel]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = resolveTheme('auto');
      document.documentElement.className = resolved;
      document.body.className = resolved;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Auto-select first folder/chapter when project changes
  useEffect(() => {
    const project = projects.find(p => p.id === activeProjectId);
    if (project && project.folders.length > 0) {
      if (!activeFolderId || !project.folders.find(f => f.id === activeFolderId)) {
        const firstFolder = project.folders[0];
        setActiveFolderId(firstFolder.id);
        if (firstFolder.chapters.length > 0) {
          setActiveChapterId(firstFolder.chapters[0].id);
        }
      }
    }
  }, [activeProjectId, projects]);

  // Auto-index project on changes
  useEffect(() => {
    const project = projects.find(p => p.id === activeProjectId);
    if (project) {
      indexProject(project);
    }
  }, [activeProjectId, projects]);

  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const setAnimationLevel = useCallback((a: AnimationLevel) => setAnimationLevelState(a), []);
  const setActiveProject = useCallback((id: string | null) => { setActiveProjectId(id); setActiveFolderId(null); setActiveChapterId(null); }, []);
  const setActiveFolder = useCallback((id: string | null) => setActiveFolderId(id), []);
  const setActiveChapter = useCallback((id: string | null) => setActiveChapterId(id), []);
  const addAgentMessage = useCallback((msg: AgentMessage) => setAgentMessages(prev => [...prev, msg]), []);
  const clearAgentMessages = useCallback(() => setAgentMessages([]), []);
  const setApiConfig = useCallback((config: Partial<APIConfig>) => setApiConfigState(prev => ({ ...prev, ...config })), []);

  // Project operations
  const createProject = useCallback((name: string, description: string) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      folders: [],
      notes: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, project]);
    setActiveProjectId(project.id);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  }, [activeProjectId]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  // Folder operations
  const createFolder = useCallback((projectId: string, name: string) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name,
      chapters: [],
      tags: [],
      order: Date.now(),
      collapsed: false,
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, folders: [...p.folders, folder], updatedAt: new Date().toISOString() } : p));
    setActiveFolderId(folder.id);
  }, []);

  const deleteFolder = useCallback((projectId: string, folderId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, folders: p.folders.filter(f => f.id !== folderId), updatedAt: new Date().toISOString() } : p));
    if (activeFolderId === folderId) setActiveFolderId(null);
  }, [activeFolderId]);

  const toggleFolderCollapse = useCallback((projectId: string, folderId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? { ...f, collapsed: !f.collapsed } : f)
    } : p));
  }, []);

  // Chapter operations
  const createChapter = useCallback((projectId: string, folderId: string, title: string) => {
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      title,
      content: '',
      tags: [],
      notes: [],
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? { ...f, chapters: [...f.chapters, chapter] } : f),
      updatedAt: new Date().toISOString()
    } : p));
    setActiveChapterId(chapter.id);
  }, []);

  const deleteChapter = useCallback((projectId: string, folderId: string, chapterId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? { ...f, chapters: f.chapters.filter(c => c.id !== chapterId) } : f),
      updatedAt: new Date().toISOString()
    } : p));
    if (activeChapterId === chapterId) setActiveChapterId(null);
  }, [activeChapterId]);

  const updateChapterContent = useCallback((projectId: string, folderId: string, chapterId: string, content: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? {
        ...f,
        chapters: f.chapters.map(c => c.id === chapterId ? { ...c, content, updatedAt: new Date().toISOString() } : c)
      } : f),
      updatedAt: new Date().toISOString()
    } : p));
  }, []);

  const updateChapterTitle = useCallback((projectId: string, folderId: string, chapterId: string, title: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? {
        ...f,
        chapters: f.chapters.map(c => c.id === chapterId ? { ...c, title, updatedAt: new Date().toISOString() } : c)
      } : f),
      updatedAt: new Date().toISOString()
    } : p));
  }, []);

  const updateChapterTags = useCallback((projectId: string, folderId: string, chapterId: string, tags: string[]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      folders: p.folders.map(f => f.id === folderId ? {
        ...f,
        chapters: f.chapters.map(c => c.id === chapterId ? { ...c, tags, updatedAt: new Date().toISOString() } : c)
      } : f),
      updatedAt: new Date().toISOString()
    } : p));
  }, []);

  // Tag operations
  const createTag = useCallback((projectId: string, name: string, color: string) => {
    const tag: Tag = { id: crypto.randomUUID(), name, color };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tags: [...p.tags, tag] } : p));
  }, []);

  const deleteTag = useCallback((projectId: string, tagId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      tags: p.tags.filter(t => t.id !== tagId),
      folders: p.folders.map(f => ({
        ...f,
        tags: f.tags.filter(t => t !== tagId),
        chapters: f.chapters.map(c => ({ ...c, tags: c.tags.filter(t => t !== tagId) }))
      }))
    } : p));
  }, []);

  // Notes operations
  const addNote = useCallback((projectId: string, title: string, content: string, chapterId?: string) => {
    const note: ProjectNote = {
      id: crypto.randomUUID(),
      title,
      content,
      chapterId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (chapterId) {
        return {
          ...p,
          folders: p.folders.map(f => ({
            ...f,
            chapters: f.chapters.map(c => c.id === chapterId ? { ...c, notes: [...c.notes, note] } : c)
          }))
        };
      }
      return { ...p, notes: [...p.notes, note] };
    }));
  }, []);

  const updateNote = useCallback((projectId: string, noteId: string, updates: Partial<ProjectNote>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        notes: p.notes.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        folders: p.folders.map(f => ({
          ...f,
          chapters: f.chapters.map(c => ({
            ...c,
            notes: c.notes.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
          }))
        }))
      };
    }));
  }, []);

  const deleteNote = useCallback((projectId: string, noteId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        notes: p.notes.filter(n => n.id !== noteId),
        folders: p.folders.map(f => ({
          ...f,
          chapters: f.chapters.map(c => ({ ...c, notes: c.notes.filter(n => n.id !== noteId) }))
        }))
      };
    }));
  }, []);

  // RAG
  const indexProject = useCallback((project: Project) => {
    const chunks: RAGChunk[] = [];
    for (const folder of project.folders) {
      for (const chapter of folder.chapters) {
        if (chapter.content.trim().length > 0) {
          const textChunks = chunkText(chapter.content);
          textChunks.forEach((text, i) => {
            chunks.push({
              id: `${chapter.id}-${i}`,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              folderName: folder.name,
              content: text,
            });
          });
        }
      }
    }
    setRagChunks(chunks);
  }, []);

  const getRAGContext = useCallback((query: string): string => {
    return buildRAGContext(ragChunks, query);
  }, [ragChunks]);

  // Computed
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeFolder = activeProject?.folders.find(f => f.id === activeFolderId) || null;
  const activeChapter = activeFolder?.chapters.find(c => c.id === activeChapterId) || null;

  const value: AppState = {
    language, theme, animationLevel, projects, activeProjectId, activeFolderId, activeChapterId,
    agentMessages, apiConfig, ragChunks, sidebarOpen, agentOpen, settingsOpen, searchQuery,
    setLanguage, setTheme, setAnimationLevel, setActiveProject, setActiveFolder, setActiveChapter,
    addAgentMessage, clearAgentMessages, setApiConfig, setSidebarOpen, setAgentOpen, setSettingsOpen, setSearchQuery,
    createProject, deleteProject, updateProject,
    createFolder, deleteFolder, toggleFolderCollapse,
    createChapter, deleteChapter, updateChapterContent, updateChapterTitle, updateChapterTags,
    createTag, deleteTag,
    addNote, updateNote, deleteNote,
    activeProject, activeFolder, activeChapter,
    getRAGContext, indexProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
