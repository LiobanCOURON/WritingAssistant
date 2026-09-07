import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Project, Folder, Chapter, AgentMessage, APIConfig,
  Language, Theme, AnimationLevel, RAGChunk, ProjectNotes,
  CharacterNote, PlaceNote, MomentNote, OverviewNote, CustomAnimationPreferences
} from './types';
import { searchChunks } from './services';

interface AppState {
  language: Language;
  theme: Theme;
  animationLevel: AnimationLevel;
  customAnimations: CustomAnimationPreferences;
  projects: Project[];
  activeProjectId: string | null;
  activeFolderId: string | null;
  activeChapterId: string | null;
  apiConfig: APIConfig;
  agentMessages: AgentMessage[];
  ragChunks: RAGChunk[];
  sidebarOpen: boolean;
  agentOpen: boolean;
  settingsOpen: boolean;
  notesOpen: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setCustomAnimations: (prefs: CustomAnimationPreferences) => void;
  createProject: (name: string, description: string) => void;
  deleteProject: (id: string) => void;
  createFolder: (projectId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  createChapter: (folderId: string, title: string) => void;
  deleteChapter: (chapterId: string) => void;
  moveChapter: (chapterId: string, targetFolderId: string, targetProjectId?: string, targetChapterId?: string | null, position?: 'before' | 'after') => void;
  updateChapterContent: (chapterId: string, content: string) => void;
  updateChapterTitle: (chapterId: string, title: string) => void;
  updateChapterMemory: (chapterId: string, memory: string) => void;
  setActiveProject: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  setActiveChapter: (id: string | null) => void;
  updateAPIConfig: (config: Partial<APIConfig>) => void;
  addAgentMessage: (msg: AgentMessage) => void;
  clearAgentMessages: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAgentOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setNotesOpen: (open: boolean) => void;
  getRAGContext: (query: string) => string;
  getNotesContext: () => string;
  indexProject: (projectId: string) => void;
  addTag: (projectId: string, tag: string) => void;
  removeTag: (projectId: string, tag: string) => void;
  addFolderTag: (folderId: string, tag: string) => void;
  addChapterTag: (chapterId: string, tag: string) => void;
  // Notes
  updateOverview: (projectId: string, overview: Partial<OverviewNote>) => void;
  addCharacter: (projectId: string, character: CharacterNote) => void;
  updateCharacter: (projectId: string, characterId: string, updates: Partial<CharacterNote>) => void;
  deleteCharacter: (projectId: string, characterId: string) => void;
  addPlace: (projectId: string, place: PlaceNote) => void;
  updatePlace: (projectId: string, placeId: string, updates: Partial<PlaceNote>) => void;
  deletePlace: (projectId: string, placeId: string) => void;
  addMoment: (projectId: string, moment: MomentNote) => void;
  updateMoment: (projectId: string, momentId: string, updates: Partial<MomentNote>) => void;
  deleteMoment: (projectId: string, momentId: string) => void;
  // Computed
  activeProject: Project | null;
  activeFolder: Folder | null;
  activeChapter: Chapter | null;
}

const AppContext = createContext<AppState | null>(null);

const defaultAPIConfig: APIConfig = {
  inlineEndpoint: '',
  inlineApiKey: '',
  inlineModel: '',
  agentEndpoint: '',
  agentApiKey: '',
  agentModel: '',
  availableModels: [],
};

const defaultOverview: OverviewNote = {
  premise: '',
  genre: '',
  tone: '',
  themes: [],
  setting: '',
  plotSummary: '',
  worldRules: '',
  audience: '',
  goals: '',
};

const defaultNotes: ProjectNotes = {
  overview: defaultOverview,
  characters: [],
  places: [],
  moments: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('plumeai_language');
    return (saved as Language) || 'fr';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('plumeai_theme');
    return (saved as Theme) || 'auto';
  });

  const [animationLevel, setAnimationLevelState] = useState<AnimationLevel>(() => {
    const saved = localStorage.getItem('plumeai_animations');
    // Reset chaos mode if it was saved (too extreme by default)
    if (saved === 'chaos') {
      localStorage.removeItem('plumeai_animations');
      return 'none';
    }
    return (saved as AnimationLevel) || 'none';
  });

  const [customAnimations, setCustomAnimationsState] = useState<CustomAnimationPreferences>(() => {
    const saved = localStorage.getItem('plumeai_customAnimations');
    return saved ? JSON.parse(saved) : {
      particles: true,
      hover: true,
      transitions: true,
      entrance: true,
      feedback: true,
      micro: true,
      iconsBounce: false,
    };
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('plumeai_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('plumeai_activeProject');
  });

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const [apiConfig, setAPIConfig] = useState<APIConfig>(() => {
    const saved = localStorage.getItem('plumeai_apiConfig');
    return saved ? JSON.parse(saved) : defaultAPIConfig;
  });

  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>(() => {
    const saved = localStorage.getItem('plumeai_agentMessages');
    return saved ? JSON.parse(saved) : [];
  });

  const [ragChunks, setRagChunks] = useState<RAGChunk[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Persist
  useEffect(() => { localStorage.setItem('plumeai_language', language); }, [language]);
  useEffect(() => {
    localStorage.setItem('plumeai_theme', theme);
    applyTheme(theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem('plumeai_animations', animationLevel); }, [animationLevel]);
  useEffect(() => { localStorage.setItem('plumeai_customAnimations', JSON.stringify(customAnimations)); }, [customAnimations]);
  useEffect(() => {
    if (customAnimations.iconsBounce) {
      document.documentElement.setAttribute('data-icons-bounce', 'true');
    } else {
      document.documentElement.removeAttribute('data-icons-bounce');
    }
  }, [customAnimations]);
  useEffect(() => { localStorage.setItem('plumeai_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('plumeai_apiConfig', JSON.stringify(apiConfig)); }, [apiConfig]);
  useEffect(() => { localStorage.setItem('plumeai_agentMessages', JSON.stringify(agentMessages)); }, [agentMessages]);
  useEffect(() => {
    if (activeProjectId) localStorage.setItem('plumeai_activeProject', activeProjectId);
  }, [activeProjectId]);

  // Apply theme
  const applyTheme = (t: Theme) => {
    let resolved: 'light' | 'dark';
    if (t === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = t;
    }
    document.documentElement.className = resolved;
    document.body.className = resolved;
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  const setAnimationLevel = (level: AnimationLevel) => {
    setAnimationLevelState(level);
    document.documentElement.setAttribute('data-animations', level);
  };

  const setCustomAnimations = (prefs: CustomAnimationPreferences) => {
    setCustomAnimationsState(prefs);
    // Apply icons bounce via data attribute
    if (prefs.iconsBounce) {
      document.documentElement.setAttribute('data-icons-bounce', 'true');
    } else {
      document.documentElement.removeAttribute('data-icons-bounce');
    }
  };

  // Computed
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeFolder = activeProject?.folders.find(f => f.id === activeFolderId) || null;
  
  // Search for active chapter across all folders in the active project
  const activeChapter = activeProject?.folders
    .flatMap(f => f.chapters)
    .find(c => c.id === activeChapterId) || null;

  // Project actions
  const createProject = (name: string, description: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      folders: [],
      notes: { ...defaultNotes, overview: { ...defaultOverview } },
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  // Folder actions
  const createFolder = (projectId: string, name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      projectId,
      chapters: [],
      tags: [],
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, folders: [...p.folders, newFolder], updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const deleteFolder = (folderId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.filter(f => f.id !== folderId),
      updatedAt: new Date().toISOString(),
    })));
    if (activeFolderId === folderId) setActiveFolderId(null);
  };

  // Chapter actions
  const createChapter = (folderId: string, title: string) => {
    const project = projects.find(p => p.folders.some(f => f.id === folderId));
    if (!project) return;

    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title,
      content: '',
      folderId,
      projectId: project.id,
      tags: [],
      memory: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f =>
        f.id === folderId
          ? { ...f, chapters: [...f.chapters, newChapter] }
          : f
      ),
      updatedAt: new Date().toISOString(),
    })));

    setActiveFolderId(folderId);
    setActiveChapterId(newChapter.id);
  };

  const deleteChapter = (chapterId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        chapters: f.chapters.filter(c => c.id !== chapterId),
      })),
      updatedAt: new Date().toISOString(),
    })));
    if (activeChapterId === chapterId) setActiveChapterId(null);
  };

  const moveChapter = (
    chapterId: string, 
    targetFolderId: string, 
    targetProjectId?: string,
    targetChapterId?: string | null,
    position?: 'before' | 'after'
  ) => {
    setProjects(prev => {
      // Find the chapter to move
      let chapterToMove: Chapter | null = null;
      let sourceProjectId: string | null = null;
      
      for (const p of prev) {
        for (const f of p.folders) {
          const chapter = f.chapters.find(c => c.id === chapterId);
          if (chapter) {
            chapterToMove = chapter;
            sourceProjectId = p.id;
            break;
          }
        }
        if (chapterToMove) break;
      }
      
      if (!chapterToMove || !sourceProjectId) return prev;
      
      const updatedChapter = { ...chapterToMove, folderId: targetFolderId, projectId: targetProjectId || sourceProjectId };
      
      // Helper function to insert chapter at specific position
      const insertChapterAtPosition = (chapters: Chapter[], targetId: string | null | undefined, pos: 'before' | 'after' | undefined): Chapter[] => {
        if (!targetId || !pos) {
          // No position specified, add at the end
          return [...chapters, updatedChapter];
        }
        
        const targetIndex = chapters.findIndex(c => c.id === targetId);
        if (targetIndex === -1) {
          // Target not found, add at the end
          return [...chapters, updatedChapter];
        }
        
        const newChapters = [...chapters];
        const insertIndex = pos === 'before' ? targetIndex : targetIndex + 1;
        newChapters.splice(insertIndex, 0, updatedChapter);
        return newChapters;
      };
      
      // If moving to same project
      if (!targetProjectId || targetProjectId === sourceProjectId) {
        return prev.map(p => {
          if (p.id !== sourceProjectId) return p;
          return {
            ...p,
            folders: p.folders.map(f => {
              const isSource = f.chapters.some(c => c.id === chapterId);
              const isTarget = f.id === targetFolderId;

              // Same folder: remove then re-add at position (reorder)
              if (isSource && isTarget) {
                const filtered = f.chapters.filter(c => c.id !== chapterId);
                return { ...f, chapters: insertChapterAtPosition(filtered, targetChapterId, position) };
              }
              // Only source: remove
              if (isSource) {
                return { ...f, chapters: f.chapters.filter(c => c.id !== chapterId) };
              }
              // Only target: add at position
              if (isTarget) {
                return { ...f, chapters: insertChapterAtPosition(f.chapters, targetChapterId, position) };
              }
              return f;
            }),
            updatedAt: new Date().toISOString(),
          };
        });
      }
      
      // Moving to different project
      return prev.map(p => {
        if (p.id === sourceProjectId) {
          return {
            ...p,
            folders: p.folders.map(f => ({
              ...f,
              chapters: f.chapters.filter(c => c.id !== chapterId),
            })),
            updatedAt: new Date().toISOString(),
          };
        }
        if (p.id === targetProjectId) {
          return {
            ...p,
            folders: p.folders.map(f => {
              if (f.id === targetFolderId) {
                return { ...f, chapters: insertChapterAtPosition(f.chapters, targetChapterId, position) };
              }
              return f;
            }),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
    });
  };

  const updateChapterContent = (chapterId: string, content: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        chapters: f.chapters.map(c =>
          c.id === chapterId ? { ...c, content, updatedAt: new Date().toISOString() } : c
        ),
      })),
      updatedAt: new Date().toISOString(),
    })));
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        chapters: f.chapters.map(c =>
          c.id === chapterId ? { ...c, title, updatedAt: new Date().toISOString() } : c
        ),
      })),
    })));
  };

  const updateChapterMemory = (chapterId: string, memory: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        chapters: f.chapters.map(c =>
          c.id === chapterId ? { ...c, memory, updatedAt: new Date().toISOString() } : c
        ),
      })),
    })));
  };

  // API Config
  const updateAPIConfig = (config: Partial<APIConfig>) => {
    setAPIConfig(prev => ({ ...prev, ...config }));
  };

  // Agent
  const addAgentMessage = (msg: AgentMessage) => {
    setAgentMessages(prev => [...prev, msg]);
  };

  const clearAgentMessages = () => {
    setAgentMessages([]);
  };

  // RAG
  const indexProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newChunks: RAGChunk[] = [];
    project.folders.forEach(folder => {
      folder.chapters.forEach(chapter => {
        if (chapter.content.length > 50) {
          // Split into chunks
          const paragraphs = chapter.content.split(/\n\n+/).filter(p => p.length > 20);
          paragraphs.forEach((para, i) => {
            newChunks.push({
              id: `${chapter.id}-${i}`,
              chapterId: chapter.id,
              folderId: folder.id,
              projectId: project.id,
              content: para,
            });
          });
        }
        // Also index memory
        if (chapter.memory.length > 20) {
          newChunks.push({
            id: `${chapter.id}-memory`,
            chapterId: chapter.id,
            folderId: folder.id,
            projectId: project.id,
            content: `[Mémoire] ${chapter.memory}`,
          });
        }
      });
    });

    setRagChunks(prev => [
      ...prev.filter(c => c.projectId !== projectId),
      ...newChunks,
    ]);
  };

  const getRAGContext = (query: string): string => {
    if (!activeProjectId) return '';
    const results = searchChunks(ragChunks, query, 5, activeProjectId);
    return results.map(r => r.content).join('\n\n---\n\n');
  };

  const getNotesContext = (): string => {
    if (!activeProjectId) return '';
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return '';

    const parts: string[] = [];

    // Overview
    const ov = project.notes.overview;
    if (ov.premise || ov.genre || ov.plotSummary) {
      parts.push(`## Vue d'ensemble\nPrémisse: ${ov.premise}\nGenre: ${ov.genre}\nTon: ${ov.tone}\nThèmes: ${ov.themes.join(', ')}\nCadre: ${ov.setting}\nRésumé: ${ov.plotSummary}\nRègles: ${ov.worldRules}`);
    }

    // Characters
    if (project.notes.characters.length > 0) {
      const chars = project.notes.characters.map(c =>
        `${c.name}: ${c.personality} - ${c.background} (${c.goals})`
      ).join('\n');
      parts.push(`## Personnages\n${chars}`);
    }

    // Places
    if (project.notes.places.length > 0) {
      const places = project.notes.places.map(p =>
        `${p.name} (${p.type}): ${p.atmosphere} - ${p.layout}`
      ).join('\n');
      parts.push(`## Lieux\n${places}`);
    }

    // Moments
    if (project.notes.moments.length > 0) {
      const moments = project.notes.moments.map(m =>
        `${m.title} (${m.type}): ${m.description}`
      ).join('\n');
      parts.push(`## Moments clés\n${moments}`);
    }

    return parts.join('\n\n');
  };

  // Tags
  const addTag = (projectId: string, tag: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId && !p.tags.includes(tag)
        ? { ...p, tags: [...p.tags, tag] }
        : p
    ));
  };

  const removeTag = (projectId: string, tag: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tags: p.tags.filter(t => t !== tag) }
        : p
    ));
  };

  const addFolderTag = (folderId: string, tag: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f =>
        f.id === folderId && !f.tags.includes(tag)
          ? { ...f, tags: [...f.tags, tag] }
          : f
      ),
    })));
  };

  const addChapterTag = (chapterId: string, tag: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        chapters: f.chapters.map(c =>
          c.id === chapterId && !c.tags.includes(tag)
            ? { ...c, tags: [...c.tags, tag] }
            : c
        ),
      })),
    })));
  };

  // Notes
  const updateOverview = (projectId: string, overview: Partial<OverviewNote>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, overview: { ...p.notes.overview, ...overview } } }
        : p
    ));
  };

  const addCharacter = (projectId: string, character: CharacterNote) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, characters: [...p.notes.characters, character] } }
        : p
    ));
  };

  const updateCharacter = (projectId: string, characterId: string, updates: Partial<CharacterNote>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            notes: {
              ...p.notes,
              characters: p.notes.characters.map(c =>
                c.id === characterId ? { ...c, ...updates } : c
              ),
            },
          }
        : p
    ));
  };

  const deleteCharacter = (projectId: string, characterId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, characters: p.notes.characters.filter(c => c.id !== characterId) } }
        : p
    ));
  };

  const addPlace = (projectId: string, place: PlaceNote) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, places: [...p.notes.places, place] } }
        : p
    ));
  };

  const updatePlace = (projectId: string, placeId: string, updates: Partial<PlaceNote>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            notes: {
              ...p.notes,
              places: p.notes.places.map(pl =>
                pl.id === placeId ? { ...pl, ...updates } : pl
              ),
            },
          }
        : p
    ));
  };

  const deletePlace = (projectId: string, placeId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, places: p.notes.places.filter(pl => pl.id !== placeId) } }
        : p
    ));
  };

  const addMoment = (projectId: string, moment: MomentNote) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, moments: [...p.notes.moments, moment] } }
        : p
    ));
  };

  const updateMoment = (projectId: string, momentId: string, updates: Partial<MomentNote>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            notes: {
              ...p.notes,
              moments: p.notes.moments.map(m =>
                m.id === momentId ? { ...m, ...updates } : m
              ),
            },
          }
        : p
    ));
  };

  const deleteMoment = (projectId: string, momentId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, notes: { ...p.notes, moments: p.notes.moments.filter(m => m.id !== momentId) } }
        : p
    ));
  };

  const value: AppState = {
    language, theme, animationLevel, customAnimations, projects,
    activeProjectId, activeFolderId, activeChapterId,
    apiConfig, agentMessages, ragChunks,
    sidebarOpen, agentOpen, settingsOpen, notesOpen,
    setLanguage, setTheme, setAnimationLevel, setCustomAnimations,
    createProject, deleteProject,
    createFolder, deleteFolder,
    createChapter, deleteChapter, moveChapter,
    updateChapterContent, updateChapterTitle, updateChapterMemory,
    setActiveProject: setActiveProjectId,
    setActiveFolder: setActiveFolderId,
    setActiveChapter: setActiveChapterId,
    updateAPIConfig,
    addAgentMessage, clearAgentMessages,
    setSidebarOpen, setAgentOpen, setSettingsOpen, setNotesOpen,
    getRAGContext, getNotesContext, indexProject,
    addTag, removeTag, addFolderTag, addChapterTag,
    updateOverview, addCharacter, updateCharacter, deleteCharacter,
    addPlace, updatePlace, deletePlace,
    addMoment, updateMoment, deleteMoment,
    activeProject, activeFolder, activeChapter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
