import React, { useState } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { FolderOpen, FileText, Plus, Trash2, X } from 'lucide-react';

export function Sidebar() {
  const {
    language, projects, activeProject, activeDocument, sidebarOpen,
    createProject, deleteProject, setActiveProject,
    createDocument, deleteDocument, setActiveDocument, setSidebarOpen,
  } = useApp();

  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDesc.trim());
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
    }
  };

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      createDocument(newDocTitle.trim());
      setNewDocTitle('');
      setShowNewDoc(false);
    }
  };

  if (!sidebarOpen) return null;

  return (
    <div className="glass h-full w-72 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          {t('projects', language)}
        </h2>
        <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 && (
          <p className="text-sm opacity-60 text-center py-8">{t('noProjects', language)}</p>
        )}
        {projects.map(project => (
          <div key={project.id} className="rounded-xl overflow-hidden">
            <div
              className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                activeProject?.id === project.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-emerald-500/30'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setActiveProject(project)}
            >
              <FolderOpen size={16} className={activeProject?.id === project.id ? 'text-emerald-400' : 'text-blue-400'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.name}</p>
                <p className="text-xs opacity-50 truncate">{project.description || t('projectDescription', language)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Documents */}
            {activeProject?.id === project.id && (
              <div className="ml-4 mt-1 space-y-1">
                {project.documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all ${
                      activeDocument?.id === doc.id
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setActiveDocument(doc)}
                  >
                    <FileText size={14} />
                    <span className="flex-1 truncate">{doc.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                      className="p-0.5 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {showNewDoc ? (
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      placeholder={t('documentTitle', language)}
                      className="glass-input w-full px-3 py-1.5 text-sm"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleCreateDocument()}
                    />
                    <div className="flex gap-1">
                      <button onClick={handleCreateDocument} className="glass-button text-xs px-2 py-1">
                        {t('save', language)}
                      </button>
                      <button onClick={() => setShowNewDoc(false)} className="glass-button text-xs px-2 py-1">
                        {t('cancel', language)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewDoc(true)}
                    className="flex items-center gap-1 p-2 text-xs opacity-60 hover:opacity-100 hover:text-emerald-400 transition-all"
                  >
                    <Plus size={12} />
                    {t('newDocument', language)}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Project Button */}
      <div className="p-3 border-t border-white/10">
        {showNewProject ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder={t('projectName', language)}
              className="glass-input w-full px-3 py-2 text-sm"
              autoFocus
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={e => setNewProjectDesc(e.target.value)}
              placeholder={t('projectDescription', language)}
              className="glass-input w-full px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateProject} className="glass-button glass-button-primary text-xs flex-1">
                {t('save', language)}
              </button>
              <button onClick={() => setShowNewProject(false)} className="glass-button text-xs flex-1">
                {t('cancel', language)}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className="glass-button glass-button-primary w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {t('newProject', language)}
          </button>
        )}
      </div>
    </div>
  );
}
