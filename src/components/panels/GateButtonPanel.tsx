import { Keyboard } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { GateButton } from '../buttons/GateButton';
import { useAppStore } from '../../store/useAppStore';

const groups = [
  {
    title: 'Variables',
    buttons: ['A', 'B', 'C', 'D', 'E', 'F'].map((value) => ({ label: value, insert: value }))
  },
  {
    title: 'Basic Gates',
    buttons: [
      { label: 'AND', insert: '.', hint: 'Insert AND dot: .' },
      { label: 'OR', insert: ' + ', hint: 'Insert OR plus: +' },
      { label: 'NOT', insert: '!', hint: 'Insert prefix NOT: !A' },
      { label: "A'", insert: "'", hint: 'Insert complement mark after variable or group' }
    ]
  },
  {
    title: 'Universal Gates',
    buttons: [
      { label: 'NAND', insert: ' NAND ' },
      { label: 'NOR', insert: ' NOR ' }
    ]
  },
  {
    title: 'Special Gates',
    buttons: [
      { label: 'XOR', insert: ' XOR ' },
      { label: 'XNOR', insert: ' XNOR ' }
    ]
  },
  {
    title: 'Brackets & Constants',
    buttons: [
      { label: '(', insert: '(' },
      { label: ')', insert: ')' },
      { label: '0', insert: '0' },
      { label: '1', insert: '1' }
    ]
  }
];

type Props = {
  onInsert: (text: string) => void;
};

export function GateButtonPanel({ onInsert }: Props) {
  const clearExpression = useAppStore((state) => state.clearExpression);
  const backspaceAtCursor = useAppStore((state) => state.backspaceAtCursor);

  return (
    <CollapsiblePanel id="gates" title="Gate Button Panel" subtitle="Insert gates without keyboard symbols." icon={<Keyboard size={20} />}>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{group.title}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.buttons.map((button) => (
                <GateButton
                  key={button.label}
                  label={button.label}
                  insert={button.insert}
                  hint={'hint' in button ? button.hint : undefined}
                  onClick={(value) => value && onInsert(value)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Editing Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <GateButton label="Backspace" onClick={backspaceAtCursor} variant="soft" hint="Delete one character before cursor" />
            <GateButton label="Clear" onClick={clearExpression} variant="danger" hint="Clear expression" />
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
