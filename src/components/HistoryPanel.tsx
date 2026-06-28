import { History, Star, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../types';
import { formatDateTime } from '../utils/storage';
import { CollapsiblePanel } from './panels/CollapsiblePanel';

interface HistoryPanelProps {
  history: HistoryItem[];
  onUse: (expression: string) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onUse, onDelete, onFavorite, onClear }: HistoryPanelProps) {
  const favorites = history.filter((item) => item.favorite);
  const recent = history.filter((item) => !item.favorite);

  return (
    <CollapsiblePanel id="history" title="History & Saved Expressions" description={`${history.length} saved in browser`} icon={<History size={20} />} actions={history.length ? <button type="button" className="focus-ring rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40" onClick={onClear}>Clear</button> : null}>
      <div className="space-y-5">
        <HistoryGroup title="Favorites" items={favorites} empty="Star expressions to keep them here." onUse={onUse} onDelete={onDelete} onFavorite={onFavorite} />
        <HistoryGroup title="Recent" items={recent} empty="Generated expressions will appear here." onUse={onUse} onDelete={onDelete} onFavorite={onFavorite} />
      </div>
    </CollapsiblePanel>
  );
}

function HistoryGroup({ title, items, empty, onUse, onDelete, onFavorite }: { title: string; items: HistoryItem[]; empty: string; onUse: (expression: string) => void; onDelete: (id: string) => void; onFavorite: (id: string) => void }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</h3>
      {items.length === 0 ? <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">{empty}</p> : null}
      <div className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <button type="button" className="focus-ring block w-full rounded-xl text-left" onClick={() => onUse(item.expression)}>
              <p className="font-black text-slate-900 dark:text-white">{item.expression}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.createdAt)}</p>
            </button>
            <div className="mt-3 flex gap-2">
              <button type="button" className="focus-ring inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40" onClick={() => onFavorite(item.id)}>
                <Star size={14} fill={item.favorite ? 'currentColor' : 'none'} /> {item.favorite ? 'Saved' : 'Favorite'}
              </button>
              <button type="button" className="focus-ring inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40" onClick={() => onDelete(item.id)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
