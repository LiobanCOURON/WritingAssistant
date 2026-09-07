import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { getInlineSuggestion } from '../services';
import { SlashCommand } from '../types';
import {
  Sparkles, AlignLeft, Type, Hash, Download,
  Wand2, BookOpen, PenTool, RefreshCw, CheckCircle,
  Search, BarChart3, Brain, Lightbulb, ChevronRight,
  Check, X
} from 'lucide-react';

const SLASH_COMMANDS: SlashCommand[] = [
  { name: 'developper', description: 'Développer le texte avec une instruction', icon: '✨', action: 'develop' },
  { name: 'resume', description: 'Résumer le contenu actuel', icon: '📋', action: 'summarize' },
  { name: 'corriger', description: 'Corriger grammaire et orthographe', icon: '✓', action: 'correct' },
  { name: 'reecrire', description: 'Réécrire dans un style différent', icon: '🔄', action: 'rewrite' },
  { name: 'analyser', description: 'Analyser le style et la structure', icon: '📊', action: 'analyze' },
  { name: 'idees', description: 'Générer des idées pour la suite', icon: '💡', action: 'brainstorm' },
  { name: 'plan', description: 'Générer un plan de section', icon: '📝', action: 'outline' },
  { name: 'traduire', description: 'Traduire le texte', icon: '🌐', action: 'translate' },
  { name: 'personnage', description: 'Créer un personnage', icon: '👤', action: 'character' },
  { name: 'lieu', description: 'Décrire un lieu', icon: '📍', action: 'place' },
];

