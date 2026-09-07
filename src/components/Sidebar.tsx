import React, { useState } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { importFile } from '../services';
import {
  FolderOpen, FileText, Plus, Trash2, ChevronRight, ChevronDown,
  X, Search, Tag, StickyNote, Upload, FolderPlus, FilePlus
} from 'lucide-react';

export function Sidebar() {
  const {
    language, projects, activeProject, activeProjectId, activeFolderId, activeChapterId,
    sidebarOpen, searchQuery,
    setActiveProject, setActiveFolder, setActiveChapter,
    createProject, deleteProject,
    createFolder, deleteFolder, toggleFolderCollapse,
    createChapter, deleteChapter,
    createTag, deleteTag,
    addNote,
    setSearchQuery,
  } = useApp();

  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showNewTag, setShowNewTag] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  if (!sidebarOpen) return null;

  const filteredFolders = activeProject?.folders.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (f.name.toLowerCase().includes(q)) return true;
    return f.chapters.some(c => c.title.toLowerCase().includes(q) || c.tags.some(tagId => {
      const tag = activeProject.tags.find(t => t.id === tagId);
      return tag?.name.toLowerCase().includes(q);
    }));
  }) || [];

  const handleImportFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.pdf,.docx,.doc';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !activeProjectId) return;
      const text = await importFile(file);
      // Create a new folder + chapter with the imported content
      const folderName = file.name.replace(/\.[^.]+$/, '');
      createFolder(activeProjectId, folderName);
      // We need to wait for folder creation, use timeout
      setTimeout(() => {
        const project = projects.find(p => p.id === activeProjectId);
        const folder = project?.folders[project.folders.length - 1];
        if (folder) {
          createChapter(activeProjectId, folder.id, folderName);
          setTimeout(() => {
            const updatedProject = projects.find(p => p.id === activeProjectId);
            const updatedFolder = updatedProject?.folders.find(f => f.id === folder.id);
            const chapter = updatedFolder?.chapters[updatedFolder.chapters.length - 1];
            if (chapter) {
              // We need to import this content via the context
              const event = new CustomEvent('import-content', { detail: { chapterId: chapter.id, folderId: folder.id, content: text } });
              window.dispatchEvent(event);
            }
          }, 100);
        }
      }, 100);
    };
    input.click();
  };

  return (
    <div className="glass h-full w-72 flex flex-col overflow-hidden shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchContext', language)}
            className="glass-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Project selector */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold opacity-70">{t('projects', language)}</h3>
          <button onClick={() => setShowNewProject(true)} className="p-1 rounded hover:bg-white/10">
            <Plus size={14} className="text-emerald-400" />
          </button>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all ${
                p.id === activeProjectId ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/10'
              }`}
            >
              <FolderOpen size={14} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New project modal */}
      {showNewProject && (
        <div className="p-3 border-b border-white/10 glass-subtle m-2">
          <input
            type="text"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            placeholder={t('projectName', language)}
            className="glass-input w-full px-3 py-2 text-sm mb-2"
            autoFocus
          />
          <input
            type="text"
            value={newProjectDesc}
            onChange={e => setNewProjectDesc(e.target.value)}
            placeholder={t('projectDescription', language)}
            className="glass-input w-full px-3 py-2 text-sm mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { if (newProjectName.trim()) { createProject(newProjectName.trim(), newProjectDesc.trim()); setShowNewProject(false); setNewProjectName(''); setNewProjectDesc(''); } }}
              className="glass-button glass-button-primary text-xs flex-1"
            >
              {t('save', language)}
            </button>
            <button onClick={() => setShowNewProject(false)} className="glass-button text-xs">
              {t('cancel', language)}
            </button>
          </div>
        </div>
      )}

      {/* Folder/Chapter tree */}
      {activeProject && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-70">{activeProject.name}</h3>
            <div className="flex gap-1">
              <button onClick={() => setShowNewFolder(true)} className="p-1 rounded hover:bg-white/10" title={t('newProject', language)}>
                <FolderPlus size={14} className="text-blue-400" />
              </button>
              <button onClick={handleImportFile} className="p-1 rounded hover:bg-white/10" title={t('import', language)}>
                <Upload size={14} className="text-purple-400" />
              </button>
            </div>
          </div>

          {/* New folder form */}
          {showNewFolder && (
            <div className="glass-subtle p-2 mb-2 flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Nom du dossier"
                className="glass-input flex-1 px-2 py-1 text-xs"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim() && activeProjectId) {
                    createFolder(activeProjectId, newFolderName.trim());
                    setNewFolderName('');
                    setShowNewFolder(false);
                  }
                }}
              />
              <button onClick={() => { if (newFolderName.trim() && activeProjectId) { createFolder(activeProjectId, newFolderName.trim()); setNewFolderName(''); setShowNewFolder(false); } }} className="text-emerald-400 text-xs">✓</button>
              <button onClick={() => setShowNewFolder(false)} className="opacity-50 text-xs">✕</button>
            </div>
          )}

          {/* Folders */}
          {filteredFolders.map(folder => (
            <div key={folder.id} className="mb-1">
              <div className="flex items-center gap-1 group">
                <button
                  onClick={() => toggleFolderCollapse(activeProjectId!, folder.id)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  {folder.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  onClick={() => { setActiveFolder(folder.id); if (folder.chapters[0]) setActiveChapter(folder.chapters[0].id); }}
                  className={`flex-1 text-left px-2 py-1 rounded text-sm flex items-center gap-2 ${
                    folder.id === activeFolderId ? 'bg-blue-500/15 text-blue-400' : 'hover:bg-white/10'
                  }`}
                >
                  <FolderOpen size={13} />
                  <span className="truncate">{folder.name}</span>
                </button>
                <button
                  onClick={() => { setShowNewChapter(true); setActiveFolder(folder.id); }}
                  className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FilePlus size={12} className="text-emerald-400" />
                </button>
                <button
                  onClick={() => { if (activeProjectId) deleteFolder(activeProjectId, folder.id); }}
                  className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>

              {/* Chapters */}
              {!folder.collapsed && (
                <div className="ml-5 mt-0.5 space-y-0.5">
                  {showNewChapter && folder.id === activeFolderId && (
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={newChapterTitle}
                        onChange={e => setNewChapterTitle(e.target.value)}
                        placeholder="Titre du chapitre"
                        className="glass-input flex-1 px-2 py-1 text-xs"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newChapterTitle.trim() && activeProjectId) {
                            createChapter(activeProjectId, folder.id, newChapterTitle.trim());
                            setNewChapterTitle('');
                            setShowNewChapter(false);
                          }
                        }}
                      />
                      <button onClick={() => { if (newChapterTitle.trim() && activeProjectId) { createChapter(activeProjectId, folder.id, newChapterTitle.trim()); setNewChapterTitle(''); setShowNewChapter(false); } }} className="text-emerald-400 text-xs">✓</button>
                      <button onClick={() => setShowNewChapter(false)} className="opacity-50 text-xs">✕</button>
                    </div>
                  )}
                  {folder.chapters.map(chapter => (
                    <div key={chapter.id} className="flex items-center gap-1 group/ch">
                      <button
                        onClick={() => { setActiveChapter(chapter.id); setActiveFolder(folder.id); }}
                        className={`flex-1 text-left px-2 py-1 rounded text-xs flex items-center gap-2 ${
                          chapter.id === activeChapterId ? 'bg-emerald-500/15 text-emerald-400' : 'hover:bg-white/10'
                        }`}
                      >
                        <FileText size={12} />
                        <span className="truncate">{chapter.title}</span>
                      </button>
                      <button
                        onClick={() => { if (activeProjectId) deleteChapter(activeProjectId, folder.id, chapter.id); }}
                        className="p-1 rounded hover:bg-white/10 opacity-0 group-hover/ch:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Tags section */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold opacity-50 uppercase tracking-wider">Tags</h4>
              <button onClick={() => setShowNewTag(!showNewTag)} className="p-1 rounded hover:bg-white/10">
                <Plus size={12} />
              </button>
            </div>
            {showNewTag && (
              <div className="flex gap-1 mb-2 items-center">
                <input
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="Nom du tag"
                  className="glass-input flex-1 px-2 py-1 text-xs"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <button onClick={() => { if (newTagName.trim() && activeProjectId) { createTag(activeProjectId, newTagName.trim(), newTagColor); setNewTagName(''); setShowNewTag(false); } }} className="text-emerald-400 text-xs">✓</button>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {activeProject.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: tag.color + '30', color: tag.color }}
                >
                  {tag.name}
                  <button onClick={() => { if (activeProjectId) deleteTag(activeProjectId, tag.id); }} className="hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes section */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-xs font-semibold opacity-50 uppercase tracking-wider w-full"
            >
              <StickyNote size={12} />
              Notes / Mémoire
            </button>
            {showNotes && (
              <div className="mt-2 space-y-1">
                {activeProject.notes.map(note => (
                  <div key={note.id} className="glass-subtle p-2 text-xs">
                    <div className="font-medium mb-1">{note.title}</div>
                    <div className="opacity-60 line-clamp-2">{note.content}</div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const title = prompt('Titre de la note :');
                    if (title) {
                      const content = prompt('Contenu de la note :') || '';
                      if (activeProjectId) addNote(activeProjectId, title, content);
                    }
                  }}
                  className="w-full text-center text-xs py-1 opacity-50 hover:opacity-100"
                >
                  + Ajouter une note
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!activeProject && (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm opacity-40 text-center">{t('noProjects', language)}</p>
        </div>
      )}
    </div>
  );
}
