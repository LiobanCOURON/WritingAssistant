import React from 'react';
import { AppProvider, useApp } from './contexts';
import { t } from './i18n';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AgentPanel } from './components/AgentPanel';
import { SettingsModal } from './components/Settings';
import { NotesPanel } from './components/NotesPanel';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Menu, Bot, Settings, PanelLeftOpen, PanelRightOpen, StickyNote } from 'lucide-react';

function AppContent() {
  const {
    language, sidebarOpen, agentOpen, settingsOpen, notesOpen,
    setSidebarOpen, setAgentOpen, setSettingsOpen, setNotesOpen,
    activeProject,
  } = useApp();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      {/* Top Bar */}
      <header className="glass-subtle m-2 mb-0 px-4 py-2 flex items-center justify-between shrink-0 z-10 anim-slide-down">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 anim-scale-hover">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 anim-pulse-subtle">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
              {t('appTitle', language)}
            </h1>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="glass-button p-2 ml-2 anim-scale-hover hover-glow"
            title={sidebarOpen ? 'Masquer' : 'Afficher'}
          >
            {sidebarOpen ? <PanelLeftOpen size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* Notes toggle */}
          {activeProject && (
            <button
              onClick={() => setNotesOpen(true)}
              className="glass-button p-2 anim-scale-hover hover-glow"
              title={t('memory', language)}
            >
              <StickyNote size={18} className="text-purple-400" />
            </button>
          )}

          {/* Agent toggle */}
          <button
            onClick={() => setAgentOpen(!agentOpen)}
            className="glass-button p-2 anim-scale-hover hover-glow"
            title={t('agent', language)}
          >
            {agentOpen ? <PanelRightOpen size={18} /> : <Bot size={18} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="glass-button p-2 anim-scale-hover hover-glow"
            title={t('settings', language)}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Sidebar */}
        <Sidebar />

        {/* Editor */}
        <Editor />

        {/* Agent Panel */}
        <AgentPanel />
      </div>

      {/* Modals */}
      <SettingsModal />
      <NotesPanel />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
