import { Moon, Monitor, Sun } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ThemeMode } from '../types';

const options: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
  { value: 'light', label: 'Light theme', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark theme', icon: <Moon size={16} /> },
  { value: 'system', label: 'System theme', icon: <Monitor size={16} /> }
];

export function ThemeToggle() {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  const currentIndex = options.findIndex((option) => option.value === theme);
  const next = options[(currentIndex + 1) % options.length];
  const current = options[currentIndex] ?? options[2];

  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: next.value })}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={`Current ${current.label}. Switch to ${next.label}`}
      title={`Theme: ${theme}`}
    >
      {current.icon}
      <span className="hidden sm:inline">{theme}</span>
    </button>
  );
}
