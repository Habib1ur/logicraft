import { AlertTriangle, BookOpen, Calculator, Play } from 'lucide-react';
import { RefObject } from 'react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { useAppStore } from '../../store/useAppStore';

const examples = [
  'A + B',
  'A.B',
  "A' + B",
  'A.B + C',
  "(A + B).C'",
  'A XOR B',
  'A NAND B',
  'A NOR B',
  'F(A,B,C) = Σm(0,2,4,6)',
  'F(A,B,C) = ΠM(1,3,5,7)'
];

type Props = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  error?: string;
  suggestion?: string;
  onGenerate: () => void;
};

export function ExpressionPanel({ inputRef, error, suggestion, onGenerate }: Props) {
  const expression = useAppStore((state) => state.expression);
  const setExpression = useAppStore((state) => state.setExpression);
  const setCursorPosition = useAppStore((state) => state.setCursorPosition);
  const loadExpression = useAppStore((state) => state.loadExpression);
  const autoGenerate = useAppStore((state) => state.settings.autoGenerate);

  const updateCursor = () => {
    const position = inputRef.current?.selectionStart ?? expression.length;
    setCursorPosition(position);
  };

  return (
    <CollapsiblePanel id="expression" title="Expression Input" subtitle="Type expression, load examples, or use gate buttons." icon={<Calculator size={20} />}>
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="expression-input">
          Boolean expression
        </label>
        <textarea
          ref={inputRef}
          id="expression-input"
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value);
            setCursorPosition(event.target.selectionStart);
          }}
          onClick={updateCursor}
          onKeyUp={updateCursor}
          onSelect={updateCursor}
          rows={4}
          spellCheck={false}
          placeholder="Example: F = A.B + C' or F(A,B,C)=Σm(0,2,4,6)"
          className="w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-base text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
          aria-describedby={error ? 'expression-error' : undefined}
        />

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onGenerate} className="primary-btn" aria-label="Generate truth table">
            <Play size={17} /> Generate
          </button>
          <span className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {autoGenerate ? 'Auto-generate is ON' : 'Manual mode'}
          </span>
        </div>

        {error ? (
          <div id="expression-error" className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100" role="alert">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-none" />
              <div>
                <p className="font-bold">{error}</p>
                {suggestion ? <p className="mt-1 text-amber-800 dark:text-amber-200">{suggestion}</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <BookOpen size={16} /> Examples
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => loadExpression(example)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
