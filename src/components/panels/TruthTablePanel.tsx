import { Table2 } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { TruthTable } from '../table/TruthTable';
import { useAppStore } from '../../store/useAppStore';
import type { TruthTableResult } from '../../types';

type Props = {
  table?: TruthTableResult;
};

export function TruthTablePanel({ table }: Props) {
  const settings = useAppStore((state) => state.settings);

  return (
    <CollapsiblePanel id="table" title="Truth Table" subtitle="Input combinations, intermediate columns, and final output." icon={<Table2 size={20} />}>
      {table ? (
        <TruthTable table={table} showIntermediate={settings.showIntermediate} outputFormat={settings.outputFormat} rowsPerPage={settings.maxRowsPerPage} />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Enter a valid expression and click Generate.
        </div>
      )}
    </CollapsiblePanel>
  );
}
