import { Copy, Sigma } from 'lucide-react';
import type { SimplificationResultType } from '../types';
import { copyToClipboard } from '../utils/storage';
import { CollapsiblePanel } from './panels/CollapsiblePanel';

interface SimplificationResultProps {
  result?: SimplificationResultType;
  showSopPos: boolean;
  learningMode: boolean;
}

export function SimplificationResult({ result, showSopPos, learningMode }: SimplificationResultProps) {
  if (!result) {
    return (
      <CollapsiblePanel id="simplification" title="Simplification" description="SOP, POS, minterms, and maxterms" icon={<Sigma size={20} />}>
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Simplified result will appear after generation.
        </div>
      </CollapsiblePanel>
    );
  }

  return (
    <CollapsiblePanel id="simplification" title="Simplification" description="Boolean algebra result" icon={<Sigma size={20} />}>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <ResultCard title="Original" value={result.original} />
          <ResultCard title="Simplified SOP" value={result.simplifiedSop} highlight />
          <ResultCard title="Simplified POS" value={result.simplifiedPos} highlight />
          <ResultCard title="Minterm Notation" value={result.mintermNotation} />
          <ResultCard title="Maxterm Notation" value={result.maxtermNotation} />
          {showSopPos ? <ResultCard title="Canonical SOP" value={result.canonicalSop} wide /> : null}
          {showSopPos ? <ResultCard title="Canonical POS" value={result.canonicalPos} wide /> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="gate-tool-button" onClick={() => void copyToClipboard(result.simplifiedSop)}>
            <Copy size={16} /> Copy simplified SOP
          </button>
          <button type="button" className="gate-tool-button" onClick={() => void copyToClipboard(result.simplifiedPos)}>
            <Copy size={16} /> Copy simplified POS
          </button>
        </div>

        {learningMode ? (
          <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-950">
            <h3 className="mb-3 text-sm font-black text-slate-900 dark:text-white">Step-by-step explanation</h3>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {result.steps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </CollapsiblePanel>
  );
}

function ResultCard({ title, value, highlight = false, wide = false }: { title: string; value: string; highlight?: boolean; wide?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${wide ? 'md:col-span-2' : ''} ${highlight ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'}`}>
      <p className={`text-xs font-black uppercase tracking-[0.18em] ${highlight ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
      <p className="pretty-scrollbar mt-2 overflow-x-auto whitespace-nowrap text-base font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
