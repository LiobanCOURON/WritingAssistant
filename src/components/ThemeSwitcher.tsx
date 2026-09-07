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
          {/* Backdrop transparent pour capturer les clics extérieurs */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown avec effet liquid glass */}
          <div 
            className="absolute right-0 top-full mt-2 z-[100] min-w-[160px] anim-scale-in rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Couche de flou en arrière-plan */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            />
            {/* Contenu */}
            <div 
              className="relative p-2 border border-white/20 rounded-xl"
              style={{ color: '#f1f5f9' }}
            >
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
          </div>
        </>
      )}
    </div>
  );
}
