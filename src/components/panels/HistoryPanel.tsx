import { Clock, Star, Trash2 } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { useAppStore } from '../../store/useAppStore';

export function HistoryPanel() {
  const history = useAppStore((state) => state.history);
  const loadExpression = useAppStore((state) => state.loadExpression);
  const deleteHistoryItem = useAppStore((state) => state.deleteHistoryItem);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const sorted = [...history].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt));

  return (
    <CollapsiblePanel id="history" title="History & Saved Expressions" subtitle="Reuse, favorite, or delete saved expressions." icon={<Clock size={20} />}>
      {sorted.length ? (
        <div className="space-y-2">
          {sorted.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <button
                type="button"
                onClick={() => loadExpression(item.expression)}
                className="min-w-0 flex-1 text-left font-mono text-sm font-bold text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                aria-label={`Load expression ${item.expression}`}
              >
                <span className="block truncate">{item.expression}</span>
                <span className="mt-1 block font-sans text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                className={`rounded-xl p-2 ${item.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                aria-label={item.favorite ? 'Remove favorite' : 'Mark favorite'}
              >
                <Star size={17} fill={item.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => deleteHistoryItem(item.id)}
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                aria-label="Delete history item"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No saved expressions yet. Use Save in the top bar.
        </div>
      )}
    </CollapsiblePanel>
  );
}
