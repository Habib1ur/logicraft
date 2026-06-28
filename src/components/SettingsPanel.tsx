import { Settings } from 'lucide-react';
import type { AppSettings, GenerateMode, OutputFormat } from '../types';
import { CollapsiblePanel } from './panels/CollapsiblePanel';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: Partial<AppSettings>) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <CollapsiblePanel id="settings" title="Settings" description="Customize output and performance" icon={<Settings size={20} />}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <SelectField
          label="Output format"
          value={settings.outputFormat}
          options={[{ value: 'binary', label: '0 / 1' }, { value: 'boolean', label: 'True / False' }]}
          onChange={(value) => onChange({ outputFormat: value as OutputFormat })}
        />
        <SelectField
          label="Generate mode"
          value={settings.generateMode}
          options={[{ value: 'auto', label: 'Auto while typing' }, { value: 'manual', label: 'Manual button' }]}
          onChange={(value) => onChange({ generateMode: value as GenerateMode })}
        />
        <NumberField label="Rows per page" value={settings.rowsPerPage} min={8} max={128} step={8} onChange={(value) => onChange({ rowsPerPage: value })} />
        <NumberField label="Max variables" value={settings.maxVariables} min={1} max={8} step={1} onChange={(value) => onChange({ maxVariables: value })} />
        <ToggleField label="Show intermediate columns" checked={settings.showIntermediateColumns} onChange={(checked) => onChange({ showIntermediateColumns: checked })} />
        <ToggleField label="Show canonical SOP/POS" checked={settings.showSopPos} onChange={(checked) => onChange({ showSopPos: checked })} />
        <ToggleField label="Educational mode" checked={settings.learningMode} onChange={(checked) => onChange({ learningMode: checked })} />
        <label className="md:col-span-2 xl:col-span-1 2xl:col-span-2">
          <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Variable order</span>
          <input
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            value={settings.variableOrder.join(',')}
            onChange={(event) => onChange({ variableOrder: event.target.value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean) })}
            placeholder="A,B,C,D,E,F"
          />
        </label>
      </div>
    </CollapsiblePanel>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <select className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function NumberField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <input className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <input className="h-5 w-5 accent-indigo-600" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
