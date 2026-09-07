import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { getInlineSuggestion } from '../services';
import { SlashCommand } from '../types';
import {
  Sparkles, AlignLeft, Type, Hash, Download, ChevronRight,
  Zap, BookOpen, PenTool, RefreshCw, CheckCircle, Search, BarChart3,
  Wand2, Languages, Lightbulb, FileText
} from 'lucide-react';

const SLASH_COMMANDS: SlashCommand[] = [
  { name: 'developper', description: 'Développer le texte avec une instruction', icon: '📝', action: 'expand' },
  { name: 'corriger', description: 'Corriger grammaire et orthographe', icon: '✓', action: 'correct' },
  { name: 'reecrire', description: 'Réécrire dans un style différent', icon: '✍️', action: 'rewrite' },
  { name: 'resumer', description: 'Résumer le contenu', icon: '📋', action: 'summarize' },
  { name: 'traduire', description: 'Traduire le texte', icon: '🌐', action: 'translate' },
  { name: 'analyser', description: 'Analyser le texte', icon: '🔍', action: 'analyze' },
  { name: 'plan', description: 'Générer un plan/outline', icon: '📐', action: 'outline' },
  { name: 'style', description: 'Améliorer le style', icon: '✨', action: 'style' },
  { name: 'note', description: 'Ajouter une note/mémoire', icon: '📌', action: 'note' },
  { name: 'continuer', description: 'Continuer le texte', icon: '→', action: 'continue' },
];

