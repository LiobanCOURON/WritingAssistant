import React from 'react';
import { useApp } from '../contexts';
import { Theme } from '../types';
import { t } from '../i18n';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
  const { language, theme, setTheme } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={16} />, label: t('light', language) },
    { value: 'dark', icon: <Moon size={16} />, label: t('dark', language) },
    { value: 'auto', icon: <Monitor size={16} />, label: t('auto', language) },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-2 text-sm px-3 py-2"
      >
        {theme === 'light' && <Sun size={16} />}
        {theme === 'dark' && <Moon size={16} />}
        {theme === 'auto' && <Monitor size={16} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 glass-subtle p-2 z-50 min-w-[140px]">
            {themes.map(th => (
              <button
                key={th.value}
                onClick={() => { setTheme(th.value); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  theme === th.value
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-white/10'
                }`}
              >
                {th.icon}
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
