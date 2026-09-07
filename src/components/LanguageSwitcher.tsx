import React from 'react';
import { useApp } from '../contexts';
import { Language } from '../types';
import { Globe } from 'lucide-react';

const languageNames: Record<Language, string> = {
  fr: 'Français',
  es: 'Español',
  zh: '中文',
  de: 'Deutsch',
  ja: '日本語',
};

const languageFlags: Record<Language, string> = {
  fr: '🇫🇷',
  es: '🇪🇸',
  zh: '🇨🇳',
  de: '🇩🇪',
  ja: '🇯🇵',
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-2 text-sm px-3 py-2 hover-glow anim-scale-hover"
      >
        <Globe size={16} />
        <span>{languageFlags[language]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop with blur - positioned to cover area behind dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              background: 'rgba(0,0,0,0.1)',
            }}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] anim-slide-down">
            <div className="glass p-2 space-y-1">
              {(Object.keys(languageNames) as Language[]).map((lang, i) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all anim-scale-hover hover-glow ${
                    language === lang
                      ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'hover:bg-white/10'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-lg">{languageFlags[lang]}</span>
                  <span className="font-medium">{languageNames[lang]}</span>
                  {language === lang && (
                    <span className="ml-auto text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
