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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 glass-subtle p-2 z-50 min-w-[160px]">
            {(Object.keys(languageNames) as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  language === lang
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-white/10'
                }`}
              >
                <span>{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