export function Editor() {
  const {
    language, activeChapter, activeProject, activeFolder, apiConfig, animationLevel,
    updateChapterContent, addNote, addAgentMessage,
  } = useApp();

  const [suggestion, setSuggestion] = useState('');
  const [suggestionWords, setSuggestionWords] = useState<string[]>([]);
  const [acceptedWordCount, setAcceptedWordCount] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashStartPos, setSlashStartPos] = useState(-1);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const wordCount = activeChapter?.content
    ? activeChapter.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = activeChapter?.content?.length || 0;

  // Inline suggestion with debounce (0.3s)
  const requestSuggestion = useCallback(async () => {
    if (!activeChapter || !apiConfig.inlineEndpoint || !apiConfig.inlineModel) return;
    if (activeChapter.content.length < 20) return;

    setIsGenerating(true);
    try {
      const result = await getInlineSuggestion(
        apiConfig,
        activeChapter.content,
        ''
      );
      if (result) {
        const words = result.split(/(\s+)/);
        setSuggestion(result);
        setSuggestionWords(words);
        setAcceptedWordCount(0);
        setShowSuggestion(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  }, [activeChapter, apiConfig]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeChapter || !activeProject || !activeFolder) return;
    const newContent = e.target.value;
    updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, newContent);

    // Check for slash commands
    const cursorPos = e.target.selectionStart;
    const textBefore = newContent.substring(0, cursorPos);
    const slashMatch = textBefore.match(/\/(\w*)$/);
    if (slashMatch) {
      setShowSlashMenu(true);
      setSlashQuery(slashMatch[1]);
      setSlashStartPos(cursorPos - slashMatch[0].length);
    } else {
      setShowSlashMenu(false);
    }

    // Debounce suggestion request (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestion(false);
    debounceRef.current = setTimeout(() => {
      requestSuggestion();
    }, 300);
  };

  // Accept suggestion by word
  const acceptNextWord = () => {
    if (!activeChapter || !activeProject || !activeFolder || suggestionWords.length === 0) return;
    if (acceptedWordCount >= suggestionWords.length) return;

    // Find next non-whitespace word to accept
    let nextWordEnd = acceptedWordCount;
    while (nextWordEnd < suggestionWords.length && suggestionWords[nextWordEnd].trim() === '') {
      nextWordEnd++;
    }
    if (nextWordEnd < suggestionWords.length) {
      nextWordEnd++; // include the word
      // Include trailing whitespace
      while (nextWordEnd < suggestionWords.length && suggestionWords[nextWordEnd].trim() === '') {
        nextWordEnd++;
      }
    }

    const acceptedText = suggestionWords.slice(0, nextWordEnd).join('');
    const newContent = activeChapter.content + acceptedText;
    updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, newContent);
    setAcceptedWordCount(nextWordEnd);

    if (nextWordEnd >= suggestionWords.length) {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  // Accept full suggestion
  const acceptFullSuggestion = () => {
    if (!activeChapter || !activeProject || !activeFolder) return;
    const newContent = activeChapter.content + (activeChapter.content.endsWith(' ') ? '' : ' ') + suggestion;
    updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, newContent);
    setSuggestion('');
    setShowSuggestion(false);
  };

  const rejectSuggestion = () => {
    setSuggestion('');
    setShowSuggestion(false);
    setAcceptedWordCount(0);
  };

  // Slash command execution
  const executeSlashCommand = (command: SlashCommand) => {
    if (!activeChapter || !activeProject || !activeFolder) return;

    // Remove the slash command text
    const content = activeChapter.content;
    const newContent = content.substring(0, slashStartPos) + content.substring(content.lastIndexOf('/' + slashQuery) + slashQuery.length + 1);
    updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, newContent);
    setShowSlashMenu(false);

    // Send to agent
    const prompts: Record<string, string> = {
      expand: `Développe et enrichis le texte suivant :\n\n${activeChapter.content}`,
      correct: `Corrige les fautes de grammaire et d'orthographe :\n\n${activeChapter.content}`,
      rewrite: `Réécris le texte suivant dans un style plus littéraire :\n\n${activeChapter.content}`,
      summarize: `Résume le texte suivant :\n\n${activeChapter.content}`,
      translate: `Traduis le texte suivant en anglais :\n\n${activeChapter.content}`,
      analyze: `Analyse en profondeur le texte suivant (structure, style, thèmes) :\n\n${activeChapter.content}`,
      outline: `Génère un plan structuré pour continuer ce texte :\n\n${activeChapter.content}`,
      style: `Améliore le style d'écriture du texte suivant :\n\n${activeChapter.content}`,
      note: '', // handled separately
      continue: `Continue naturellement le texte suivant :\n\n${activeChapter.content}`,
    };

    if (command.action === 'note') {
      const title = prompt('Titre de la note :');
      if (title) {
        addNote(activeProject.id, title, activeChapter.content.substring(0, 200));
      }
      return;
    }

    // Add message to agent
    addAgentMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: prompts[command.action] || command.description,
      timestamp: new Date().toISOString(),
    });
  };

  const filteredCommands = SLASH_COMMANDS.filter(c =>
    c.name.toLowerCase().includes(slashQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSuggestion) {
        if (e.key === 'Tab') {
          e.preventDefault();
          acceptNextWord();
        } else if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          acceptFullSuggestion();
        } else if (e.key === 'Escape') {
          rejectSuggestion();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSuggestion, suggestion, suggestionWords, acceptedWordCount, activeChapter]);

  // Listen for import events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && activeProject && activeFolder && activeChapter && detail.chapterId === activeChapter.id) {
        updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, detail.content);
      }
    };
    window.addEventListener('import-content', handler);
    return () => window.removeEventListener('import-content', handler);
  }, [activeProject, activeFolder, activeChapter]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-12 max-w-md">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            {t('welcome', language)}
          </h2>
          <p className="opacity-60">{t('welcomeDesc', language)}</p>
        </div>
      </div>
    );
  }

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-8">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="opacity-60">{t('noDocuments', language)}</p>
          <p className="text-xs opacity-40 mt-2">Sélectionnez ou créez un chapitre</p>
        </div>
      </div>
    );
  }

  const remainingSuggestion = suggestionWords.slice(acceptedWordCount).join('');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Document header */}
      <div className="glass-subtle m-3 mb-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Type size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-lg">{activeChapter.title}</h3>
          {/* Tags */}
          <div className="flex gap-1">
            {activeChapter.tags.map(tagId => {
              const tag = activeProject.tags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <span key={tagId} className="px-2 py-0.5 rounded-full text-xs" style={{ background: tag.color + '30', color: tag.color }}>
                  {tag.name}
                </span>
              );
            })}
          </div>
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
              if (!activeChapter) return;
              const blob = new Blob([activeChapter.content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeChapter.title}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity cursor-pointer"
            title={t('export', language)}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 relative m-3">
        <div className="glass h-full overflow-hidden relative">
          <textarea
            ref={editorRef}
            value={activeChapter.content}
            onChange={handleContentChange}
            className="w-full h-full p-6 bg-transparent resize-none outline-none text-base leading-relaxed"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            placeholder={`${t('typeMessage', language)} — Tapez / pour les commandes`}
            spellCheck
          />

          {/* Slash command menu */}
          {showSlashMenu && filteredCommands.length > 0 && (
            <div className="absolute top-16 left-6 glass p-2 z-20 w-64 max-h-64 overflow-y-auto">
              <div className="text-xs opacity-50 mb-2 px-2">Commandes</div>
              {filteredCommands.map(cmd => (
                <button
                  key={cmd.name}
                  onClick={() => executeSlashCommand(cmd)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-all"
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div>
                    <div className="text-sm font-medium">/{cmd.name}</div>
                    <div className="text-xs opacity-50">{cmd.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Inline suggestion overlay */}
          {showSuggestion && suggestion && (
            <div className="absolute bottom-4 left-4 right-4 glass-subtle p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Sparkles size={16} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  {acceptedWordCount > 0 && (
                    <span className="text-sm text-emerald-400">{suggestionWords.slice(0, acceptedWordCount).join('')}</span>
                  )}
                  <span className="text-sm opacity-60 italic">{remainingSuggestion}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-2">
                <button
                  onClick={acceptNextWord}
                  className="glass-button text-xs px-3 py-1 text-emerald-400"
                  title="Tab"
                >
                  Mot suivant →
                </button>
                <button
                  onClick={acceptFullSuggestion}
                  className="glass-button text-xs px-3 py-1 text-blue-400"
                  title="Shift+Enter"
                >
                  Tout accepter
                </button>
                <button
                  onClick={rejectSuggestion}
                  className="glass-button text-xs px-3 py-1 opacity-60"
                  title="Esc"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <div className="absolute top-4 right-4 flex items-center gap-2 glass-subtle px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs opacity-60">{t('generating', language)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
