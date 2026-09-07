import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { agentChat, executeTool, ToolCall } from '../services';
import { AgentMessage } from '../types';
import {
  Send, Bot, User, Wrench, Trash2, X,
  BookOpen, PenTool, RefreshCw, CheckCircle, Search, BarChart3,
  ChevronDown, Copy, Wand2, Languages, Lightbulb
} from 'lucide-react';

export function AgentPanel() {
  const {
    language, agentMessages, activeChapter, activeProject, activeFolder, apiConfig,
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
        content: '⚠️ Veuillez configurer l\'endpoint Agent dans les paramètres (roue dentée en haut à droite).',
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
      // Get RAG context
      const ragContext = getRAGContext(input);
      const projectContext = activeChapter
        ? `Document actuel: "${activeChapter.title}" (dans le dossier "${activeFolder?.name}")\nContenu:\n${activeChapter.content.substring(0, 2000)}`
        : '';

      const allMessages = [...agentMessages, userMsg];

      // Get all chapters content for tools
      const allChapters = activeProject?.folders.flatMap(f =>
        f.chapters.map(c => ({ title: `${f.name}/${c.title}`, content: c.content }))
      ) || [];

      const response = await agentChat(apiConfig, allMessages, ragContext, projectContext);

      // Handle tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const toolMsg: AgentMessage = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: `${t('usingTool', language)}: ${toolCall.name}`,
            toolName: toolCall.name,
            toolResult: JSON.stringify(toolCall.arguments),
            timestamp: new Date().toISOString(),
          };
          addAgentMessage(toolMsg);

          const result = executeTool(toolCall, allChapters);
          const resultMsg: AgentMessage = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: result,
            toolName: `${toolCall.name}_result`,
            timestamp: new Date().toISOString(),
          };
          addAgentMessage(resultMsg);
        }

        // Get final response with tool results
        const finalResponse = await agentChat(
          apiConfig,
          [...allMessages],
          ragContext,
          projectContext
        );

        addAgentMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: finalResponse.content,
          timestamp: new Date().toISOString(),
        });
      } else {
        addAgentMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
        });
      }
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
    { icon: BookOpen, label: t('summarize', language), action: 'Résume le document actuel de manière concise.' },
    { icon: PenTool, label: t('expand', language), action: 'Développe et enrichis le document actuel avec plus de détails.' },
    { icon: RefreshCw, label: t('rewrite', language), action: 'Réécris le document actuel dans un style plus littéraire et élégant.' },
    { icon: CheckCircle, label: t('correct', language), action: 'Corrige les fautes de grammaire et d\'orthographe du document actuel.' },
    { icon: Search, label: t('searchContext', language), action: 'Recherche les informations clés dans tous les documents du projet.' },
    { icon: BarChart3, label: t('analyze', language), action: 'Analyse la structure, le style et les thèmes du document actuel.' },
    { icon: Wand2, label: t('agentTools', language), action: 'Génère un plan structuré pour la suite du document.' },
    { icon: Languages, label: t('translate', language), action: 'Traduis le document actuel en anglais.' },
    { icon: Lightbulb, label: 'Style', action: 'Améliore le style d\'écriture : vocabulaire, fluidité et rythme.' },
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applyToEditor = (text: string) => {
    if (activeChapter && activeProject && activeFolder) {
      updateChapterContent(activeProject.id, activeFolder.id, activeChapter.id, activeChapter.content + '\n\n' + text);
    }
  };

  if (!agentOpen) return null;

  return (
    <div className="glass h-full w-96 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-emerald-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            {t('agent', language)}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearAgentMessages}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
            title={t('clearChat', language)}
          >
            <Trash2 size={16} />
          </button>
          <button onClick={() => setAgentOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10">
        <div className="grid grid-cols-3 gap-1.5">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(qa.action)}
              className="glass-subtle p-2 flex flex-col items-center gap-1 text-xs hover:bg-white/10 transition-all"
              title={qa.action}
            >
              <qa.icon size={14} className="text-blue-400" />
              <span className="truncate w-full text-center">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {agentMessages.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <Bot size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('typeMessage', language)}</p>
            <p className="text-xs mt-2 opacity-50">Utilisez /commande dans l'éditeur pour des actions rapides</p>
          </div>
        )}
        {agentMessages.map(msg => (
          <div
            key={msg.id}
            className={`rounded-xl p-3 ${
              msg.role === 'user' ? 'message-user' :
              msg.role === 'tool' ? 'message-tool' :
              'message-assistant'
            }`}
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
                  className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
                >
                  <ChevronDown size={12} className={`transition-transform ${expandedTools.has(msg.id) ? 'rotate-180' : ''}`} />
                  {t('toolResult', language)}
                </button>
                {expandedTools.has(msg.id) && (
                  <pre className="mt-1 text-xs p-2 rounded-lg bg-black/20 overflow-x-auto">
                    {msg.toolResult}
                  </pre>
                )}
              </div>
            )}

            {msg.role === 'assistant' && msg.content && (
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 opacity-50 hover:opacity-100"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => applyToEditor(msg.content)}
                  className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 opacity-50 hover:opacity-100"
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
          <div className="message-assistant rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
            className="glass-button glass-button-primary p-2.5 disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
