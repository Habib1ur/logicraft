import type { RefObject } from 'react';
import { AlertCircle, Play, Wand2 } from 'lucide-react';
import { CollapsiblePanel } from './panels/CollapsiblePanel';

interface ExpressionInputProps {
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  error?: string;
  suggestion?: string;
  warning?: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onExampleClick: (expression: string) => void;
}

const examples = ['A + B', 'A.B', "A' + B", 'A.B + C', "(A + B).C'", 'A XOR B', 'A NAND B', 'A NOR B', 'Σm(0,2,4,6)', 'ΠM(1,3,5,7)'];

export function ExpressionInput({ value, inputRef, error, suggestion, warning, onChange, onGenerate, onExampleClick }: ExpressionInputProps) {
  return (
    <CollapsiblePanel id="expression" title="Expression Panel" description="Type or build a Boolean expression" icon={<Wand2 size={20} />}>
      <div className="space-y-4">
        <label className="block" htmlFor="expression-input">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Boolean expression</span>
          <textarea
            ref={inputRef}
            id="expression-input"
            className="focus-ring min-h-28 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-semibold text-slate-950 shadow-inner transition placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            placeholder="Example: F = A.B + C' or Σm(0,2,4,6)"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            aria-describedby="expression-help"
          />
        </label>

        <div id="expression-help" className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
            Supports <strong className="text-slate-800 dark:text-slate-200">.</strong>, <strong className="text-slate-800 dark:text-slate-200">+</strong>, <strong className="text-slate-800 dark:text-slate-200">'</strong>, <strong className="text-slate-800 dark:text-slate-200">!</strong>, AND, OR, NOT, NAND, NOR, XOR, XNOR, and parentheses.
          </div>
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
            Minterm and maxterm notation is supported: <strong>Σm(0,2,4,6)</strong> and <strong>ΠM(1,3,5,7)</strong>.
          </div>
        </div>

        {error ? (
          <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-bold">{error}</p>
              {suggestion ? <p className="mt-1 text-sm">{suggestion}</p> : null}
            </div>
          </div>
        ) : null}

        {warning ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {warning}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="focus-ring rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
                onClick={() => onExampleClick(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            onClick={onGenerate}
          >
            <Play size={17} />
            Generate Table
          </button>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
