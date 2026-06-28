import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../types';
import { useAppStore } from '../store/useAppStore';

const themes: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
  const theme = useAppStore((store) => store.theme);
  const setTheme = useAppStore((store) => store.setTheme);
  const active = themes.find((item) => item.value === theme) ?? themes[2];
  const Icon = active.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300"
        aria-label="Change theme"
      >
        <Icon size={17} />
        <span className="hidden sm:inline">{active.label}</span>
      </button>
      <div className="invisible absolute right-0 z-40 mt-2 w-40 translate-y-1 rounded-2xl border border-slate-200 bg-white p-1 opacity-0 shadow-xl shadow-slate-200/70 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
        {themes.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              className={`focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                theme === item.value
                  ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              onClick={() => setTheme(item.value)}
            >
              <ItemIcon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
