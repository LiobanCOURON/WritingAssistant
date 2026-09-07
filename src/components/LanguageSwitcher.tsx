import React from 'react';
import { useApp } from '../contexts';
import { Language } from '../types';
import { Globe, Check } from 'lucide-react';

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
        className="glass-button flex items-center gap-2 text-sm px-3 py-2 hover-glow ripple"
      >
        <Globe size={16} className="anim-float" />
        <span>{languageFlags[language]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop avec blur */}
          <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 glass p-2 z-50 min-w-[180px] anim-scale-in shadow-2xl">
            {(Object.keys(languageNames) as Language[]).map((lang, index) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all anim-slide-in-left hover-lift ${
                  language === lang
                    ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-emerald-400 font-semibold'
                    : 'hover:bg-white/10'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-xl anim-scale-hover">{languageFlags[lang]}</span>
                <span className="flex-1 text-left">{languageNames[lang]}</span>
                {language === lang && <Check size={16} className="text-emerald-400 anim-pop" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
