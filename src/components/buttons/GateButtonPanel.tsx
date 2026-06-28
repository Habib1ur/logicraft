import { Cpu, Delete, Parentheses, Trash2 } from 'lucide-react';
import { CollapsiblePanel } from '../panels/CollapsiblePanel';

interface GateButtonPanelProps {
  onInsert: (text: string, moveCursorBy?: number) => void;
  onClear: () => void;
  onBackspace: () => void;
}

interface GateButton {
  label: string;
  insert: string;
  hint: string;
  accent?: string;
  cursor?: number;
}

const variables: GateButton[] = ['A', 'B', 'C', 'D', 'E', 'F'].map((item) => ({ label: item, insert: item, hint: `Variable ${item}` }));
const constants: GateButton[] = [
  { label: '0', insert: '0', hint: 'Logic zero' },
  { label: '1', insert: '1', hint: 'Logic one' },
];
const basicGates: GateButton[] = [
  { label: 'AND', insert: ' . ', hint: 'A.B' },
  { label: 'OR', insert: ' + ', hint: 'A + B' },
  { label: 'NOT', insert: '!', hint: '!A' },
  { label: "A'", insert: "'", hint: 'Complement' },
];
const universalGates: GateButton[] = [
  { label: 'NAND', insert: ' NAND ', hint: 'Inverse AND' },
  { label: 'NOR', insert: ' NOR ', hint: 'Inverse OR' },
];
const specialGates: GateButton[] = [
  { label: 'XOR', insert: ' XOR ', hint: 'Different inputs' },
  { label: 'XNOR', insert: ' XNOR ', hint: 'Same inputs' },
  { label: '( )', insert: '()', hint: 'Parentheses', cursor: -1 },
];

export function GateButtonPanel({ onInsert, onClear, onBackspace }: GateButtonPanelProps) {
  return (
    <CollapsiblePanel id="gates" title="Gate Button Panel" description="Click buttons instead of typing symbols" icon={<Cpu size={20} />}>
      <div className="grid gap-5 xl:grid-cols-2">
        <ButtonGroup title="Variables" buttons={[...variables, ...constants]} onInsert={onInsert} />
        <ButtonGroup title="Basic Gates" buttons={basicGates} onInsert={onInsert} />
        <ButtonGroup title="Universal Gates" buttons={universalGates} onInsert={onInsert} />
        <ButtonGroup title="Special Gates" buttons={specialGates} onInsert={onInsert} />
        <div className="xl:col-span-2">
          <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Editing Tools</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button className="gate-tool-button" type="button" onClick={() => onInsert('(')} aria-label="Insert opening parenthesis">
              <Parentheses size={18} /> Open (
            </button>
            <button className="gate-tool-button" type="button" onClick={() => onInsert(')')} aria-label="Insert closing parenthesis">
              <Parentheses size={18} /> Close )
            </button>
            <button className="gate-tool-button" type="button" onClick={onBackspace} aria-label="Backspace">
              <Delete size={18} /> Backspace
            </button>
            <button className="gate-danger-button" type="button" onClick={onClear} aria-label="Clear expression">
              <Trash2 size={18} /> Clear
            </button>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

function ButtonGroup({ title, buttons, onInsert }: { title: string; buttons: GateButton[]; onInsert: (text: string, moveCursorBy?: number) => void }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {buttons.map((button) => (
          <button
            key={`${title}-${button.label}`}
            type="button"
            className="focus-ring min-h-14 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-center shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
            onClick={() => onInsert(button.insert, button.cursor)}
            aria-label={`Insert ${button.label}`}
            title={button.hint}
          >
            <span className="block text-sm font-black text-slate-900 dark:text-white">{button.label}</span>
            <span className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">{button.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
