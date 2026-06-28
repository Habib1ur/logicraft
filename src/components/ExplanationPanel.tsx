import { BookOpen, CheckCircle2 } from 'lucide-react';
import { CollapsiblePanel } from './panels/CollapsiblePanel';

const explanations = [
  { gate: 'AND', formula: 'A.B', text: 'Output is 1 only when all inputs are 1.' },
  { gate: 'OR', formula: 'A + B', text: 'Output is 1 when at least one input is 1.' },
  { gate: 'NOT', formula: "A' or !A", text: 'Inverts the input value.' },
  { gate: 'NAND', formula: '(A.B)\'', text: 'Inverse of AND. Output is 0 only when all inputs are 1.' },
  { gate: 'NOR', formula: '(A+B)\'', text: 'Inverse of OR. Output is 1 only when all inputs are 0.' },
  { gate: 'XOR', formula: 'A XOR B', text: 'Output is 1 when inputs are different.' },
  { gate: 'XNOR', formula: 'A XNOR B', text: 'Output is 1 when inputs are the same.' },
];

export function ExplanationPanel() {
  return (
    <CollapsiblePanel id="explanation" title="Gate Explanation" description="Quick digital logic reference" icon={<BookOpen size={20} />}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {explanations.map((item) => (
          <article key={item.gate} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{item.gate}</h3>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">{item.formula}</span>
            </div>
            <p className="mt-3 flex gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} />
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
