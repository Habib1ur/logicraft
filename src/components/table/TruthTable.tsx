import { useMemo, useState } from 'react';
import type { TruthTableResult } from '../../types';

type Props = {
  table: TruthTableResult;
  showIntermediate: boolean;
  outputFormat: 'binary' | 'boolean';
  rowsPerPage: number;
};

export function TruthTable({ table, showIntermediate, outputFormat, rowsPerPage }: Props) {
  const [page, setPage] = useState(0);
  const columns = useMemo(
    () => [...table.variables, ...(showIntermediate ? table.intermediateColumns : []), 'F'],
    [table.variables, table.intermediateColumns, showIntermediate]
  );
  const totalPages = Math.max(1, Math.ceil(table.rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = table.rows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const format = (value: boolean) => (outputFormat === 'binary' ? (value ? '1' : '0') : value ? 'True' : 'False');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {table.rows.length} rows · {table.variables.length} variable{table.variables.length === 1 ? '' : 's'} · mode: {table.mode}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="small-btn"
            disabled={safePage === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            aria-label="Previous truth table page"
          >
            Prev
          </button>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Page {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="small-btn"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            aria-label="Next truth table page"
          >
            Next
          </button>
        </div>
      </div>

      {table.warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {table.warning}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Generated truth table">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">#</th>
              {columns.map((column, index) => (
                <th
                  key={column + index}
                  className={`border-b border-slate-200 px-3 py-3 dark:border-slate-700 ${column === 'F' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' : ''}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleRows.map((row) => (
              <tr key={row.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                <td className="px-3 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{row.index}</td>
                {table.variables.map((variable) => (
                  <td key={`${row.index}-${variable}`} className="px-3 py-3 font-mono font-semibold text-slate-800 dark:text-slate-100">
                    {format(row.assignment[variable])}
                  </td>
                ))}
                {showIntermediate
                  ? table.intermediateColumns.map((column) => (
                      <td key={`${row.index}-${column}`} className="px-3 py-3 font-mono text-slate-700 dark:text-slate-200">
                        {format(Boolean(row.intermediates[column]))}
                      </td>
                    ))
                  : null}
                <td className="bg-indigo-50 px-3 py-3 font-mono font-black text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
                  {format(row.output)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
