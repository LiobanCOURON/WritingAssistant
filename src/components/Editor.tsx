import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { getInlineSuggestion } from '../services';
import { Sparkles, AlignLeft, Type, Hash, Download } from 'lucide-react';

export function Editor() {
  const {
    language, activeDocument, activeProject, apiConfig,
    updateDocumentContent,
  } = useApp();

  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const wordCount = activeDocument?.content
    ? activeDocument.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = activeDocument?.content?.length || 0;

  // Inline suggestion with debounce
  const requestSuggestion = useCallback(async () => {
    if (!activeDocument || !apiConfig.inlineEndpoint || !apiConfig.inlineModel) return;
    if (activeDocument.content.length < 20) return;

    setIsGenerating(true);
    try {
      const result = await getInlineSuggestion(
        apiConfig,
        activeDocument.content,
        ''
      );
      if (result) {
        setSuggestion(result);
        setShowSuggestion(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  }, [activeDocument, apiConfig]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeDocument) return;
    const newContent = e.target.value;
    updateDocumentContent(activeDocument.id, newContent);

    // Debounce suggestion request
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestion(false);
    debounceRef.current = setTimeout(() => {
      requestSuggestion();
    }, 3000);
  };

  const acceptSuggestion = () => {
    if (!activeDocument || !suggestion) return;
    const newContent = activeDocument.content + (activeDocument.content.endsWith(' ') ? '' : ' ') + suggestion;
    updateDocumentContent(activeDocument.id, newContent);
    setSuggestion('');
    setShowSuggestion(false);
  };

  const rejectSuggestion = () => {
    setSuggestion('');
    setShowSuggestion(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && showSuggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
      if (e.key === 'Escape' && showSuggestion) {
        rejectSuggestion();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSuggestion, suggestion, activeDocument]);

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

  if (!activeDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass p-8">
          <p className="opacity-60">{t('noDocuments', language)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Document header */}
      <div className="glass-subtle m-3 mb-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Type size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-lg">{activeDocument.title}</h3>
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
              if (!activeDocument) return;
              const blob = new Blob([activeDocument.content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeDocument.title}.txt`;
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
            value={activeDocument.content}
            onChange={handleContentChange}
            className="w-full h-full p-6 bg-transparent resize-none outline-none text-base leading-relaxed"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            placeholder={t('typeMessage', language)}
            spellCheck
          />

          {/* Inline suggestion overlay */}
          {showSuggestion && suggestion && (
            <div className="absolute bottom-4 left-4 right-4 glass-subtle p-3 flex items-center justify-between animate-in">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="text-sm opacity-80 italic">{suggestion}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={acceptSuggestion}
                  className="glass-button text-xs px-3 py-1 text-emerald-400"
                >
                  {t('acceptSuggestion', language)}
                </button>
                <button
                  onClick={rejectSuggestion}
                  className="glass-button text-xs px-3 py-1 opacity-60"
                >
                  {t('rejectSuggestion', language)}
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
