import React from 'react';
import { useApp } from '../contexts';
import { Theme } from '../types';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-2 text-sm px-3 py-2 hover-glow ripple"
      >
        {theme === 'light' && <Sun size={16} className="text-yellow-400 anim-float" />}
        {theme === 'dark' && <Moon size={16} className="text-blue-300 anim-float" />}
        {theme === 'auto' && <Monitor size={16} className="text-emerald-400 anim-float" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop avec blur */}
          <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 glass p-2 z-50 min-w-[160px] anim-scale-in shadow-2xl">
            {themes.map((t, index) => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all anim-slide-in-left hover-lift ${
                  theme === t.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-emerald-400 font-semibold'
                    : 'hover:bg-white/10'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <t.icon size={18} className="anim-scale-hover" />
                <span className="flex-1 text-left">{t.label}</span>
                {theme === t.value && <Check size={16} className="text-emerald-400 anim-pop" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
