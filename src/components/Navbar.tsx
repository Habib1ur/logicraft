import { BrainCircuit, Download, RotateCcw, Save, Upload } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onSave: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onReset: () => void;
}

export function Navbar({ onSave, onExport, onImportClick, onReset }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">TruthCraft</h1>
            <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">Truth tables, simplification, and digital logic learning</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="TruthCraft actions">
          <ThemeToggle />
          <button className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" type="button" onClick={onSave}>
            <Save size={16} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300" type="button" onClick={onExport}>
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300" type="button" onClick={onImportClick}>
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-200" type="button" onClick={onReset}>
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
