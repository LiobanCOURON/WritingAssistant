import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { AnimationLevel } from '../types';
import { fetchModels } from '../services';
import { soundManager } from '../utils/sounds';
import {
  X, Key, Server, Cpu, Sparkles, Check, Loader2,
  Sun, Moon, Monitor, Zap, Wand2, Palette
} from 'lucide-react';

export function SettingsModal() {
  const {
    language, settingsOpen, setSettingsOpen,
    apiConfig, updateAPIConfig,
    theme, setTheme,
    animationLevel, setAnimationLevel,
    customAnimations, setCustomAnimations,
  } = useApp();

  const [inlineEndpoint, setInlineEndpoint] = useState(apiConfig.inlineEndpoint);
  const [inlineApiKey, setInlineApiKey] = useState(apiConfig.inlineApiKey);
  const [inlineModel, setInlineModel] = useState(apiConfig.inlineModel);
  const [agentEndpoint, setAgentEndpoint] = useState(apiConfig.agentEndpoint);
  const [agentApiKey, setAgentApiKey] = useState(apiConfig.agentApiKey);
  const [agentModel, setAgentModel] = useState(apiConfig.agentModel);
  const [inlineModels, setInlineModels] = useState<string[]>(apiConfig.availableModels);
  const [agentModels, setAgentModels] = useState<string[]>([]);
  const [loadingInline, setLoadingInline] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(false);

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
    if (!inlineEndpoint) return;
    setLoadingInline(true);
    const models = await fetchModels(inlineEndpoint, inlineApiKey);
    setInlineModels(models);
    updateAPIConfig({ availableModels: models });
    setLoadingInline(false);
  };

  const handleFetchAgentModels = async () => {
    if (!agentEndpoint) return;
    setLoadingAgent(true);
    const models = await fetchModels(agentEndpoint, agentApiKey);
    setAgentModels(models);
    setLoadingAgent(false);
  };

  const handleSave = () => {
    updateAPIConfig({
      inlineEndpoint,
      inlineApiKey,
      inlineModel,
      agentEndpoint,
      agentApiKey,
      agentModel,
    });
    setSettingsOpen(false);
  };

  if (!settingsOpen) return null;

  const animationOptions: { value: AnimationLevel; label: string; icon: React.ReactNode }[] = [
    { value: 'none', label: t('none', language), icon: <Zap size={14} className="opacity-30" /> },
    { value: 'few', label: t('few', language), icon: <Zap size={14} className="opacity-60" /> },
    { value: 'more', label: t('more', language), icon: <Sparkles size={14} /> },
    { value: 'all', label: t('all', language), icon: <Wand2 size={14} className="text-emerald-400" /> },
    { value: 'chaos', label: t('chaos', language), icon: <span className="text-lg">🌪️</span> },
    { value: 'custom', label: t('custom', language), icon: <Palette size={14} className="text-purple-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setSettingsOpen(false)} />
      <div className="glass w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-40 anim-scale-in p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles size={24} className="text-emerald-400" />
            {t('settings', language)}
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all hover-glow"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <section className="glass-subtle p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 opacity-80">
              <Monitor size={16} />
              {t('theme', language)}
            </h3>
            <div className="flex gap-2">
              {([
                { value: 'light', label: t('light', language), icon: <Sun size={16} /> },
                { value: 'dark', label: t('dark', language), icon: <Moon size={16} /> },
                { value: 'auto', label: t('auto', language), icon: <Monitor size={16} /> },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    soundManager.pop();
                  }}
                  onMouseEnter={() => soundManager.hover()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover-glow anim-scale-hover ${
                    theme === opt.value
                      ? 'bg-gradient-to-r from-blue-500/30 to-emerald-500/30 border border-emerald-500/40'
                      : 'glass-button'
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm">{opt.label}</span>
                  {theme === opt.value && <Check size={14} className="text-emerald-400 anim-pop" />}
                </button>
              ))}
            </div>
          </section>

          {/* Animations */}
          <section className="glass-subtle p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 opacity-80">
              <Sparkles size={16} />
              {t('animations', language)}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {animationOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setAnimationLevel(opt.value);
                    soundManager.pop();
                  }}
                  onMouseEnter={() => soundManager.hover()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover-glow anim-scale-hover ${
                    animationLevel === opt.value
                      ? 'bg-gradient-to-r from-blue-500/30 to-emerald-500/30 border border-emerald-500/40'
                      : 'glass-button'
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
            
            {/* Sound toggle */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => soundManager.setEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm flex items-center gap-2">
                  🔊 Effets sonores
                </span>
              </label>
            </div>
            
            {/* Chaos Warning */}
            {animationLevel === 'chaos' && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 anim-scale-in">
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>Mode Chaos activé ! Préparez-vous pour une expérience visuelle extrême !</span>
                </p>
              </div>
            )}
            
            {/* Custom Animations */}
            {animationLevel === 'custom' && (
              <div className="mt-4 pt-4 border-t border-white/10 anim-scale-in">
                <h4 className="text-xs font-semibold mb-3 flex items-center gap-2 opacity-70">
                  <Palette size={14} />
                  Animations personnalisées
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'particles', label: 'Particules d\'arrière-plan', emoji: '✨' },
                    { key: 'hover', label: 'Effets de survol', emoji: '🎯' },
                    { key: 'transitions', label: 'Transitions', emoji: '🔄' },
                    { key: 'entrance', label: 'Animations d\'entrée', emoji: '🎬' },
                    { key: 'feedback', label: 'Feedback visuel', emoji: '💫' },
                    { key: 'micro', label: 'Micro-interactions', emoji: '⚡' },
                    { key: 'iconsBounce', label: 'Icônes animées (haut/bas)', emoji: '🎭' },
                  ].map((anim) => (
                    <label key={anim.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customAnimations[anim.key as keyof typeof customAnimations]}
                        onChange={(e) => {
                          setCustomAnimations({
                            ...customAnimations,
                            [anim.key]: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <span className="text-lg">{anim.emoji}</span>
                      <span className="text-sm">{anim.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Inline API */}
          <section className="glass-subtle p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 opacity-80">
              <Cpu size={16} />
              {t('inlineEndpoint', language)}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-50 mb-1 block">Endpoint</label>
                <input
                  type="text"
                  value={inlineEndpoint}
                  onChange={e => setInlineEndpoint(e.target.value)}
                  placeholder={t('endpointPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-50 mb-1 block">{t('apiKey', language)}</label>
                <input
                  type="password"
                  value={inlineApiKey}
                  onChange={e => setInlineApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs opacity-50">{t('model', language)}</label>
                  <button
                    onClick={handleFetchInlineModels}
                    disabled={loadingInline || !inlineEndpoint}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-md glass-button hover-glow anim-scale-hover"
                  >
                    {loadingInline ? <Loader2 size={12} className="animate-spin" /> : <Server size={12} />}
                    {t('fetchModels', language)}
                  </button>
                </div>
                <select
                  value={inlineModel}
                  onChange={e => setInlineModel(e.target.value)}
                  className="glass-select w-full px-3 py-2 text-sm"
                >
                  <option value="">{t('selectModel', language)}</option>
                  {inlineModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {inlineModels.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ {inlineModels.length} {t('modelsLoaded', language)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Agent API */}
          <section className="glass-subtle p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 opacity-80">
              <Sparkles size={16} />
              {t('agentEndpoint', language)}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-50 mb-1 block">Endpoint</label>
                <input
                  type="text"
                  value={agentEndpoint}
                  onChange={e => setAgentEndpoint(e.target.value)}
                  placeholder={t('endpointPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-50 mb-1 block">{t('apiKey', language)}</label>
                <input
                  type="password"
                  value={agentApiKey}
                  onChange={e => setAgentApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder', language)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs opacity-50">{t('model', language)}</label>
                  <button
                    onClick={handleFetchAgentModels}
                    disabled={loadingAgent || !agentEndpoint}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-md glass-button hover-glow anim-scale-hover"
                  >
                    {loadingAgent ? <Loader2 size={12} className="animate-spin" /> : <Server size={12} />}
                    {t('fetchModels', language)}
                  </button>
                </div>
                <select
                  value={agentModel}
                  onChange={e => setAgentModel(e.target.value)}
                  className="glass-select w-full px-3 py-2 text-sm"
                >
                  <option value="">{t('selectModel', language)}</option>
                  {agentModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {agentModels.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ {agentModels.length} {t('modelsLoaded', language)}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              handleSave();
              soundManager.success();
            }}
            onMouseEnter={() => soundManager.hover()}
            className="glass-button glass-button-primary flex-1 py-2.5 anim-scale-hover hover-glow"
          >
            {t('save', language)}
          </button>
          <button
            onClick={() => {
              setSettingsOpen(false);
              soundManager.click();
            }}
            onMouseEnter={() => soundManager.hover()}
            className="glass-button flex-1 py-2.5 anim-scale-hover hover-glow"
          >
            {t('cancel', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
