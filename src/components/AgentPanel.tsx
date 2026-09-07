import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { agentChat, executeTool, ToolCall } from '../services';
import { AgentMessage } from '../types';
import {
  Send, Bot, User, Wrench, Trash2, X,
  BookOpen, PenTool, RefreshCw, CheckCircle, Search, BarChart3,
  ChevronDown, Copy, Lightbulb, FileText
} from 'lucide-react';

export function AgentPanel() {
  const {
    language, agentMessages, activeChapter, activeProject, apiConfig,
    addAgentMessage, clearAgentMessages, agentOpen, setAgentOpen,
    getRAGContext, updateChapterContent,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiConfig.agentEndpoint || !apiConfig.agentModel) {
      addAgentMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Veuillez configurer l\'endpoint Agent dans les paramètres.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addAgentMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const ragContext = getRAGContext(input);
      const projectContext = activeChapter
        ? `Chapitre actuel: "${activeChapter.title}" (dossier: ${activeProject?.folders.find(f => f.chapters.some(c => c.id === activeChapter.id))?.name || 'N/A'})\nMémoire du chapitre:\n${activeChapter.memory || 'Aucune'}\nContenu:\n${activeChapter.content.substring(0, 2000)}`
        : '';

      const allMessages = [...agentMessages, userMsg];

      // Collect all documents for tool execution
      const documents = activeProject?.folders.flatMap(f =>
        f.chapters.map(c => ({ title: `${f.name}/${c.title}`, content: c.content }))
      ) || [];

      const response = await agentChat(apiConfig, allMessages, ragContext, projectContext);

      addAgentMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      addAgentMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ ${t('error', language)}: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    setIsLoading(false);
  };

  const quickActions = [
    { icon: BookOpen, label: t('summarize', language), action: 'Résume le document actuel.' },
    { icon: PenTool, label: t('expand', language), action: 'Développe et enrichis le document actuel.' },
    { icon: RefreshCw, label: t('rewrite', language), action: 'Réécris le document actuel dans un style plus littéraire.' },
    { icon: CheckCircle, label: t('correct', language), action: 'Corrige les fautes de grammaire et d\'orthographe du document actuel.' },
    { icon: Search, label: t('searchContext', language), action: 'Recherche les informations clés dans les documents du projet.' },
    { icon: BarChart3, label: t('analyze', language), action: 'Analyse la structure et les thèmes du document actuel.' },
    { icon: Lightbulb, label: t('slashCommands', language).replace('Commandes', 'Idées'), action: 'Propose des idées pour continuer l\'histoire.' },
    { icon: FileText, label: 'Plan', action: 'Génère un plan structuré pour la suite.' },
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applyToEditor = (text: string) => {
    if (activeChapter) {
      updateChapterContent(activeChapter.id, activeChapter.content + '\n\n' + text);
    }
  };

  if (!agentOpen) return null;

  return (
    <div className="glass h-full w-96 flex flex-col overflow-hidden shrink-0 anim-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-emerald-400 anim-pulse" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            {t('agent', language)}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearAgentMessages}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all hover-glow opacity-60 hover:opacity-100"
            title={t('clearChat', language)}
          >
            <Trash2 size={16} />
          </button>
          <button onClick={() => setAgentOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all hover-glow">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10">
        <div className="grid grid-cols-4 gap-1.5">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(qa.action)}
              className="glass-subtle p-2 flex flex-col items-center gap-1 text-xs hover:bg-white/10 transition-all hover-glow anim-scale-hover"
              title={qa.action}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <qa.icon size={14} className="text-blue-400" />
              <span className="truncate w-full text-center text-[10px]">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {agentMessages.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <Bot size={48} className="mx-auto mb-3 opacity-30 anim-float" />
            <p className="text-sm">{t('typeMessage', language)}</p>
          </div>
        )}
        {agentMessages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`rounded-xl p-3 anim-fade-in ${
              msg.role === 'user' ? 'message-user' :
              msg.role === 'tool' ? 'message-tool' :
              'message-assistant'
            }`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.role === 'user' && <User size={14} className="text-blue-400" />}
              {msg.role === 'assistant' && <Bot size={14} className="text-emerald-400" />}
              {msg.role === 'tool' && <Wrench size={14} className="text-purple-400" />}
              <span className="text-xs font-medium opacity-60">
                {msg.role === 'user' ? 'Vous' : msg.role === 'assistant' ? 'Agent' : msg.toolName}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

            {msg.toolResult && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    const newSet = new Set(expandedTools);
                    if (newSet.has(msg.id)) newSet.delete(msg.id);
                    else newSet.add(msg.id);
                    setExpandedTools(newSet);
                  }}
                  className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-all"
                >
                  <ChevronDown size={12} className={`transition-transform ${expandedTools.has(msg.id) ? 'rotate-180' : ''}`} />
                  {t('toolResult', language)}
                </button>
                {expandedTools.has(msg.id) && (
                  <pre className="mt-1 text-xs p-2 rounded-lg bg-black/20 overflow-x-auto anim-slide-down">
                    {msg.toolResult}
                  </pre>
                )}
              </div>
            )}

            {msg.role === 'assistant' && msg.content && (
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 opacity-50 hover:opacity-100 transition-all hover-glow"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => applyToEditor(msg.content)}
                  className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 opacity-50 hover:opacity-100 transition-all hover-glow"
                  title={t('applyToEditor', language)}
                >
                  <PenTool size={12} />
                  <span>{t('applyToEditor', language)}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message-assistant rounded-xl p-3 anim-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 anim-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm opacity-60">{t('thinking', language)}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('typeMessage', language)}
            className="glass-input flex-1 px-4 py-2.5 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="glass-button glass-button-primary p-2.5 disabled:opacity-30 hover-glow anim-scale-hover"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