export function Editor() {
  const {
    language, activeChapter, activeProject, activeFolder, apiConfig,
    updateChapterContent, updateChapterTitle,
  } = useApp();

  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [acceptedWords, setAcceptedWords] = useState(0);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const [titleEditing, setTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const wordCount = activeChapter?.content
    ? activeChapter.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = activeChapter?.content?.length || 0;

  // Filtered slash commands
  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.name.includes(slashQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Inline suggestion with debounce (300ms)
  const requestSuggestion = useCallback(async () => {
    if (!activeChapter || !apiConfig.inlineEndpoint || !apiConfig.inlineModel) return;
    if (activeChapter.content.length < 20) return;

    setIsGenerating(true);
    try {
      const result = await getInlineSuggestion(apiConfig, activeChapter.content, '');
      if (result) {
        setSuggestion(result);
        setShowSuggestion(true);
        setAcceptedWords(0);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  }, [activeChapter, apiConfig]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeChapter) return;
    const newContent = e.target.value;
    updateChapterContent(activeChapter.id, newContent);

    // Check for slash command
    const lastLine = newContent.split('\n').pop() || '';
    if (lastLine.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashQuery(lastLine.slice(1));
      setSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }

    // Debounce suggestion
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestion(false);
    debounceRef.current = setTimeout(() => {
      requestSuggestion();
    }, 300);
  };

  // Accept suggestion word by word
  const acceptNextWord = () => {
    if (!activeChapter || !suggestion) return;
    const words = suggestion.split(/\s+/);
    if (acceptedWords >= words.length) {
      // All accepted
      acceptAll();
      return;
    }
    const accepted = words.slice(0, acceptedWords + 1).join(' ');
    const remaining = words.slice(acceptedWords + 1).join(' ');
    const newContent = activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + accepted;
    updateChapterContent(activeChapter.id, newContent);
    setAcceptedWords(acceptedWords + 1);
    setSuggestion(remaining);
    if (!remaining) setShowSuggestion(false);
  };

  const acceptAll = () => {
    if (!activeChapter || !suggestion) return;
    const newContent = activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + suggestion;
    updateChapterContent(activeChapter.id, newContent);
    setSuggestion('');
    setShowSuggestion(false);
    setAcceptedWords(0);
  };

  const rejectSuggestion = () => {
    setSuggestion('');
    setShowSuggestion(false);
    setAcceptedWords(0);
  };

  // Execute slash command
  const executeSlashCommand = (cmd: SlashCommand) => {
    if (!activeChapter) return;
    // Remove the slash command from content
    const lines = activeChapter.content.split('\n');
    lines[lines.length - 1] = '';
    updateChapterContent(activeChapter.id, lines.join('\n'));
    setShowSlashMenu(false);

    // Send to agent
    // This would normally trigger the agent panel
    // For now, we'll just show a notification
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSlashMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlashIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[slashIndex]) {
            executeSlashCommand(filteredCommands[slashIndex]);
          }
        } else if (e.key === 'Escape') {
          setShowSlashMenu(false);
        }
        return;
      }

      if (showSuggestion) {
        if (e.key === 'Tab') {
          e.preventDefault();
          acceptNextWord();
        } else if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          acceptAll();
        } else if (e.key === 'Escape') {
          rejectSuggestion();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSuggestion, showSlashMenu, suggestion, acceptedWords, slashIndex, filteredCommands]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-12 max-w-md anim-scale-in">
          <div className="text-7xl mb-4 anim-float">✍️</div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            {t('welcome', language)}
          </h2>
          <p className="opacity-60 text-lg">{t('welcomeDesc', language)}</p>
        </div>
      </div>
    );
  }

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-8 anim-scale-in">
          <div className="text-5xl mb-3 anim-float">📄</div>
          <p className="opacity-60 text-lg">{t('noDocuments', language)}</p>
          <p className="opacity-40 text-sm mt-2">Sélectionnez ou créez un chapitre</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden anim-fade-in">
      {/* Chapter header */}
      <div className="glass-subtle m-3 mb-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Type size={18} className="text-emerald-400" />
          {titleEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => {
                updateChapterTitle(activeChapter.id, editTitle);
                setTitleEditing(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateChapterTitle(activeChapter.id, editTitle);
                  setTitleEditing(false);
                }
              }}
              className="glass-input px-2 py-1 text-lg font-semibold"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-lg cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => { setEditTitle(activeChapter.title); setTitleEditing(true); }}
            >
              {activeChapter.title}
            </h3>
          )}
          {activeFolder && (
            <span className="text-xs opacity-40 flex items-center gap-1">
              <ChevronRight size={12} />
              {activeFolder.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm opacity-60">
          <span className="flex items-center gap-1">
            <Hash size={14} />
            {wordCount} {t('wordCount', language)}
          </span>
          <span className="flex items-center gap-1">
            <AlignLeft size={14} />
            {charCount} {t('charCount', language)}
          </span>
          <button
            onClick={() => {
              const blob = new Blob([activeChapter.content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeChapter.title}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity cursor-pointer hover-glow"
            title={t('export', language)}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Tags */}
      {activeChapter.tags.length > 0 && (
        <div className="flex gap-1 px-5 py-1 flex-wrap">
          {activeChapter.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 anim-scale-in">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 relative m-3">
        <div className="glass h-full overflow-hidden relative">
          <textarea
            ref={editorRef}
            value={activeChapter.content}
            onChange={handleContentChange}
            className="w-full h-full p-6 bg-transparent resize-none outline-none text-base leading-relaxed"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            placeholder={`${t('typeMessage', language)}\n\nTapez / pour les commandes...`}
            spellCheck
          />

          {/* Slash command menu */}
          {showSlashMenu && filteredCommands.length > 0 && (
            <div className="absolute bottom-20 left-6 glass-subtle p-2 min-w-[250px] max-h-[300px] overflow-y-auto anim-slide-up z-20">
              <div className="text-xs opacity-40 px-2 py-1 mb-1">{t('slashCommands', language)}</div>
              {filteredCommands.map((cmd, i) => (
                <button
                  key={cmd.name}
                  onClick={() => executeSlashCommand(cmd)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                    i === slashIndex ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div>
                    <div className="font-medium">/{cmd.name}</div>
                    <div className="text-xs opacity-50">{cmd.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Inline suggestion bar */}
          {showSuggestion && suggestion && (
            <div className="absolute bottom-4 left-4 right-4 glass-subtle p-3 anim-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-emerald-400 anim-pulse" />
                <span className="text-sm font-medium text-emerald-400">{t('inlineSuggestion', language)}</span>
                {acceptedWords > 0 && (
                  <span className="text-xs opacity-40">
                    ({acceptedWords} {t('nextWord', language)})
                  </span>
                )}
              </div>
              <p className="text-sm opacity-80 italic mb-3 leading-relaxed">{suggestion}</p>
              <div className="flex gap-2">
                <button
                  onClick={acceptNextWord}
                  className="glass-button text-xs px-3 py-1.5 text-emerald-400 flex items-center gap-1 hover-glow anim-scale-hover"
                >
                  <ChevronRight size={12} />
                  {t('nextWord', language)} (Tab)
                </button>
                <button
                  onClick={acceptAll}
                  className="glass-button text-xs px-3 py-1.5 text-blue-400 flex items-center gap-1 hover-glow anim-scale-hover"
                >
                  <Check size={12} />
                  {t('acceptAll', language)} (Ctrl+Enter)
                </button>
                <button
                  onClick={rejectSuggestion}
                  className="glass-button text-xs px-3 py-1.5 opacity-60 flex items-center gap-1 hover-glow anim-scale-hover"
                >
                  <X size={12} />
                  {t('rejectSuggestion', language)}
                </button>
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <div className="absolute top-4 right-4 flex items-center gap-2 glass-subtle px-3 py-1.5 anim-fade-in">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs opacity-60">{t('generating', language)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
