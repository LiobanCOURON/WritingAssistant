import React, { useState } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { fetchModels } from '../services';
import { Settings as SettingsIcon, X, Key, Globe, Server, Cpu, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function SettingsModal() {
  const {
    language, apiConfig, updateAPIConfig, settingsOpen, setSettingsOpen,
  } = useApp();

  const [inlineEndpoint, setInlineEndpoint] = useState(apiConfig.inlineEndpoint);
  const [inlineApiKey, setInlineApiKey] = useState(apiConfig.inlineApiKey);
  const [inlineModel, setInlineModel] = useState(apiConfig.inlineModel);
  const [agentEndpoint, setAgentEndpoint] = useState(apiConfig.agentEndpoint);
  const [agentApiKey, setAgentApiKey] = useState(apiConfig.agentApiKey);
  const [agentModel, setAgentModel] = useState(apiConfig.agentModel);
  const [availableModels, setAvailableModels] = useState<string[]>(apiConfig.availableModels || []);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelStatus, setModelStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'inline' | 'agent'>('inline');

  if (!settingsOpen) return null;

  const handleFetchModels = async () => {
    const endpoint = activeTab === 'inline' ? inlineEndpoint : agentEndpoint;
    const key = activeTab === 'inline' ? inlineApiKey : agentApiKey;

    if (!endpoint || !key) return;

    setLoadingModels(true);
    setModelStatus('idle');
    try {
      const models = await fetchModels(endpoint, key);
      if (models.length > 0) {
        setAvailableModels(models);
        updateAPIConfig({ availableModels: models });
        setModelStatus('success');
      } else {
        setModelStatus('error');
      }
    } catch {
      setModelStatus('error');
    }
    setLoadingModels(false);
  };

  const handleSave = () => {
    updateAPIConfig({
      inlineEndpoint,
      inlineApiKey,
      inlineModel,
      agentEndpoint,
      agentApiKey,
      agentModel,
      availableModels,
    });
    setSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
      <div className="glass w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon size={22} className="text-emerald-400" />
            <h2 className="text-xl font-bold">{t('settings', language)}</h2>
          </div>
          <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('inline')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'inline'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Server size={16} />
              {t('inlineEndpoint', language)}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'agent'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Cpu size={16} />
              {t('agentEndpoint', language)}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* BYOK Info */}
          <div className="glass-subtle p-4 flex items-start gap-3">
            <Key size={18} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">BYOK - Bring Your Own Key</p>
              <p className="text-xs opacity-60 mt-1">
                {activeTab === 'inline'
                  ? 'Configurez l\'endpoint et la clé API pour les suggestions inline (complétion de texte en temps réel).'
                  : 'Configurez l\'endpoint et la clé API pour l\'agent IA (conversation, outils, RAG).'}
              </p>
            </div>
          </div>

          {/* Endpoint */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Globe size={14} className="text-blue-400" />
              {activeTab === 'inline' ? t('inlineEndpoint', language) : t('agentEndpoint', language)}
            </label>
            <input
              type="url"
              value={activeTab === 'inline' ? inlineEndpoint : agentEndpoint}
              onChange={e => activeTab === 'inline' ? setInlineEndpoint(e.target.value) : setAgentEndpoint(e.target.value)}
              placeholder={t('endpointPlaceholder', language)}
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Key size={14} className="text-emerald-400" />
              {t('apiKey', language)}
            </label>
            <input
              type="password"
              value={activeTab === 'inline' ? inlineApiKey : agentApiKey}
              onChange={e => activeTab === 'inline' ? setInlineApiKey(e.target.value) : setAgentApiKey(e.target.value)}
              placeholder={t('apiKeyPlaceholder', language)}
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          {/* Fetch Models */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleFetchModels}
                disabled={loadingModels}
                className="glass-button flex items-center gap-2 text-sm"
              >
                {loadingModels ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                {t('fetchModels', language)}
              </button>
              {modelStatus === 'success' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={12} />
                  {availableModels.length} {t('modelsLoaded', language)}
                </span>
              )}
              {modelStatus === 'error' && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {t('noModels', language)}
                </span>
              )}
            </div>
          </div>

          {/* Model Select */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Cpu size={14} className="text-purple-400" />
              {t('model', language)}
            </label>
            <select
              value={activeTab === 'inline' ? inlineModel : agentModel}
              onChange={e => activeTab === 'inline' ? setInlineModel(e.target.value) : setAgentModel(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm appearance-none cursor-pointer"
            >
              <option value="">{t('selectModel', language)}</option>
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-gray-900">{m}</option>
              ))}
            </select>
            {availableModels.length === 0 && (
              <p className="text-xs opacity-40 mt-1">
                Cliquez sur "{t('fetchModels', language)}" pour charger les modèles disponibles.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
          <button onClick={() => setSettingsOpen(false)} className="glass-button text-sm">
            {t('cancel', language)}
          </button>
          <button onClick={handleSave} className="glass-button glass-button-primary text-sm">
            {t('save', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
