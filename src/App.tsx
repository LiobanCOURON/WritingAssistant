import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts';
import { t } from './i18n';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AgentPanel } from './components/AgentPanel';
import { SettingsModal } from './components/Settings';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Menu, Bot, Settings, PanelLeftOpen, PanelRightOpen } from 'lucide-react';

function AppContent() {
  const {
    language, sidebarOpen, agentOpen, settingsOpen, animationLevel,
    setSidebarOpen, setAgentOpen, setSettingsOpen,
  } = useApp();

  // Apply animation level to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-animation', animationLevel);
  }, [animationLevel]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="glass-subtle m-2 mb-0 px-4 py-2 flex items-center justify-between shrink-0 z-10 animate-fade-in">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center transition-transform hover:scale-110 hover:rotate-3">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent hidden sm:block animate-gradient">
              {t('appTitle', language)}
            </h1>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="glass-button p-2 ml-2"
            title={sidebarOpen ? 'Masquer' : 'Afficher'}
          >
            {sidebarOpen ? <PanelLeftOpen size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* Agent toggle */}
          <button
            onClick={() => setAgentOpen(!agentOpen)}
            className="glass-button p-2"
            title={t('agent', language)}
          >
            {agentOpen ? <PanelRightOpen size={18} /> : <Bot size={18} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="glass-button p-2"
            title={t('settings', language)}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'animate-slide-left' : ''}`}>
          <Sidebar />
        </div>

        {/* Editor */}
        <Editor />

        {/* Agent Panel */}
        <div className={`transition-all duration-300 ${agentOpen ? 'animate-slide-right' : ''}`}>
          <AgentPanel />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal />
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
