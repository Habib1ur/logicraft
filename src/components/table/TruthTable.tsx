import { useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';
import type { BooleanValue, OutputFormat, TruthTableResult } from '../../types';
import { CollapsiblePanel } from '../panels/CollapsiblePanel';

interface TruthTableProps {
  table?: TruthTableResult;
  outputFormat: OutputFormat;
  rowsPerPage: number;
  showIntermediateColumns: boolean;
}

export function formatOutput(value: BooleanValue, format: OutputFormat): string {
  return format === 'boolean' ? (value ? 'True' : 'False') : String(value);
}

export function TruthTable({ table, outputFormat, rowsPerPage, showIntermediateColumns }: TruthTableProps) {
  const [page, setPage] = useState(0);

  const pageCount = table ? Math.max(1, Math.ceil(table.rows.length / rowsPerPage)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = useMemo(() => {
    if (!table) return [];
    const start = safePage * rowsPerPage;
    return table.rows.slice(start, start + rowsPerPage);
  }, [safePage, rowsPerPage, table]);

  if (!table) {
    return (
      <CollapsiblePanel id="table" title="Truth Table" description="Generated rows will appear here" icon={<Table2 size={20} />}>
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Enter an expression and generate the truth table.
        </div>
      </CollapsiblePanel>
    );
  }

  const intermediateColumns = showIntermediateColumns ? table.intermediateColumns : [];
  const headers = [...table.variables, ...intermediateColumns.map((column) => column.label), 'F'];

  return (
    <CollapsiblePanel id="table" title="Truth Table" description={`${table.rows.length} row(s), ${headers.length} column(s)`} icon={<Table2 size={20} />}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-slate-950">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Expression: {table.expression}</p>
            <p className="muted-text">Variables: {table.variables.join(', ') || 'none'}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900" type="button" disabled={safePage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
              Previous
            </button>
            <span>
              Page {safePage + 1} / {pageCount}
            </span>
            <button className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900" type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
              Next
            </button>
          </div>
        </div>

        <div className="pretty-scrollbar overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-max border-collapse text-sm" aria-label="Generated truth table">
            <thead>
              <tr className="bg-slate-100 text-left dark:bg-slate-950">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={`border-b border-slate-200 px-4 py-3 font-black text-slate-700 dark:border-slate-800 dark:text-slate-200 ${index === headers.length - 1 ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.index} className="odd:bg-white even:bg-slate-50/80 dark:odd:bg-slate-900 dark:even:bg-slate-950/60">
                  {table.variables.map((variable) => (
                    <td key={`${row.index}-${variable}`} className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                      {formatOutput(row.values[variable], outputFormat)}
                    </td>
                  ))}
                  {intermediateColumns.map((column) => (
                    <td key={`${row.index}-${column.key}`} className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      {formatOutput(row.intermediates[column.key] ?? row.output, outputFormat)}
                    </td>
                  ))}
                  <td className="border-b border-indigo-100 bg-indigo-50 px-4 py-3 font-black text-indigo-700 dark:border-indigo-950 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {formatOutput(row.output, outputFormat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
