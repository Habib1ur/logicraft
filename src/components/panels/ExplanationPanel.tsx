import { Info } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';

const gates = [
  { name: 'AND', symbol: 'A.B', description: 'Output is 1 only when all inputs are 1.' },
  { name: 'OR', symbol: 'A + B', description: 'Output is 1 when at least one input is 1.' },
  { name: 'NOT', symbol: "A' or !A", description: 'Inverts the input.' },
  { name: 'NAND', symbol: 'A NAND B', description: 'Inverse of AND. Output is 0 only when all inputs are 1.' },
  { name: 'NOR', symbol: 'A NOR B', description: 'Inverse of OR. Output is 1 only when all inputs are 0.' },
  { name: 'XOR', symbol: 'A XOR B', description: 'Output is 1 when inputs are different.' },
  { name: 'XNOR', symbol: 'A XNOR B', description: 'Output is 1 when inputs are the same.' }
];

export function ExplanationPanel() {
  return (
    <CollapsiblePanel id="explanation" title="Gate Explanation" subtitle="Quick digital logic reference." icon={<Info size={20} />}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {gates.map((gate) => (
          <article key={gate.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-950 dark:text-white">{gate.name}</h3>
              <code className="rounded-xl bg-white px-2 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-slate-900 dark:text-indigo-200">{gate.symbol}</code>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{gate.description}</p>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
