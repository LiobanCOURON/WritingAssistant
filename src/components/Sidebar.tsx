import React, { useState } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import {
  FolderOpen, FileText, Plus, Trash2, ChevronRight, X,
  Tag, Search, BookOpen, Users, MapPin, Clock, StickyNote,
  Upload, FolderPlus, FilePlus
} from 'lucide-react';

export function Sidebar() {
  const {
    language, projects, activeProjectId, activeFolderId, activeChapterId,
    activeProject, sidebarOpen,
    createProject, deleteProject, createFolder, deleteFolder,
    createChapter, deleteChapter, moveChapter, setActiveProject, setActiveFolder,
    setActiveChapter, addTag, removeTag, indexProject, setNotesOpen,
    customAnimations, animationLevel,
  } = useApp();

  const shouldAnimate = animationLevel === 'more' || 
                        animationLevel === 'all' || 
                        animationLevel === 'chaos' || 
                        (animationLevel === 'custom' && customAnimations.iconsBounce);

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [newProjectName, setNewProjectName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewChapter, setShowNewChapter] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverChapterId, setDragOverChapterId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before');

  if (!sidebarOpen) return null;

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.folders.some(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.chapters.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const toggleFolder = (folderId: string) => {
    const next = new Set(collapsedFolders);
    if (next.has(folderId)) next.delete(folderId);
    else next.add(folderId);
    setCollapsedFolders(next);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProjectId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      // Create a folder and chapter from the file
      const folderName = file.name.replace(/\.[^/.]+$/, '');
      createFolder(activeProjectId, folderName);
      // We need the folder ID - get it from the updated project
      setTimeout(() => {
        const proj = projects.find(p => p.id === activeProjectId);
        const newFolder = proj?.folders.find(f => f.name === folderName);
        if (newFolder) {
          createChapter(newFolder.id, file.name);
          // Content will be set after chapter creation
        }
      }, 100);
    };
    reader.readAsText(file);
    setShowImport(false);
  };

  return (
    <div className="glass w-72 flex flex-col overflow-hidden shrink-0 anim-slide-in-left">
      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchContext', language) + '...'}
            className="glass-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredProjects.length === 0 && (
          <div className="text-center py-8 opacity-40">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t('noProjects', language)}</p>
          </div>
        )}

        {filteredProjects.map(project => (
          <div key={project.id} className="anim-fade-in">
            {/* Project header */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover-glow group ${
                activeProjectId === project.id ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5'
              }`}
              onClick={() => setActiveProject(project.id)}
            >
              <FolderOpen size={16} className="text-blue-400 shrink-0" />
              <span className="flex-1 text-sm font-medium truncate">{project.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); indexProject(project.id); }}
                  className="p-1 rounded hover:bg-white/10"
                  title="Indexer pour RAG"
                >
                  <Search size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                  className="p-1 rounded hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Project content (if active) */}
            {activeProjectId === project.id && (
              <div className="ml-4 mt-1 space-y-1 anim-slide-down">
                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-2 py-1">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1 anim-scale-in"
                      >
                        #{tag}
                        <X size={10} className="cursor-pointer hover:text-red-400" onClick={() => removeTag(project.id, tag)} />
                      </span>
                    ))}
                  </div>
                )}

                {/* Add tag */}
                <div className="flex gap-1 px-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        addTag(project.id, newTag.trim());
                        setNewTag('');
                      }
                    }}
                    placeholder="+ tag"
                    className="glass-input text-xs px-2 py-1 flex-1"
                  />
                </div>

                {/* Notes button */}
                <button
                  onClick={() => setNotesOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-purple-500/10 text-purple-400 transition-all hover-glow"
                >
                  <StickyNote size={14} />
                  <span>{t('memory', language)} & Notes</span>
                  <span className="ml-auto opacity-50">
                    {project.notes.characters.length + project.notes.places.length + project.notes.moments.length}
                  </span>
                </button>

                {/* Folders */}
                {project.folders.map(folder => (
                  <div key={folder.id} className="anim-fade-in">
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        activeFolderId === folder.id ? 'bg-emerald-500/15' : 'hover:bg-white/5'
                      }`}
                      onClick={() => { setActiveFolder(folder.id); toggleFolder(folder.id); }}
                    >
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${!collapsedFolders.has(folder.id) ? 'rotate-90' : ''}`}
                      />
                      <FolderOpen size={14} className="text-emerald-400 shrink-0" />
                      <span className="flex-1 text-xs truncate">{folder.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                        className="p-0.5 rounded hover:bg-red-500/20 text-red-400 opacity-0 hover:opacity-100"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>

                    {/* Chapters */}
                    {!collapsedFolders.has(folder.id) && (
                      <div
                        className={`ml-5 space-y-0.5 anim-slide-down drop-zone ${dragOverFolderId === folder.id && !dragOverChapterId ? 'drag-over' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverFolderId(folder.id);
                          // Only set chapter to null if we're not over a specific chapter
                          if (!(e.target as HTMLElement).closest('[data-chapter-id]')) {
                            setDragOverChapterId(null);
                          }
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation();
                          setDragOverFolderId(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedChapterId) {
                            // If dropping on a specific chapter, use position
                            if (dragOverChapterId) {
                              moveChapter(draggedChapterId, folder.id, undefined, dragOverChapterId, dropPosition);
                            } else {
                              // Otherwise, add at the end
                              moveChapter(draggedChapterId, folder.id);
                            }
                          }
                          setDraggedChapterId(null);
                          setDragOverFolderId(null);
                          setDragOverChapterId(null);
                        }}
                      >
                        {folder.chapters.map(chapter => (
                          <div
                            key={chapter.id}
                            data-chapter-id={chapter.id}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedChapterId(chapter.id);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const midpoint = rect.top + rect.height / 2;
                              const position = e.clientY < midpoint ? 'before' : 'after';
                              setDragOverChapterId(chapter.id);
                              setDropPosition(position);
                            }}
                            onDragEnd={() => {
                              setDraggedChapterId(null);
                              setDragOverFolderId(null);
                              setDragOverChapterId(null);
                            }}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all relative ${
                              activeChapterId === chapter.id ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                            } ${draggedChapterId === chapter.id ? 'opacity-50 scale-95' : ''}`}
                            onClick={() => {
                              setActiveFolder(folder.id);
                              setActiveChapter(chapter.id);
                              // Ensure folder is expanded
                              setCollapsedFolders(prev => {
                                const next = new Set(prev);
                                next.delete(folder.id);
                                return next;
                              });
                            }}
                          >
                            {/* Drop indicator line */}
                            {dragOverChapterId === chapter.id && draggedChapterId !== chapter.id && (
                              <div
                                className={`absolute left-0 right-0 h-0.5 bg-emerald-400 pointer-events-none z-10 ${
                                  dropPosition === 'before' ? '-top-0.5' : '-bottom-0.5'
                                }`}
                                style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)' }}
                              />
                            )}
                            <div className="drag-handle opacity-30 hover:opacity-100">
                              <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
                                <circle cx="2" cy="2" r="1" />
                                <circle cx="6" cy="2" r="1" />
                                <circle cx="2" cy="6" r="1" />
                                <circle cx="6" cy="6" r="1" />
                                <circle cx="2" cy="10" r="1" />
                                <circle cx="6" cy="10" r="1" />
                              </svg>
                            </div>
                            <FileText size={12} className="shrink-0" />
                            <span className="flex-1 truncate">{chapter.title}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                              className="p-0.5 rounded hover:bg-red-500/20 text-red-400 opacity-0 hover:opacity-100"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}

                        {/* New chapter input */}
                        {showNewChapter === folder.id ? (
                          <div className="flex gap-1 px-1 py-1 anim-scale-in">
                            <input
                              type="text"
                              value={newChapterTitle}
                              onChange={e => setNewChapterTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && newChapterTitle.trim()) {
                                  createChapter(folder.id, newChapterTitle.trim());
                                  setNewChapterTitle('');
                                  setShowNewChapter(null);
                                }
                                if (e.key === 'Escape') setShowNewChapter(null);
                              }}
                              placeholder="Titre du chapitre..."
                              className="glass-input text-xs px-2 py-1 flex-1"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowNewChapter(folder.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs opacity-40 hover:opacity-100 transition-all hover-glow"
                          >
                            <FilePlus size={12} />
                            <span>{t('newDocument', language)}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* New folder */}
                {showNewFolder ? (
                  <div className="flex gap-1 px-2 py-1 anim-scale-in">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newFolderName.trim()) {
                          createFolder(project.id, newFolderName.trim());
                          setNewFolderName('');
                          setShowNewFolder(false);
                        }
                        if (e.key === 'Escape') setShowNewFolder(false);
                      }}
                      placeholder="Nom du dossier..."
                      className="glass-input text-xs px-2 py-1 flex-1"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs opacity-40 hover:opacity-100 transition-all hover-glow"
                  >
                    <FolderPlus size={14} />
                    <span>Dossier</span>
                  </button>
                )}

                {/* Import */}
                <label className="flex items-center gap-1 px-3 py-1.5 text-xs opacity-40 hover:opacity-100 transition-all cursor-pointer hover-glow">
                  <Upload size={14} />
                  <span>{t('importFile', language)}</span>
                  <input type="file" accept=".txt,.md,.text" onChange={handleImportFile} className="hidden" />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New project */}
      <div className="p-3 border-t border-white/10">
        {showNewProject ? (
          <div className="space-y-2 anim-scale-in">
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder={t('projectName', language)}
              className="glass-input w-full px-3 py-2 text-sm"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && newProjectName.trim()) {
                  createProject(newProjectName.trim(), '');
                  setNewProjectName('');
                  setShowNewProject(false);
                }
                if (e.key === 'Escape') setShowNewProject(false);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newProjectName.trim()) {
                    createProject(newProjectName.trim(), '');
                    setNewProjectName('');
                    setShowNewProject(false);
                  }
                }}
                className="glass-button glass-button-primary flex-1 text-xs py-1.5"
              >
                {t('save', language)}
              </button>
              <button
                onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
                className="glass-button flex-1 text-xs py-1.5"
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className={`glass-button glass-button-primary w-full flex items-center justify-center gap-2 text-sm py-2 ${shouldAnimate ? 'anim-pulse-subtle' : ''}`}
          >
            <Plus size={16} />
            <span>{t('newProject', language)}</span>
          </button>
        )}
      </div>
    </div>
  );
}
