import { Settings } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { useAppStore } from '../../store/useAppStore';

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-indigo-600" />
    </label>
  );
}

export function SettingsPanel() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setVariableOrderFromText = useAppStore((state) => state.setVariableOrderFromText);

  return (
    <CollapsiblePanel id="settings" title="Settings" subtitle="Control output format, variable order, and table behavior." icon={<Settings size={20} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="variable-order">
            Variable order
          </label>
          <input
            id="variable-order"
            value={settings.variableOrder.join('')}
            onChange={(event) => setVariableOrderFromText(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950"
            placeholder="ABCDEF"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Example: ABCDEF. Missing detected variables are appended automatically.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="output-format">
            Output format
          </label>
          <select
            id="output-format"
            value={settings.outputFormat}
            onChange={(event) => updateSettings({ outputFormat: event.target.value as 'binary' | 'boolean' })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950"
          >
            <option value="binary">0 / 1</option>
            <option value="boolean">True / False</option>
          </select>
        </div>

        <Toggle checked={settings.showIntermediate} label="Show intermediate expression columns" onChange={(value) => updateSettings({ showIntermediate: value })} />
        <Toggle checked={settings.autoGenerate} label="Auto-generate while typing" onChange={(value) => updateSettings({ autoGenerate: value })} />
        <Toggle checked={settings.showSopPos} label="Show canonical SOP/POS" onChange={(value) => updateSettings({ showSopPos: value })} />
        <Toggle checked={settings.learningMode} label="Educational learning mode" onChange={(value) => updateSettings({ learningMode: value })} />

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="rows-per-page">
            Rows per table page
          </label>
          <input
            id="rows-per-page"
            type="number"
            min={8}
            max={128}
            value={settings.maxRowsPerPage}
            onChange={(event) => updateSettings({ maxRowsPerPage: Math.max(8, Math.min(128, Number(event.target.value) || 32)) })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950"
          />
        </div>
      </div>
    </CollapsiblePanel>
  );
}
