import { Eye, LayoutGrid } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExpressionPanel } from './components/panels/ExpressionPanel';
import { GateButtonPanel } from './components/panels/GateButtonPanel';
import { TruthTablePanel } from './components/panels/TruthTablePanel';
import { SimplificationResult } from './components/panels/SimplificationResult';
import { ExplanationPanel } from './components/panels/ExplanationPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { ExportImportTools } from './components/panels/ExportImportTools';
import { BooleanParseError } from './lib/booleanParser';
import { generateTruthTable } from './lib/truthTable';
import { simplifyTruthTable } from './lib/simplifier';
import { useAppStore } from './store/useAppStore';

function App() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const expression = useAppStore((state) => state.expression);
  const setExpression = useAppStore((state) => state.setExpression);
  const setCursorPosition = useAppStore((state) => state.setCursorPosition);
  const settings = useAppStore((state) => state.settings);
  const history = useAppStore((state) => state.history);
  const panelStates = useAppStore((state) => state.panelStates);
  const showPanel = useAppStore((state) => state.showPanel);
  const [generatedExpression, setGeneratedExpression] = useState(expression);

  const activeExpression = settings.autoGenerate ? expression : generatedExpression;

  const computed = useMemo(() => {
    try {
      const table = generateTruthTable(activeExpression, settings);
      const simplification = simplifyTruthTable(table, activeExpression);
      return { table, simplification, error: undefined, suggestion: undefined };
    } catch (error) {
      if (error instanceof BooleanParseError) {
        return { table: undefined, simplification: undefined, error: error.message, suggestion: error.suggestion };
      }
      return {
        table: undefined,
        simplification: undefined,
        error: 'Could not parse the expression.',
        suggestion: 'Check the expression syntax or use the gate buttons to insert operators.'
      };
    }
  }, [activeExpression, settings]);

  const insertAtCursor = (text: string) => {
    const element = inputRef.current;
    const start = element?.selectionStart ?? expression.length;
    const end = element?.selectionEnd ?? expression.length;
    const nextExpression = expression.slice(0, start) + text + expression.slice(end);
    const nextCursor = start + text.length;
    setExpression(nextExpression);
    setCursorPosition(nextCursor);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const projectJson = useMemo(
    () =>
      JSON.stringify(
        {
          app: 'TruthCraft',
          version: '1.0.0',
          expression,
          settings,
          history,
          panelStates,
          generatedAt: new Date().toISOString(),
          truthTable: computed.table,
          simplification: computed.simplification
        },
        null,
        2
      ),
    [expression, settings, history, panelStates, computed.table, computed.simplification]
  );

  const hiddenPanels = Object.entries(panelStates).filter(([, state]) => state.hidden);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar projectJson={projectJson} />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-5 shadow-soft dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-700 dark:border-indigo-800 dark:bg-slate-900/80 dark:text-indigo-200">
                <LayoutGrid size={14} /> Digital Logic Dashboard
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Build, solve, and learn truth tables faster.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Use keyboard input or tap gate buttons for AND, OR, NOT, NAND, NOR, XOR, XNOR, minterms, maxterms, SOP, POS, and simplified Boolean forms.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/70 bg-white/70 p-3 text-center dark:border-slate-800 dark:bg-slate-900/70">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{computed.table?.variables.length ?? 0}</div>
                <div className="text-xs font-semibold text-slate-500">Variables</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{computed.table?.rows.length ?? 0}</div>
                <div className="text-xs font-semibold text-slate-500">Rows</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{computed.table?.intermediateColumns.length ?? 0}</div>
                <div className="text-xs font-semibold text-slate-500">Steps</div>
              </div>
            </div>
          </div>
        </section>

        {hiddenPanels.length ? (
          <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="mr-1 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
              <Eye size={16} /> Hidden panels:
            </span>
            {hiddenPanels.map(([id]) => (
              <button key={id} type="button" onClick={() => showPanel(id)} className="small-btn capitalize">
                Show {id}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="space-y-5">
            <ExpressionPanel inputRef={inputRef} error={computed.error} suggestion={computed.suggestion} onGenerate={() => setGeneratedExpression(expression)} />
            <GateButtonPanel onInsert={insertAtCursor} />
            <TruthTablePanel table={computed.table} />
          </div>
          <aside className="space-y-5">
            <SimplificationResult result={computed.simplification} showSopPos={settings.showSopPos} />
            <SettingsPanel />
            <HistoryPanel />
            <ExplanationPanel />
            <ExportImportTools
              table={computed.table}
              simplification={computed.simplification}
              outputFormat={settings.outputFormat}
              showIntermediate={settings.showIntermediate}
              projectJson={projectJson}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
