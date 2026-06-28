import { ChevronDown, ChevronUp, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function CollapsiblePanel({ id, title, subtitle, icon, children, actions, className = '' }: Props) {
  const panelState = useAppStore((state) => state.panelStates[id] ?? { collapsed: false, hidden: false, minimized: false });
  const togglePanel = useAppStore((state) => state.togglePanel);

  if (panelState.hidden) return null;

  const collapsed = panelState.collapsed || panelState.minimized;

  return (
    <section className={`rounded-3xl border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <button
          type="button"
          onClick={() => togglePanel(id, 'collapsed')}
          className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-950 dark:text-white sm:text-base">{title}</span>
            {subtitle ? <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</span> : null}
          </span>
        </button>
        <div className="flex items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={() => togglePanel(id, 'minimized')}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={`${panelState.minimized ? 'Restore' : 'Minimize'} ${title}`}
          >
            {panelState.minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => togglePanel(id, 'hidden')}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={`Hide ${title}`}
          >
            <EyeOff size={16} />
          </button>
          <button
            type="button"
            onClick={() => togglePanel(id, 'collapsed')}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </header>
      {!collapsed ? <div className="p-4 sm:p-5">{children}</div> : null}
    </section>
  );
}
