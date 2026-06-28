import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ExpressionInput } from './components/ExpressionInput';
import { GateButtonPanel } from './components/buttons/GateButtonPanel';
import { TruthTable } from './components/table/TruthTable';
import { SimplificationResult } from './components/SimplificationResult';
import { ExplanationPanel } from './components/ExplanationPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ExportImportTools } from './components/ExportImportTools';
import { generateTruthTable, truthTableToText } from './lib/truthTable';
import { useAppStore } from './store/useAppStore';
import type { SavedProject } from './types';
import { downloadFile } from './utils/storage';
import { formatOutput } from './components/table/TruthTable';

function App() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const [manualExpression, setManualExpression] = useState('A.B + C\'');
  const [notice, setNotice] = useState<string>('');

  const expression = useAppStore((store) => store.expression);
  const theme = useAppStore((store) => store.theme);
  const settings = useAppStore((store) => store.settings);
  const history = useAppStore((store) => store.history);
  const setExpression = useAppStore((store) => store.setExpression);
  const updateSettings = useAppStore((store) => store.updateSettings);
  const addToHistory = useAppStore((store) => store.addToHistory);
  const deleteHistoryItem = useAppStore((store) => store.deleteHistoryItem);
  const clearHistory = useAppStore((store) => store.clearHistory);
  const toggleFavorite = useAppStore((store) => store.toggleFavorite);
  const resetApp = useAppStore((store) => store.resetApp);
  const importProject = useAppStore((store) => store.importProject);

  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeExpression = settings.generateMode === 'auto' ? expression : manualExpression;
  const generated = useMemo(() => generateTruthTable(activeExpression, settings), [activeExpression, settings]);
  const table = generated.ok ? generated.table : undefined;
  const simplification = generated.ok ? generated.simplification : undefined;

  const handleGenerate = () => {
    setManualExpression(expression);
    addToHistory(expression);
    setNotice('Expression generated and saved to recent history.');
  };

  const insertAtCursor = (text: string, moveCursorBy = 0) => {
    const input = inputRef.current;
    if (!input) {
      setExpression(`${expression}${text}`);
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = `${expression.slice(0, start)}${text}${expression.slice(end)}`;
    const cursor = start + text.length + moveCursorBy;
    setExpression(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(Math.max(0, cursor), Math.max(0, cursor));
    });
  };

  const backspaceAtCursor = () => {
    const input = inputRef.current;
    if (!input) {
      setExpression(expression.slice(0, -1));
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start !== end) {
      const next = `${expression.slice(0, start)}${expression.slice(end)}`;
      setExpression(next);
      requestAnimationFrame(() => input.setSelectionRange(start, start));
      return;
    }
    if (start === 0) return;
    const next = `${expression.slice(0, start - 1)}${expression.slice(start)}`;
    setExpression(next);
    requestAnimationFrame(() => input.setSelectionRange(start - 1, start - 1));
  };

  const handleSave = () => {
    addToHistory(expression);
    setNotice('Expression saved to browser history.');
  };

  const handleExport = () => {
    if (table && simplification) {
      downloadFile('truthcraft-solution.txt', truthTableToText(table, simplification, (value) => formatOutput(value, settings.outputFormat)), 'text/plain');
      return;
    }
    const project: SavedProject = { expression, settings, history };
    downloadFile('truthcraft-project.json', JSON.stringify(project, null, 2), 'application/json');
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const project = JSON.parse(text) as SavedProject;
      if (!project || typeof project.expression !== 'string') throw new Error('Invalid project file.');
      importProject(project);
      setNotice('Project imported successfully.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Import failed.');
    }
  };

  const handleReset = () => {
    resetApp();
    setManualExpression('A.B + C\'');
    setNotice('Workspace reset.');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,transparent_36rem),linear-gradient(180deg,#f8fafc,white)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.24)_0,transparent_32rem),linear-gradient(180deg,#020617,#0f172a)] dark:text-slate-100">
      <Navbar onSave={handleSave} onExport={handleExport} onImportClick={() => importRef.current?.click()} onReset={handleReset} />
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => {
          void handleImportFile(event.target.files?.[0]);
          event.currentTarget.value = '';
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                <Sparkles size={14} /> Digital Logic Workspace
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Generate, simplify, and learn Boolean expressions.</h2>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                Build expressions with gate buttons, generate complete truth tables, convert to SOP/POS, and review the logic with collapsible learning panels.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
              <Metric label="Variables" value={table?.variables.length ?? 0} />
              <Metric label="Rows" value={table?.rows.length ?? 0} />
              <Metric label="Mode" value={settings.generateMode === 'auto' ? 'Auto' : 'Manual'} />
            </div>
          </div>
        </section>

        {notice ? (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 size={18} /> {notice}
          </div>
        ) : null}

        {!generated.ok ? (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle size={18} /> Fix the expression to generate a valid table.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <ExpressionInput
              value={expression}
              inputRef={inputRef}
              error={!generated.ok ? generated.error : undefined}
              suggestion={!generated.ok ? generated.suggestion : undefined}
              warning={generated.ok ? generated.warning : undefined}
              onChange={setExpression}
              onGenerate={handleGenerate}
              onExampleClick={(example) => {
                setExpression(example);
                setManualExpression(example);
                addToHistory(example);
              }}
            />
            <GateButtonPanel onInsert={insertAtCursor} onClear={() => setExpression('')} onBackspace={backspaceAtCursor} />
            <TruthTable table={table} outputFormat={settings.outputFormat} rowsPerPage={settings.rowsPerPage} showIntermediateColumns={settings.showIntermediateColumns} />
            <SimplificationResult result={simplification} showSopPos={settings.showSopPos} learningMode={settings.learningMode} />
          </div>
          <aside className="space-y-6 xl:col-span-4">
            <ExportImportTools table={table} simplification={simplification} expression={expression} settings={settings} history={history} onImport={importProject} />
            <SettingsPanel settings={settings} onChange={updateSettings} />
            <HistoryPanel history={history} onUse={(item) => { setExpression(item); setManualExpression(item); }} onDelete={deleteHistoryItem} onFavorite={toggleFavorite} onClear={clearHistory} />
            <ExplanationPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
      <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default App;
