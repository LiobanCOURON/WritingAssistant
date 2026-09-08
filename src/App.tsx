import React, { useEffect } from 'react';
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
import { useHoverTrail, useExplosionParticles } from './hooks/useParticles';
import { soundManager } from './utils/sounds';

function AppContent() {
  const {
    language, sidebarOpen, agentOpen, settingsOpen, notesOpen,
    setSidebarOpen, setAgentOpen, setSettingsOpen, setNotesOpen,
    activeProject, animationLevel, customAnimations,
  } = useApp();

  // Enable hover trail only in "all" animation mode
  if (animationLevel === 'all') {
    useHoverTrail();
  }

  const { createExplosion } = useExplosionParticles();
  const isChaos = animationLevel === 'chaos';
  
  const shouldAnimate = animationLevel === 'more' || 
                        animationLevel === 'all' || 
                        animationLevel === 'chaos' || 
                        (animationLevel === 'custom' && customAnimations.iconsBounce);

  const handleSidebarToggle = (e: React.MouseEvent) => {
    setSidebarOpen(!sidebarOpen);
    soundManager.whoosh();
    createExplosion(e.clientX, e.clientY, '#3b82f6', isChaos);
  };

  const handleAgentToggle = (e: React.MouseEvent) => {
    setAgentOpen(!agentOpen);
    soundManager.whoosh();
    createExplosion(e.clientX, e.clientY, '#10b981', isChaos);
  };

  const handleNotesToggle = (e: React.MouseEvent) => {
    setNotesOpen(!notesOpen);
    soundManager.pop();
    createExplosion(e.clientX, e.clientY, '#8b5cf6', isChaos);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-1" style={{ top: '20%', left: '80%', animationDuration: '18s' }} />
        <div className="particle particle-2" style={{ top: '60%', left: '10%', animationDuration: '22s' }} />
        <div className="particle particle-3" style={{ top: '80%', left: '70%', animationDuration: '25s' }} />
        <div className="particle particle-4" style={{ top: '40%', left: '90%', animationDuration: '20s' }} />
        <div className="particle particle-5" style={{ top: '10%', left: '50%', animationDuration: '28s' }} />
        <div className="particle particle-1" style={{ top: '70%', left: '30%', animationDuration: '16s' }} />
        <div className="particle particle-2" style={{ top: '30%', left: '60%', animationDuration: '24s' }} />
        <div className="particle particle-3" style={{ top: '90%', left: '20%', animationDuration: '19s' }} />
        <div className="particle particle-4" style={{ top: '50%', left: '40%', animationDuration: '21s' }} />
        <div className="particle particle-5" style={{ top: '15%', left: '75%', animationDuration: '23s' }} />
        <div className="particle particle-1" style={{ top: '45%', left: '25%', animationDuration: '17s' }} />
        <div className="particle particle-2" style={{ top: '75%', left: '85%', animationDuration: '26s' }} />
        <div className="particle particle-3" style={{ top: '5%', left: '45%', animationDuration: '20s' }} />
        <div className="particle particle-4" style={{ top: '85%', left: '55%', animationDuration: '22s' }} />
        <div className="particle particle-5" style={{ top: '35%', left: '15%', animationDuration: '24s' }} />
        <div className="particle particle-1" style={{ top: '55%', left: '65%', animationDuration: '19s' }} />
        <div className="particle particle-2" style={{ top: '25%', left: '35%', animationDuration: '21s' }} />
        <div className="particle particle-3" style={{ top: '65%', left: '75%', animationDuration: '23s' }} />
        <div className="particle particle-4" style={{ top: '95%', left: '45%', animationDuration: '25s' }} />
        <div className="particle particle-5" style={{ top: '35%', left: '95%', animationDuration: '27s' }} />
        
        {/* Chaos mode: 100+ extra particles */}
        {animationLevel === 'chaos' && Array.from({ length: 100 }, (_, i) => (
          <div
            key={`chaos-${i}`}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              background: `hsl(${Math.random() * 360}, 100%, 50%)`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* Top Bar */}
      <header className="glass-subtle m-2 mb-0 px-4 py-2 flex items-center justify-between shrink-0 z-10 anim-slide-down">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 anim-scale-hover">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ${shouldAnimate ? 'anim-pulse-subtle' : ''}`}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
              {t('appTitle', language)}
            </h1>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={handleSidebarToggle}
            onMouseEnter={() => soundManager.hover()}
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
              onClick={handleNotesToggle}
              onMouseEnter={() => soundManager.hover()}
              className="glass-button p-2 anim-scale-hover hover-glow"
              title={t('memory', language)}
            >
              <StickyNote size={18} className="text-purple-400" />
            </button>
          )}

          {/* Agent toggle */}
          <button
            onClick={handleAgentToggle}
            onMouseEnter={() => soundManager.hover()}
            className="glass-button p-2 anim-scale-hover hover-glow"
            title={t('agent', language)}
          >
            {agentOpen ? <PanelRightOpen size={18} /> : <Bot size={18} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setSettingsOpen(true);
              soundManager.click();
            }}
            onMouseEnter={() => soundManager.hover()}
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
