import { FileJson, FileSpreadsheet, Files, Import, ClipboardCopy } from 'lucide-react';
import type { AppSettings, SavedProject, SimplificationResultType, TruthTableResult } from '../types';
import { copyToClipboard, downloadFile } from '../utils/storage';
import { truthTableToCsv, truthTableToText } from '../lib/truthTable';
import { formatOutput } from './table/TruthTable';

interface ExportImportToolsProps {
  table?: TruthTableResult;
  simplification?: SimplificationResultType;
  expression: string;
  settings: AppSettings;
  history: SavedProject['history'];
  onImport: (project: SavedProject) => void;
}

export function ExportImportTools({ table, simplification, expression, settings, history, onImport }: ExportImportToolsProps) {
  const exportProject = () => {
    const project: SavedProject = { expression, settings, history };
    downloadFile('truthcraft-project.json', JSON.stringify(project, null, 2), 'application/json');
  };

  const exportCsv = () => {
    if (!table) return;
    downloadFile('truthcraft-truth-table.csv', truthTableToCsv(table, (value) => formatOutput(value, settings.outputFormat)), 'text/csv');
  };

  const exportJson = () => {
    if (!table || !simplification) return;
    downloadFile('truthcraft-solution.json', JSON.stringify({ table, simplification }, null, 2), 'application/json');
  };

  const exportText = () => {
    if (!table || !simplification) return;
    downloadFile('truthcraft-solution.txt', truthTableToText(table, simplification, (value) => formatOutput(value, settings.outputFormat)), 'text/plain');
  };

  const importProject = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as SavedProject;
    if (!parsed || typeof parsed.expression !== 'string') throw new Error('Invalid TruthCraft project JSON.');
    onImport(parsed);
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
          <Files size={20} />
        </div>
        <div>
          <h2 className="panel-title">Export & Import</h2>
          <p className="muted-text">CSV, JSON, clipboard, and full text solution</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button type="button" className="gate-tool-button" onClick={exportCsv} disabled={!table}><FileSpreadsheet size={16} /> CSV</button>
        <button type="button" className="gate-tool-button" onClick={exportJson} disabled={!table}><FileJson size={16} /> JSON</button>
        <button type="button" className="gate-tool-button" onClick={exportText} disabled={!table}><Files size={16} /> Full text</button>
        <button type="button" className="gate-tool-button" onClick={() => table && void copyToClipboard(truthTableToCsv(table, (value) => formatOutput(value, settings.outputFormat)))} disabled={!table}><ClipboardCopy size={16} /> Copy table</button>
        <button type="button" className="gate-tool-button" onClick={exportProject}><FileJson size={16} /> Project</button>
        <label className="gate-tool-button cursor-pointer">
          <Import size={16} /> Import
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              importProject(event.target.files?.[0]).catch((error: unknown) => alert(error instanceof Error ? error.message : 'Could not import project.'));
              event.currentTarget.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
