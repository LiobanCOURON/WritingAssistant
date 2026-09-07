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
        className="glass-button flex items-center gap-2 text-sm px-3 py-2"
      >
        <Globe size={16} />
        <span>{languageFlags[language]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop with liquid glass effect */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="p-1">
              {(Object.keys(languageNames) as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    language === lang
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{languageFlags[lang]}</span>
                  <span>{languageNames[lang]}</span>
                  {language === lang && <span className="ml-auto text-emerald-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
