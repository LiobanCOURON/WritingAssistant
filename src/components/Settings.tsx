import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { fetchModels } from '../services';
import { AnimationLevel } from '../types';
import {
  X, Key, Globe, Cpu, Zap, Check, Loader2,
  Sparkles, Monitor, Sun, Moon, Palette
} from 'lucide-react';

export function SettingsModal() {
  const {
    language, apiConfig, theme, animationLevel, settingsOpen,
    setSettingsOpen, setApiConfig, setTheme, setAnimationLevel,
  } = useApp();

  const [inlineEndpoint, setInlineEndpoint] = useState(apiConfig.inlineEndpoint);
  const [inlineApiKey, setInlineApiKey] = useState(apiConfig.inlineApiKey);
  const [inlineModel, setInlineModel] = useState(apiConfig.inlineModel);
  const [agentEndpoint, setAgentEndpoint] = useState(apiConfig.agentEndpoint);
  const [agentApiKey, setAgentApiKey] = useState(apiConfig.agentApiKey);
  const [agentModel, setAgentModel] = useState(apiConfig.agentModel);
  const [inlineModels, setInlineModels] = useState<string[]>(apiConfig.availableModels);
  const [agentModels, setAgentModels] = useState<string[]>([]);
  const [loadingInlineModels, setLoadingInlineModels] = useState(false);
  const [loadingAgentModels, setLoadingAgentModels] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsOpen) {
      setInlineEndpoint(apiConfig.inlineEndpoint);
      setInlineApiKey(apiConfig.inlineApiKey);
      setInlineModel(apiConfig.inlineModel);
      setAgentEndpoint(apiConfig.agentEndpoint);
      setAgentApiKey(apiConfig.agentApiKey);
      setAgentModel(apiConfig.agentModel);
    }
  }, [settingsOpen, apiConfig]);

  const handleFetchInlineModels = async () => {
    if (!inlineEndpoint || !inlineApiKey) return;
    setLoadingInlineModels(true);
    const models = await fetchModels(inlineEndpoint, inlineApiKey);
    setInlineModels(models);
    setLoadingInlineModels(false);
  };

  const handleFetchAgentModels = async () => {
    if (!agentEndpoint || !agentApiKey) return;
    setLoadingAgentModels(true);
    const models = await fetchModels(agentEndpoint, agentApiKey);
    setAgentModels(models);
    setLoadingAgentModels(false);
  };

  const handleSave = () => {
    setApiConfig({
      inlineEndpoint,
      inlineApiKey,
      inlineModel,
      agentEndpoint,
      agentApiKey,
      agentModel,
      availableModels: [...new Set([...inlineModels, ...agentModels])],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with liquid glass */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Modal */}
      <div className="glass relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            {t('settings', language)}
          </h2>
          <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* API Configuration */}
        <div className="space-y-6">
          {/* Inline AI */}
          <div className="glass-subtle p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-blue-400" />
              <h3 className="font-semibold">{t('inlineEndpoint', language)} (Suggestions)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-60 mb-1 block">Endpoint</label>
                <input
                  type="text"
                  value={inlineEndpoint}
                  onChange={e => setInlineEndpoint(e.target.value)}
                  placeholder={t('endpointPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-60 mb-1 block">{t('apiKey', language)}</label>
                <input
                  type="password"
                  value={inlineApiKey}
                  onChange={e => setInlineApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFetchInlineModels}
                  disabled={loadingInlineModels || !inlineEndpoint}
                  className="glass-button text-xs flex items-center gap-2"
                >
                  {loadingInlineModels ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                  {t('fetchModels', language)}
                </button>
                <select
                  value={inlineModel}
                  onChange={e => setInlineModel(e.target.value)}
                  className="glass-input flex-1 px-3 py-2 text-sm"
                >
                  <option value="">{t('selectModel', language)}</option>
                  {inlineModels.map(m => (
                    <option key={m} value={m} className="bg-slate-800">{m}</option>
                  ))}
                </select>
              </div>
              {inlineModels.length > 0 && (
                <p className="text-xs text-emerald-400">{inlineModels.length} {t('modelsLoaded', language)}</p>
              )}
            </div>
          </div>

          {/* Agent AI */}
          <div className="glass-subtle p-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-emerald-400" />
              <h3 className="font-semibold">{t('agentEndpoint', language)} (Agent)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-60 mb-1 block">Endpoint</label>
                <input
                  type="text"
                  value={agentEndpoint}
                  onChange={e => setAgentEndpoint(e.target.value)}
                  placeholder={t('endpointPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-60 mb-1 block">{t('apiKey', language)}</label>
                <input
                  type="password"
                  value={agentApiKey}
                  onChange={e => setAgentApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFetchAgentModels}
                  disabled={loadingAgentModels || !agentEndpoint}
                  className="glass-button text-xs flex items-center gap-2"
                >
                  {loadingAgentModels ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                  {t('fetchModels', language)}
                </button>
                <select
                  value={agentModel}
                  onChange={e => setAgentModel(e.target.value)}
                  className="glass-input flex-1 px-3 py-2 text-sm"
                >
                  <option value="">{t('selectModel', language)}</option>
                  {agentModels.map(m => (
                    <option key={m} value={m} className="bg-slate-800">{m}</option>
                  ))}
                </select>
              </div>
              {agentModels.length > 0 && (
                <p className="text-xs text-emerald-400">{agentModels.length} {t('modelsLoaded', language)}</p>
              )}
            </div>
          </div>

          {/* Theme */}
          <div className="glass-subtle p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} className="text-purple-400" />
              <h3 className="font-semibold">{t('theme', language)}</h3>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'light' as const, icon: Sun, label: t('light', language) },
                { value: 'dark' as const, icon: Moon, label: t('dark', language) },
                { value: 'auto' as const, icon: Monitor, label: t('auto', language) },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`glass-button flex items-center gap-2 flex-1 justify-center ${
                    theme === opt.value ? 'ring-2 ring-emerald-400' : ''
                  }`}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Level */}
          <div className="glass-subtle p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-yellow-400" />
              <h3 className="font-semibold">Animations</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {([
                { value: 'none' as const, label: 'Aucune', emoji: '🚫' },
                { value: 'few' as const, label: 'Peu', emoji: '🔹' },
                { value: 'most' as const, label: 'Plus', emoji: '✨' },
                { value: 'all' as const, label: 'Tout', emoji: '🎆' },
                { value: 'custom' as const, label: 'Custom', emoji: '⚙️' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAnimationLevel(opt.value)}
                  className={`glass-button flex flex-col items-center gap-1 py-2 ${
                    animationLevel === opt.value ? 'ring-2 ring-emerald-400' : ''
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setSettingsOpen(false)} className="glass-button">
            {t('cancel', language)}
          </button>
          <button onClick={handleSave} className="glass-button glass-button-primary flex items-center gap-2">
            {saved ? <Check size={16} /> : null}
            {saved ? t('success', language) : t('save', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
