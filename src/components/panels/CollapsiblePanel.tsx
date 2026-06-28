import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface CollapsiblePanelProps {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CollapsiblePanel({ id, title, description, icon, actions, children, className = '' }: CollapsiblePanelProps) {
  const state = useAppStore((store) => store.panelStates[id]);
  const setPanelState = useAppStore((store) => store.setPanelState);
  const panel = state ?? { collapsed: false, hidden: false, minimized: false };

  if (panel.hidden) {
    return (
      <button
        type="button"
        className="focus-ring rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-300"
        onClick={() => setPanelState(id, { hidden: false })}
      >
        Show {title}
      </button>
    );
  }

  return (
    <section className={`card overflow-hidden ${className}`} aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-800/80 sm:px-5">
        <button
          type="button"
          className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
          onClick={() => setPanelState(id, { collapsed: !panel.collapsed })}
          aria-expanded={!panel.collapsed}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="panel-title block truncate">{title}</span>
            {description ? <span className="muted-text block truncate">{description}</span> : null}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            className="focus-ring rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => setPanelState(id, { minimized: !panel.minimized, collapsed: false })}
            aria-label={panel.minimized ? `Expand ${title}` : `Minimize ${title}`}
          >
            {panel.minimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            type="button"
            className="focus-ring rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => setPanelState(id, { collapsed: !panel.collapsed })}
            aria-label={panel.collapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            {panel.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            type="button"
            className="focus-ring rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => setPanelState(id, { hidden: true })}
            aria-label={`Hide ${title}`}
          >
            <EyeOff size={18} />
          </button>
        </div>
      </div>
      {!panel.collapsed && !panel.minimized ? <div className="p-4 sm:p-5">{children}</div> : null}
    </section>
  );
}
