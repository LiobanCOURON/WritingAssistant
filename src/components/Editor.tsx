import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { getInlineSuggestion, executeSlashCommand } from '../services';
import { SlashCommand } from '../types';
import {
  Sparkles, AlignLeft, Type, Hash, Download,
  Wand2, BookOpen, PenTool, RefreshCw, CheckCircle,
  Search, BarChart3, Brain, Lightbulb, ChevronRight,
  Check, X, Zap
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
    updateChapterContent, updateChapterTitle, getNotesContext,
    customAnimations, animationLevel,
  } = useApp();

  const shouldAnimate = animationLevel === 'more' || 
                        animationLevel === 'all' || 
                        animationLevel === 'chaos' || 
                        (animationLevel === 'custom' && customAnimations.iconsBounce);

  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [acceptedWords, setAcceptedWords] = useState(0);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPosition, setSlashPosition] = useState(0);
  const [titleEditing, setTitleEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  
  // Slash command instruction modal
  const [showSlashInstruction, setShowSlashInstruction] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<SlashCommand | null>(null);
  const [slashInstruction, setSlashInstruction] = useState('');
  
  // Diff system
  const [showDiff, setShowDiff] = useState(false);
  const [diffOriginal, setDiffOriginal] = useState('');
  const [diffModified, setDiffModified] = useState('');
  const [isApplyingDiff, setIsApplyingDiff] = useState(false);
  
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
    const cursorPos = e.target.selectionStart;
    updateChapterContent(activeChapter.id, newContent);

    // Check for slash command anywhere in text
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
      // Only show menu if no space/newline after slash (still typing command)
      if (!/[\s\n]/.test(textAfterSlash) || textAfterSlash.length === 0) {
        setShowSlashMenu(true);
        setSlashQuery(textAfterSlash);
        setSlashPosition(lastSlashIndex);
        setSlashIndex(0);
      } else {
        setShowSlashMenu(false);
      }
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
    if (acceptedWords >= words.length) return;
    
    const acceptedText = words.slice(0, acceptedWords + 1).join(' ');
    const remainingText = words.slice(acceptedWords + 1).join(' ');
    
    const newContent = activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + words[acceptedWords];
    updateChapterContent(activeChapter.id, newContent);
    setAcceptedWords(acceptedWords + 1);
    
    if (remainingText) {
      setSuggestion(remainingText);
    } else {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  const acceptAllSuggestion = () => {
    if (!activeChapter || !suggestion) return;
    const newContent = activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + suggestion;
    updateChapterContent(activeChapter.id, newContent);
    setShowSuggestion(false);
    setSuggestion('');
  };

  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion('');
  };

  // Select slash command
  const selectSlashCommand = (cmd: SlashCommand) => {
    setSelectedCommand(cmd);
    setShowSlashMenu(false);
    setShowSlashInstruction(true);
    setSlashInstruction('');
  };

  // Execute slash command with instruction
  const executeCommand = async () => {
    if (!activeChapter || !selectedCommand) return;
    
    setIsGenerating(true);
    setShowSlashInstruction(false);
    
    try {
      const notesContext = getNotesContext();
      const result = await executeSlashCommand(
        apiConfig,
        selectedCommand.action,
        activeChapter.content,
        slashInstruction,
        notesContext
      );
      
      if (result) {
        // Show diff
        setDiffOriginal(activeChapter.content);
        setDiffModified(result);
        setShowDiff(true);
      }
    } catch (e) {
      console.error(e);
    }
    
    setIsGenerating(false);
    setSlashInstruction('');
    setSelectedCommand(null);
  };

  // Apply diff
  const applyDiff = () => {
    if (!activeChapter) return;
    setIsApplyingDiff(true);
    setTimeout(() => {
      updateChapterContent(activeChapter.id, diffModified);
      setShowDiff(false);
      setDiffOriginal('');
      setDiffModified('');
      setIsApplyingDiff(false);
    }, 300);
  };

  const rejectDiff = () => {
    setShowDiff(false);
    setDiffOriginal('');
    setDiffModified('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSlashMenu && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlashIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          selectSlashCommand(filteredCommands[slashIndex]);
        } else if (e.key === 'Escape') {
          setShowSlashMenu(false);
        }
      }
      
      if (showSuggestion) {
        if (e.key === 'Tab') {
          e.preventDefault();
          acceptNextWord();
        } else if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          acceptAllSuggestion();
        } else if (e.key === 'Escape') {
          rejectSuggestion();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSlashMenu, filteredCommands, slashIndex, showSuggestion, suggestion, acceptedWords, activeChapter]);

  // Export
  const exportDocument = () => {
    if (!activeChapter) return;
    const blob = new Blob([activeChapter.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChapter.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-12 max-w-md anim-scale-in">
          <div className={`text-6xl mb-4 ${shouldAnimate ? 'anim-float' : ''}`}>✍️</div>
          <h2 className="text-2xl font-bold mb-2 text-gradient-anim">
            {t('welcome', language)}
          </h2>
          <p className="opacity-60 anim-fade-in">{t('welcomeDesc', language)}</p>
        </div>
      </div>
    );
  }

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-8 anim-scale-in">
          <p className="opacity-60">{t('noDocuments', language)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden anim-fade-in">
      {/* Document header */}
      <div className="glass-subtle m-3 mb-0 p-3 flex items-center justify-between anim-slide-down">
        <div className="flex items-center gap-3">
          <Type size={18} className={`text-emerald-400 ${shouldAnimate ? 'anim-float' : ''}`} />
          {titleEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                updateChapterTitle(activeChapter.id, editTitle);
                setTitleEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateChapterTitle(activeChapter.id, editTitle);
                  setTitleEditing(false);
                }
              }}
              className="glass-input px-3 py-1 text-lg font-semibold"
              autoFocus
            />
          ) : (
            <h3 
              className="font-semibold text-lg cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => {
                setEditTitle(activeChapter.title);
                setTitleEditing(true);
              }}
            >
              {activeChapter.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm opacity-60">
          <span className="flex items-center gap-1 anim-fade-in">
            <Hash size={14} />
            {wordCount} {t('wordCount', language)}
          </span>
          <span className="flex items-center gap-1 anim-fade-in" style={{ animationDelay: '0.1s' }}>
            <AlignLeft size={14} />
            {charCount} {t('charCount', language)}
          </span>
          <button
            onClick={exportDocument}
            className="flex items-center gap-1 hover:opacity-100 transition-all hover-lift cursor-pointer"
            title={t('export', language)}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 relative m-3">
        <div className="glass h-full overflow-hidden relative anim-zoom-in">
          <textarea
            ref={editorRef}
            value={activeChapter.content}
            onChange={handleContentChange}
            className="w-full h-full p-6 bg-transparent resize-none outline-none text-base leading-relaxed"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            placeholder={t('typeMessage', language)}
            spellCheck
          />

          {/* Inline suggestion overlay */}
          {showSuggestion && suggestion && (
            <div className="absolute bottom-4 left-4 right-4 glass-subtle p-3 flex items-center justify-between anim-slide-up shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={`text-emerald-400 ${shouldAnimate ? 'anim-pulse' : ''}`} />
                <span className="text-sm opacity-80 italic">
                  {suggestion.split(/\s+/).slice(0, acceptedWords + 1).join(' ')}
                  <span className="opacity-40"> {suggestion.split(/\s+/).slice(acceptedWords + 1).join(' ')}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={acceptNextWord}
                  className="glass-button text-xs px-3 py-1 text-emerald-400 hover-glow ripple"
                >
                  {t('nextWord', language)} (Tab)
                </button>
                <button
                  onClick={acceptAllSuggestion}
                  className="glass-button text-xs px-3 py-1 text-blue-400 hover-glow ripple"
                >
                  {t('acceptAll', language)} (Ctrl+Enter)
                </button>
                <button
                  onClick={rejectSuggestion}
                  className="glass-button text-xs px-3 py-1 opacity-60 hover-glow ripple"
                >
                  {t('rejectSuggestion', language)} (Esc)
                </button>
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <div className="absolute top-4 right-4 flex items-center gap-2 glass-subtle px-3 py-1.5 anim-scale-in">
              <div className="w-2 h-2 rounded-full bg-emerald-400 anim-pulse" />
              <span className="text-xs opacity-60">{t('generating', language)}</span>
            </div>
          )}
        </div>

        {/* Slash command menu */}
        {showSlashMenu && filteredCommands.length > 0 && (
          <div className="absolute top-20 left-20 glass p-2 z-50 min-w-[280px] max-h-[300px] overflow-y-auto anim-scale-in shadow-2xl">
            <div className="text-xs opacity-60 px-3 py-1 mb-1 flex items-center gap-2">
              <Zap size={12} className="text-emerald-400" />
              {t('slashCommands', language)}
            </div>
            {filteredCommands.map((cmd, index) => (
              <button
                key={cmd.name}
                onClick={() => selectSlashCommand(cmd)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all anim-slide-in-left hover-lift ${
                  index === slashIndex
                    ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-emerald-400'
                    : 'hover:bg-white/10'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <span className="text-lg">{cmd.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">/{cmd.name}</div>
                  <div className="text-xs opacity-60">{cmd.description}</div>
                </div>
                {index === slashIndex && <ChevronRight size={16} className="text-emerald-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slash command instruction modal */}
      {showSlashInstruction && selectedCommand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="dropdown-backdrop" onClick={() => setShowSlashInstruction(false)} />
          <div className="glass p-6 max-w-md w-full anim-scale-in shadow-2xl relative z-40">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl anim-bounce-in">{selectedCommand.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gradient-anim">/{selectedCommand.name}</h3>
                <p className="text-sm opacity-60">{selectedCommand.description}</p>
              </div>
            </div>
            
            <textarea
              value={slashInstruction}
              onChange={(e) => setSlashInstruction(e.target.value)}
              placeholder="Décrivez votre instruction..."
              className="glass-input w-full p-3 min-h-[120px] resize-none mb-4"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button
                onClick={executeCommand}
                disabled={!slashInstruction.trim() || isGenerating}
                className="glass-button glass-button-primary flex-1 hover-glow ripple disabled:opacity-50"
              >
                {isGenerating ? t('generating', language) : 'Exécuter'}
              </button>
              <button
                onClick={() => setShowSlashInstruction(false)}
                className="glass-button hover-glow ripple"
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff viewer */}
      {showDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="dropdown-backdrop" onClick={rejectDiff} />
          <div className="glass p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col anim-scale-in shadow-2xl relative z-40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gradient-anim flex items-center gap-2">
                <RefreshCw size={20} className="anim-rotate-in" />
                Modifications proposées
              </h3>
              <button onClick={rejectDiff} className="glass-button p-2 hover-glow ripple">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto glass-subtle p-4 font-mono text-sm leading-relaxed">
              {/* Simple diff visualization */}
              <div className="whitespace-pre-wrap">
                {diffModified.split('\n').map((line, i) => {
                  const originalLines = diffOriginal.split('\n');
                  const isChanged = !originalLines.includes(line);
                  return (
                    <div
                      key={i}
                      className={`${isChanged ? 'diff-added anim-slide-in-left' : ''}`}
                      style={{ animationDelay: `${i * 0.02}s` }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={applyDiff}
                disabled={isApplyingDiff}
                className="glass-button glass-button-primary flex-1 hover-glow ripple disabled:opacity-50"
              >
                {isApplyingDiff ? 'Application...' : 'Appliquer les modifications'}
              </button>
              <button
                onClick={rejectDiff}
                className="glass-button hover-glow ripple"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
