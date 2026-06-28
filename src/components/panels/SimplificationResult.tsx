import { Copy, FunctionSquare } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import type { SimplificationResult as Result } from '../../types';
import { copyToClipboard } from '../../utils/storage';

type Props = {
  result?: Result;
  showSopPos: boolean;
};

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mb-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="flex items-start justify-between gap-3">
        <code className="break-all font-mono text-sm font-bold text-slate-900 dark:text-slate-50">{value}</code>
        <button
          type="button"
          className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800"
          onClick={() => copyToClipboard(value)}
          aria-label={`Copy ${label}`}
        >
          <Copy size={15} />
        </button>
      </div>
    </div>
  );
}

export function SimplificationResult({ result, showSopPos }: Props) {
  return (
    <CollapsiblePanel id="simplification" title="Simplification" subtitle="SOP, POS, minterms, maxterms, and minimized forms." icon={<FunctionSquare size={20} />}>
      {result ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <ResultLine label="Simplified SOP" value={result.simplifiedSOP} />
            <ResultLine label="Simplified POS" value={result.simplifiedPOS} />
            <ResultLine label="Minterm Notation" value={result.mintermNotation} />
            <ResultLine label="Maxterm Notation" value={result.maxtermNotation} />
          </div>
          {showSopPos ? (
            <div className="grid gap-3 md:grid-cols-2">
              <ResultLine label="Canonical SOP" value={result.canonicalSOP} />
              <ResultLine label="Canonical POS" value={result.canonicalPOS} />
            </div>
          ) : null}
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/60">
            <h3 className="mb-2 text-sm font-black text-indigo-800 dark:text-indigo-200">Learning steps</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-indigo-900 dark:text-indigo-100">
              {result.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Simplified results will appear after a valid truth table is generated.
        </div>
      )}
    </CollapsiblePanel>
  );
}
